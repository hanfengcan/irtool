<template>
  <div id="wrapper">
    <el-row :gutter="6" class="main">
      <el-col :xs="5" :sm="3" :md="3" :lg="2" class="menu-left">
        <el-menu default-active="1" @select="handleSelect" theme="dark">
          <div class="logo-layout"></div>
          <el-menu-item index="1">导航一</el-menu-item>
          <el-menu-item index="2">导航二</el-menu-item>
          <el-menu-item index="3">导航三</el-menu-item>
        </el-menu>      
      </el-col>
      <el-col :xs="19" :sm="21" :md="21" :lg="22" class="main-right">
        <div class="header-layout"><HeaderHint></HeaderHint></div>
        <div class="main-content-layout">
          <UpdateIrLib v-show="uilShow"></UpdateIrLib>
          <MyTemplate v-show="tShow"></MyTemplate>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  // import SystemInformation from './LandingPage/SystemInformation'
  import HeaderHint from './LandingPage/HeaderHint'
  import UpdateIrLib from './LandingPage/UpdateIrLib'

  import MyTemplate from './LandingPage/MyTemplate'

  export default {
    name: 'landing-page',
    components: { HeaderHint, UpdateIrLib, MyTemplate },
    data: function () {
      return {
        uilShow: true,
        tShow: false
      }
    },
    methods: {
      handleSelect (key, keyPath) {
        switch (key) {
          case '1':
            this.uilShow = true
            this.tShow = false
            break
          case '2':
            this.uilShow = false
            this.tShow = true
            break
          default:
            this.uilShow = true
            this.tShow = false
            break
        }
      }
    }
  }
</script>

<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: "Microsoft YaHei","Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB",Arial,sans-serif; }

  #wrapper {
    height: 100vh;
    width: 100vw;
    padding: 10px;
  }
  
  .logo-layout 
  {
    width: 90%;
    height: 30px;
    background: #5b6270;
    border-radius: 3px;
    margin: 15px auto;    
  }

  .main-content-layout
  {
    padding: 4px;
    background: #EFF2F7;
    border-radius: 4px;
    height: calc(100% - 64px);
    margin-top: 1px;
  }

  .header-layout
  {
    // height: 60px;
    background: #EFF2F7;
    border-radius: 4px;
    padding: 4px;
    margin-bottom: 1px;
  }

  .main
  { 
    height: 100%;
  }

  .menu-left
  {
    background: #1F2D3D;
    height: 100%;
    // min-width: 100px;
  }  

  .main-right 
  {
    height: 100%
  }
</style>
