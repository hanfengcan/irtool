import fs from 'fs'
import path from 'path'

const fpath = path.resolve()

fs.readdirSync(fpath, (err, files) => {
  if (err) {
    console.log(err)
  }
})
