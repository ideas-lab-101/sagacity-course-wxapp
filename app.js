/**
 * 解决IOS版本过低出现的不兼容问题
 */
const { compatible } = require('./utils/compatibleIos')
compatible()

const User = require('./utils/user')
const Axios = require('./axios/axios')
const RequestManager = require('./utils/requestManager')
const DataStorageManager  = require( './utils/DataStorageManager')
const { equipmentStatus, checkVersion } = require('./utils/equipment')
const { checkVersionUpdate } = require('./utils/updateVersion')
const { networkChange } = require('./utils/network')
const BackgroundAudioManager = require('./controller/BackgroundAudioManager')
const EnrollController = require('./controller/EnrollController')

App({
  onLaunch: function (options) {
    console.log('App launch:', options)
    console.log(equipmentStatus())
    /**
     * 版本检测
     */
    checkVersion()
    /**
     * 检查程序更新
     */
    checkVersionUpdate()
    /**
     * 网络监听
     */
    networkChange()

    try {
      this.user.goLogin()
    }catch (e) {}
  },

  onShow: function(options) {
    console.log('App show:', options)
  },

  onHide: function () {
    console.log('App hide:')
  },

  onError: function (msg) {
    console.error('APP错误日志：', msg)
  },

  onPageNotFound(res) {
    console.error(res)
  },

  globalData: {
    /**
     * 移动设备基本信息
     */
    equipment: equipmentStatus(),





    qiNiuToken: '',
    systemSeries: null
  },


  version: '3.0.0',
  user: new User(), // 登录验证
  request: Axios.axios, // 数据请求封装
  requestManager: new RequestManager(), // 请求更新管理器
  dataStorageManager: new DataStorageManager(), // 资料库  缓存数据
  backgroundAudioManager: new BackgroundAudioManager(), // 背景音管理器
  enrollController: new EnrollController(), // 管理所有被加入的课程 实现页面渲染
})
