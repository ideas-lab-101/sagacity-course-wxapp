const App = getApp()
import {userFavor, userLike, getUserInfo, getRecordList} from '../../../../request/userPort'
import { getCourseList } from '../../../../request/coursePort'
const MultiplePageReachBottomBehavior = require('../../../../utils/behaviors/MultiplePageReachBottomBehavior')
const AppLaunchBehavior = require('../../../../utils/behaviors/AppLaunchBehavior')
const Toast = require('../../../../viewMethod/toast')

Page({
  behaviors: [MultiplePageReachBottomBehavior, AppLaunchBehavior],
  data: {
    info: null
  },

  onLoad: function(options) {
    this.optionsId = options.id

    this.__initAppLaunch()
  },

  onShareAppMessage: function() {
    return {
      title: this.data.info.data.nick_name,
      path: `/pages/apply/mine/user-page/user-page?id=${this.optionsId}`
    }
  },

  __init() {
    this.getUserInfo()

    const params = [
      {
        isPageShow: true,
        interfaceFn: getRecordList,
        params: {
          userId: this.optionsId,
          blnPublic: 1
        }
      },
      {
        isPageShow: true,
        interfaceFn: getCourseList,
        params: {
          userId: this.optionsId
        }
      }
    ]

    this.__getTurnPageDataListMultiple(params)
  },

  /**
   * 内部调用事件
   * */

  collectEvent: function() { // 收藏事件
    userFavor({
        dataId: this.optionsId,
        type: 'user'
      })
        .then((res) => {
          this.setData({ 'info.is_favor': res.data.is_favor })
          Toast.text({ text: res.msg })
        })
  },

  likeEvent: function() {
    userLike({
      dataId: this.optionsId,
      type: 'user'
    })
        .then((res) => {
          this.setData({
            'info.is_like': true
          })
        })
  },

  getUserInfo: function() {
    getUserInfo({
        userId: this.optionsId
      })
        .then((res) => {
          this.setData({ info: res.data })
        })
  },

  scrollToLowerEvent: function (e) {
    this.__ReachBottomMultiple()
  }
})