import fs from 'fs'
import path from 'path'
// const fs = require('fs')
// const path = require('path')

const binpath = 'irbin'

let flist = []

function createFolder () {
  try {
    fs.accessSync(path.join('.', binpath))
  } catch (error) {
    fs.mkdirSync(path.join('.', binpath))
  }
}

function getfile (p) {
  fs.readdir(p, (err, files) => {
    if (err) throw err
    files.forEach((file) => {
      fs.stat(path.join(p, file), (err, state) => {
        if (err) throw err
        if (state.isDirectory()) {
          getfile(path.join(p, file))
        } else if (state.isFIFO()) {
          flist.push(path.join(file))
        }
      })
    })
  })
}

function getfileSync (p) {
  if (p === binpath) {
    flist = []
  }
  fs.readdirSync(p).forEach((files) => {
    let state = fs.statSync(path.join(p, files))
    if (state.isDirectory()) {
      getfileSync(path.join(p, files))
    } else if (state.isFile()) {
      flist.push({label: path.basename(p), file: files})
    }
  })
  return flist
}

export default { binpath, createFolder, getfile, getfileSync }
