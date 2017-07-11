'use strict'

import Serialport from 'serialport'

function getComList () {
  let list = []
  Serialport.list()
    .then((ports) => {
      ports.forEach((port) => {
        list.push({value: port.comName, label: port.comName})
      })
    })
    .catch((err) => {
      console.log('list err: ', err)
    })
  return list
}

export default { Serialport, getComList }
