<template>
  <div class="ulmain">
    <el-row>
      <el-input placeholder="选择要下载的文件"
        v-model="filepath"
        :readonly="true"
        class="ulpath">
      </el-input>
      <el-button type="primary" @click="fileSelect">选择文件</el-button>
    </el-row>
    <el-row style="margin: 4px 0px; height: calc(100% - 70px);">
      <el-input
        class="ulloadtext"
        type="textarea"
        resize=none
        v-model="output">
      </el-input>
      <div>
        <el-button type="primary" class="ulfButton" @click="updateRom">ROM</el-button>
      </div>     
    </el-row>
    <el-row>
      <el-progress :text-inside="true" :stroke-width="24" :percentage="loadper" status="success" class="ulprogress"></el-progress>
      <el-button type="primary" @click="loadFile">下载文件</el-button>
    </el-row>        
  </div>
</template>

<script>
  import { ipcRenderer } from 'electron'

  let tag = {
    filepath: '',
    loadper: 0,
    output: '',
    ostate: false,
    comuse: false
  }

  export default {
    data: function () {
      return tag
    },
    methods: {
      // 选择一个文件
      fileSelect () {
        this.filepath = ipcRenderer.sendSync('selectlirFile')
      },
      // 下载文件
      loadFile () {
        // ipcRenderer.send('getBinFile')
        if (this.ostate === true) {
          if (this.comuse === false) {
            this.output = ''
            this.loadper = 0
            ipcRenderer.send('lirDownload')
          } else {
            this.$message({
              message: '串口在忙',
              type: 'warning',
              showClose: true,
              duration: 5000
            })
          }
        } else {
          this.$message({
            message: '串口没打开',
            type: 'warning',
            showClose: true,
            duration: 5000
          })
        }
      },
      // 更新信息头
      updateRom () {
        if (this.ostate === true) {
          if (this.comuse === false) {
            this.comuse = true
            ipcRenderer.send('ROMClick')
          } else {
            this.$message({
              message: '串口在忙',
              type: 'warning',
              showClose: true,
              duration: 5000
            })
          }
        } else {
          this.$message({
            message: '串口没打开',
            type: 'warning',
            showClose: true,
            duration: 5000
          })
        }
      }
    }
  }
  // 获取串口开关状态
  ipcRenderer.on('rComOpenClick', function (e, arg) {
    if (arg.state === true) {
      tag.ostate = true
    } else {
      tag.ostate = false
      tag.comuse = false
    }
  })
  // 更新ROM回复
  ipcRenderer.on('rROMClick', function (e, arg) {
    if (typeof (arg.state) === typeof (true)) {
      tag.comuse = false
      tag.output = arg.msg + '\n' + tag.output
    }
  })
  // 下载文件
  ipcRenderer.on('rlirDownload', function (e, arg) {
    if (arg.loading === true) {
      tag.comuse = true
      tag.output = arg.msg + '\n' + tag.output
      if (arg.progress) {
        tag.loadper = Number(arg.progress)
      }
    } else if (arg.loading === false) {
      tag.comuse = false
      tag.output = arg.msg + '\n' + tag.output
      if (arg.progress) {
        tag.loadper = Number(arg.progress)
      }
    }
  })

  ipcRenderer.on('rGetBinFile', function (e, arg) {
    if (arg.bin) {
      // tag.output = arg.bin
      tag.output = ''
      arg.bin.forEach((str) => {
        tag.output += (str.toString() + '\n')
      })
    }
  })
</script>

<style>
  .ulmain {
    // background:#E0E0E0;
    padding: 10px 0px;
    height: 100%;
  }

  .ulpath {
    width: calc(100% - 94px);
    float: left;
    margin-right: 4px;
  }

  .ulprogress {
    width: calc(100% - 94px);
    float: left;
    margin: 6px 4px 6px 0px;   
  }

  .ulloadtext {
    width: calc(100% - 94px);
    height: 100%;
    float: left;
    margin-right: 4px;
  }

  .el-textarea__inner {
    height: 100%;
  }

  .ulfButton {
    width: 88px;
    margin-button:8px;
  }
</style>
