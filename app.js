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
const Audio = require('./controller/audio')

App({
  onLaunch: function (options) {
    console.log('App launch:', options)
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

    userInfo: {},
    audio: new Audio(),
    qiNiuToken: '',
    bachgroundSound: null,
    systemSeries: null,
    deviceHeight: 0,
    deviceWidth: 0,
    deviceStatusBarHeight: 0
  },


  version: '3.0.0',
  user: new User(), // 登录验证
  request: Axios.axios, // 数据请求封装
  requestManager: new RequestManager(), // 请求更新管理器
  dataStorageManager: new DataStorageManager(), // 资料库  缓存数据
})
