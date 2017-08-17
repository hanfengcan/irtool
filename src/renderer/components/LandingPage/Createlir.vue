<template>
  <div class="main">
    <el-row class="button">
      <div>
        <el-button type="primary">测试</el-button>
        <el-button type="primary">测试</el-button>
        <el-button type="primary">测试</el-button>
      </div>
    </el-row>
    <el-row class="fileSelect">
    
    </el-row>
    <el-row class="carousel ">
      <el-carousel :interval="4000" type="card" height="200px" :autoplay="false">
        <el-carousel-item v-for="item in irbin" :key="irbin.id">
          <div>{{ item.text }}</div>
        </el-carousel-item>
      </el-carousel>
    </el-row>
  </div>
</template>

<script>
  // import { ipcRenderer } from 'electron'

  export default {
    data: function () {
      return {
        irbin: [
          { id: 1, text: '测试1' },
          { id: 2, text: '测试2' },
          { id: 3, text: '测试3' },
          { id: 4, text: '测试4' }
        ]
      }
    }
  }
</script>

<style scoped>
  .main {
    // background: #AAAAAA;
    padding: 10px 0px;
    height: 100%;    
  }

  .button {
    margin: 4px 0;
  }

  .fileSelect {

  }

  .carousel {
    margin: 4px 0;
  }

  .el-carousel__item {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 200px;
    margin: 0;
    text-align: center;
  }

  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }
  
  .el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
  }  
</style>
