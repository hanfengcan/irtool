'use strict'

import { app, BrowserWindow } from 'electron'
// import path from 'path'
import ipc from './ipc.js'
import filetool from './filetool.js'
// import fs from 'fs'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    minHeight: 720,
    useContentSize: true,
    minWidth: 800
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  ipc.ipcReg(mainWindow)
  filetool.createFolder()
  // console.log(path.join(path.resolve(), filetool.binpath))
  // console.log('re: ', filetool.getfileSync(path.join(path.resolve(), filetool.binpath)))
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// process.on('unhandledRejection', (reason, p) => {
//   if (reason.message.indexOf('Invalid handle') !== -1) {
//   } else if (reason.message.indexOf('Access denied') !== -1) {
//     port.emit('disconnect', reason.message)
//   } else {
//     console.log(p, ' ', reason)
//   }
// })

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
