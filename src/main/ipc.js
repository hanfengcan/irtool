import { ipcMain, dialog } from 'electron'
import fs from 'fs'
import usart from './usart'
import tool from './tool'

let port = null
// let porte = null
let parsersCB = null // 接收回调

let lirfile = null // lir文件缓存
let lirfilestate = null // lir文件下载状态标志
let lirfileindex = 0
let lirfileall = 0

function ipcReg (w) {
  /* headerhint */
  // 打开串口按钮
  ipcMain.on('ComOpenClick', (e, arg) => {
    if (arg.state === true) {
      // porte = e
      port = new usart.Serialport(arg.com, Number(arg.br))
      // error
      port.on('error', (err) => {
        console.log('error: ', err)
      })
      // open
      port.on('open', () => {
        e.sender.send('rComOpenClick', {state: true})
      })
      // data
      port.on('data', (data) => {
        tool.parsers(data, parsersCB)
      })
      // disconnect
      port.on('disconnect', (err) => {
        console.log(err)
      })
      // close
      port.on('close', () => {
        e.sender.send('rComOpenClick', {state: false})
        // 清除各种状态缓存
        parsersCB = null
        lirfilestate = null
        lirfileindex = 0
      })
    } else {
      // porte = e
      port.close()
    }
  })
  /* headerhint end */
  /* updateirlib */
  // 打开窗口选择本地文件
  ipcMain.on('selectlirFile', (e, arg) => {
    let path = dialog.showOpenDialog(w, {properties: ['openfile'], filters: [{name: 'lir', extensions: ['lir']}]})
    if (path !== undefined) {
      path = path[0]
      fs.readFile(path, (err, data) => {
        if (!err) {
          lirfile = data
          lirfileall = lirfile.length % 64 === 0 ? lirfile.length / 64 : lirfile.length / 64 + 1
          e.returnValue = path
        } else {
          e.returnValue = '加载文件失败'
        }
      })
    } else {
      e.returnValue = ''
    }
  })
  // 更新信息头
  ipcMain.on('ROMClick', (e) => {
    // 修改接收回调
    parsersCB = function (arg) {
      console.log('callback rom')
      if (arg.wstate === tool.ecmd.WORK) {
        if (arg.state === true) {
          e.sender.send('rROMClick', {state: true, msg: '修改信息头:\t\tOK'})
        } else if (arg.state === false) {
          e.sender.send('rROMClick', {state: false, msg: '修改信息头:\t\tFail'})
        } else {
          dialog.showErrorBox('!错误!', '更新信息头过程出现未知错误')
        }
      } else {
        e.sender.send('rROMClick', {state: false, msg: '协议出错: \t\t非work'})
      }
    }
    tool.sendcmd(port, tool.ecmd.SROM)
  })
  // 下载lir文件
  ipcMain.on('lirDownload', (e) => {
    if (lirfile && lirfile.length) {
      e.sender.send('rlirDownload', {loading: true, msg: '准备下载文件了'})
      // 启动文件下载状态机
      lirfilestate = 0
      parsersCB = function (arg) {
        switch (lirfilestate) {
          case 0:
            if (arg.state === true) {
              e.sender.send('rlirDownload', {loading: true, msg: '状态:\t\tupdate'})
              // 发送第一个分包
              let fbuf
              if (lirfile.length > 64) {
                fbuf = Buffer.alloc(64)
                lirfile.copy(fbuf, 0, 0, 64)
              } else {
                fbuf = Buffer.alloc(lirfile.length)
                lirfile.copy(fbuf, 0, 0, lirfile.length)
              }
              lirfileindex = 0
              tool.sendpack(port, fbuf, lirfileindex)
              lirfilestate = 1
            } else {
              e.sender.send('rlirDownload', {loading: false, msg: '不能切换成下载状态'})
            }
            break
          case 1:
            if (arg.state === true) {
              let loadper = lirfileindex / lirfileall * 100
              loadper = loadper.toFixed(1)
              e.sender.send('rlirDownload', {loading: true, msg: '成功:\t\t' + (lirfileindex + 1) + ' | ' + lirfileall, progress: loadper})
              lirfileindex++ // 指向下一个包
            } else {
              e.sender.send('rlirDownload', {loading: true, msg: '失败:\t\t' + '重发: ' + (lirfileindex + 1)})
            }
            if (lirfileindex < lirfileall) {
              // 继续发送下一个包
              let fbuf
              if (lirfile.length - lirfileindex * 64 > 64) {
                fbuf = Buffer.alloc(64)
                lirfile.copy(fbuf, 0, lirfileindex * 64)
              } else {
                fbuf = Buffer.alloc(lirfile.length - lirfileindex * 64)
                lirfile.copy(fbuf, 0, lirfileindex + 64)
              }
              tool.sendpack(port, fbuf, lirfileindex)
            } else {
              // 切换成工作状态
              lirfilestate = 2
              tool.sendcmd(port, tool.ecmd.UPDATE)
            }
            break
          case 2:
            if (arg.state === true) {
              // 切换成功
              e.sender.send('rlirDownload', {loading: false, msg: '下载码库完成, 点击 ROM 后即可使用新库', progress: 100})
            } else {
              // 切换失败
              e.sender.send('rlirDownload', {loading: false, msg: '下载码库完成, 切换状态失败', progress: 100})
            }
            lirfilestate = 3
            break
          default:
            break
        }
      }
      tool.sendcmd(port, tool.ecmd.UPDATE)
      /* 状态机结束 */
    } else {
      e.sender.send('rlirDownload', {loading: false, msg: '这是个空文件啊'})
    }
  })
  /* updateirlib end */
  // 广播
  ipcMain.on('broadcast', (e, arg) => {
    e.sender.send('rBroadcast', arg)
  })
}

export default { ipcReg }
