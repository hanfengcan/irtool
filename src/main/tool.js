let rxBuf = Buffer.alloc(0)

const ecmd = {
  WORK: 0,
  MATE: 1, // 录码
  UPDATE: 2, // 下载码库到模块
  LOAD: 3, // 从模块读取码库
  FWORK: 4, // 强制变成WORK
  // --------------------
  ROM: 5, // 更新信息头
  BMS: 6, // 遥控器
  BMI: 7, // 遥控器 index
  // --------------------
  RROM: 8, // 读信息头
  RBMS: 9, // 读遥控器
  RBMI: 10, // 读遥控器 index
  // --------------------
  TST: 11
}

const emode = {
  ESET: 0,  // 设置
  WORK: 1,  // 工作
  MATE: 2,  // 录码
  UPDATE: 3,  // 下载码库
  LOAD: 4,  // 拉取码库
  LEARN: 5
}

function crc16 (buf) {
  let crcreg = 0
  let current = 0
  for (let i = 0; i < buf.length; i++) {
    current = (buf[i] & 0x000000FF) << 8
    for (let j = 0; j < 8; j++) {
      if ((crcreg ^ current) & 0x8000) {
        crcreg = (crcreg << 1) ^ 0x1021
      } else {
        crcreg <<= 1
      }
      crcreg &= 0x0000FFFF
      current <<= 1
    }
  }
  return crcreg
}

// 发送一个文件分包
function sendpack (port, data, index) {
  let result = true
  let buf = Buffer.alloc(data.length + 10)
  let file = Buffer.from(data)
  if (file.length <= 64) {
    buf[0] = 0xCF // 帧头
    buf[1] = 1 + 4 + file.length + 2 // l
    // buf[2] = 1 | (ecmd.UPDATE << 4) // x
    buf[2] = 0x80 | emode.UPDATE
    buf.writeInt32LE(index, 3) // index
    file.copy(buf, 7)
    buf.writeUInt16BE(crc16(file), 7 + file.length) // crc
    buf[9 + file.length] = 0x8E // 帧尾
    port.write(buf, 'hex')
    // console.log('index = ', index)
  } else {
    result = false
  }
  return result
}

// 发送设置命令
function sendcmd (port, cmd) {
  let result = true
  let buf = Buffer.alloc(16)
  let txbuf
  switch (cmd) {
    case ecmd.UPDATE: // 更新模块flash
      buf[0] = 0xCF // 帧头
      buf[1] = 2 // l
      buf[2] = 0x80 // x
      buf[3] = ecmd.UPDATE
      buf[4] = 0x8E
      txbuf = Buffer.alloc(5)
      buf.copy(txbuf, 0, 0, 5)
      break
    case ecmd.ROM: // 更新库信息头
      buf[0] = 0xCF // 帧头
      buf[1] = 2 // l
      buf[2] = 0x80 // x
      buf[3] = ecmd.ROM
      buf[4] = 0x8E
      txbuf = Buffer.alloc(5)
      buf.copy(txbuf, 0, 0, 5)
      break
    default:
      result = false
      break
  }
  if (result === true) {
    port.write(txbuf, 'hex')
  }
  return result
}

// 包分析 CF L X D 8E
function parsers (data, callb) {
  let offset = 0
  let len = 0
  let temp = Buffer.concat([rxBuf, data], rxBuf.length + data.length)
  rxBuf = temp
  while ((rxBuf[offset] !== 0xCF) && (offset < rxBuf.length)) {
    offset++
  }
  // console.log('rxbuf: ', rxBuf)
  // 帧头 && 长度 && 够长
  if ((rxBuf[offset] === 0xCF) && (rxBuf.length - offset > 1) && (rxBuf.length >= rxBuf[offset + 1] + offset + 3)) {
    len = rxBuf[offset + 1]
    // 获取到一个包
    if (rxBuf[offset + len + 2] === 0x8E) {
      if ((rxBuf[offset + 2] & 0xC0) === 0x00) {
        switch (rxBuf[offset + 2] & 0x3F) { // x
          case emode.ESET:
            // OK
            if (typeof (callb) === 'function') {
              callb({state: true, wstate: emode.ESET})
              rxBuf = Buffer.alloc(0)
            }
            break
          case emode.WORK:
            // ok
            if (len === 1) {
              callb({state: true, wstate: emode.WORK})
              rxBuf = Buffer.alloc(0)
            }
            break
          case emode.UPDATE:
            // OK
            if (typeof (callb) === 'function') {
              // console.log('rec')
              callb({state: true, wstate: emode.UPDATE})
              rxBuf = Buffer.alloc(0)
            }
            break
          default:
            rxBuf = Buffer.alloc(0)
            break
        }
      } else if ((rxBuf[offset + 2] & 0xC0) === 0x40) { // fail
        switch (rxBuf[offset + 2] & 0x3F) { // x
          case emode.ESET:
            // fail
            if (typeof (callb) === 'function') {
              callb({state: false, wstate: emode.ESET, errCode: rxBuf[offset + 3]})
              rxBuf = Buffer.alloc(0)
            }
            break
          case emode.WORK:
            // fail
            if (typeof (callb) === 'function') {
              callb({state: false, wstate: emode.WORK, errCode: rxBuf[offset + 3]})
              rxBuf = Buffer.alloc(0)
            }
            break
          case emode.UPDATE:
            // fail
            if (typeof (callb) === 'function') {
              callb({state: false, wstate: emode.UPDATE, errCode: rxBuf[offset + 3]})
              rxBuf = Buffer.alloc(0)
            }
            break
          default:
            rxBuf = Buffer.alloc(0)
            break
        }
      } else {
        // 协议出错 log
        console.log('不是回复指令')
        rxBuf = Buffer.alloc(0)
      }
    } else {
      console.log('包错误')
      debugger
      rxBuf = Buffer.alloc(0)
    }
  }
}

export default { ecmd, emode, crc16, sendpack, sendcmd, parsers }
