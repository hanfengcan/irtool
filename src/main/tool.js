let rxBuf = Buffer.alloc(0)

const ecmd = {
  WORK: 0,
  MATE: 1, // 录码
  UPDATE: 2, // 下载码库到模块
  LOAD: 3, // 从模块读取码库
  SROM: 5, // 更新信息头
  SBM: 6, // 品牌型号
  SLIB: 9 // 设置码库
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
    buf[2] = 1 | (ecmd.UPDATE << 4) // x
    buf.writeInt32LE(index, 3) // index
    file.copy(buf, 7)
    buf.writeUInt16BE(crc16(file), 7 + file.length) // crc
    buf[9 + file.length] = 0x8E // 帧尾
    port.write(buf, 'hex')
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
      buf[2] = 0 // x
      buf[3] = ecmd.UPDATE
      buf[4] = 0x8E
      txbuf = Buffer.alloc(5)
      buf.copy(txbuf, 0, 0, 5)
      break
    case ecmd.SROM: // 更新库信息头
      buf[0] = 0xCF // 帧头
      buf[1] = 2 // l
      buf[2] = 0 // x
      buf[3] = ecmd.SROM
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
  while ((rxBuf[offset] !== 0xCF) && (offset = rxBuf.length)) {
    offset++
  }
  if (rxBuf[offset] === 0xCF) {
    len = rxBuf[offset + 1]
    // 获取到一个包
    if ((rxBuf.length >= len + offset + 3) && (rxBuf[offset + len + 2] === 0x8E)) {
      if ((rxBuf[offset + 2] & 0x0F) === 2) {
        switch (rxBuf[offset + 2] >> 4) { // x
          case ecmd.WORK:
            if (len === 2) {
              if (rxBuf[offset + 3] === 0) {
                // OK
                if (typeof (callb) === 'function') {
                  callb({state: true, wstate: ecmd.WORK})
                  rxBuf = Buffer.alloc(0)
                }
              } else if (rxBuf[offset + 3] === 0xFF) {
                // fail
                if (typeof (callb) === 'function') {
                  callb({state: false, wstate: ecmd.WORK})
                  rxBuf = Buffer.alloc(0)
                }
              } else {
                // 协议出错 log
                console.log('呵呵')
                rxBuf = Buffer.alloc(0)
              }
            }
            break
          case ecmd.UPDATE:
            if ((len === 2) && (rxBuf[offset + 3] === 0)) {
              // OK
              if (typeof (callb) === 'function') {
                callb({state: true, wstate: ecmd.UPDATE})
                rxBuf = Buffer.alloc(0)
              }
            } else if ((len === 6) && (rxBuf[offset + 3] === 0xFF)) {
              // fail CF L X DDDD 8E
              let index = rxBuf.readInt32LE(offset + 4)
              if (typeof (callb) === 'function') {
                callb({state: false, index: index, wstate: ecmd.UPDATE})
                rxBuf = Buffer.alloc(0)
              }
            } else {
              // 协议出错 log
              console.log('呵呵')
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
      rxBuf = Buffer.alloc(0)
    }
  }
}

export default { ecmd, crc16, sendpack, sendcmd, parsers }
