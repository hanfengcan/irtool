<template>
  <div class="main">
    <el-row>
      <div class="label">{{ text }}</div>
      <el-select v-model="comValue" placeholder="COM" @visible-change="getComList">
        <el-option
          v-for="item in comOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>     
      <el-select v-model="brValue" placeholder="波特率">
        <el-option
          v-for="item in brOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>          
      <el-button type="primary" v-model="open" @click="switchChange" class="open">{{ ostate }}</el-button>
    </el-row>  
  </div>
</template>

<script>
  import Serialport from 'serialport'
  import { ipcRenderer } from 'electron'

  let tag = {
    text: 'Hello',
    // port: '',
    // 串口开关
    ostate: '打开',
    open: false,
    // 波特率
    brOptions: [{value: '38400', label: '38400'},
    {value: '115200', label: '115200'},
    {value: '9600', label: '9600'}],
    brValue: null,
    // com口
    comOptions: '',
    comValue: null
  }

  export default {
    data: function () {
      return tag
    },
    methods: {
      switchChange () {
        if (this.open === false) {
          if (this.comValue !== null && this.brValue !== null) {
            ipcRenderer.send('ComOpenClick', {state: true, com: this.comValue, br: this.brValue})
          } else {
            this.$message({
              message: '请先选择串口和波特率',
              type: 'warning',
              showClose: true,
              duration: 5000
            })
          }
        } else {
          ipcRenderer.send('ComOpenClick', {state: false})
        }
      },
      getComList (arg) {
        if (arg === true) {
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
          this.comOptions = list
        } else {

        }
      }
    }
  }
  ipcRenderer.on('rComOpenClick', function (e, arg) {
    if (arg.state === true) {
      tag.open = true
      tag.ostate = '关闭'
    } else {
      tag.open = false
      tag.ostate = '打开'
    }
  })
</script>

<style scoped>
  .main {
    padding: 10px 0px;
    height: 100%;
  }

  .el-select {
    max-width: 100px;
  }

  .label {
    width: calc(100% - 302px);
    float: left;
    margin-right: 2px;
    margin-left: 2px;
    // font-size: 24px;
    padding: 6px 0;
    height: 36px;
    // background: #aaa;
  }

  .open {
    width: 88px;
  }
</style>
