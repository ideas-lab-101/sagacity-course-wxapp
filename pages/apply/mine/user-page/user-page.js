const App = getApp()
import { userFavor, userLike, getUserInfo, getRecordList } from '../../../../request/userPort'
const { getCourseList } = require('../../../../request/coursePort')
const MultiplePageReachBottomBehavior = require('../../../../utils/behaviors/MultiplePageReachBottomBehavior')
const Toast = require('../../../../viewMethod/toast')

Page({
  behaviors: [MultiplePageReachBottomBehavior],
  data: {
    info: {},
    current: 0,
    record: {
      pageNumber: 1,
      lastPage: true,
      list: []
    },
    course: {
      pageNumber: 1,
      lastPage: true,
      list: []
    }
  },

  onLoad: function(options) {
    this.optionsId = options.id

    this.__init()
  },

  onShow: function() {
    if(App.accreditLogin) { // 重新加载数据
      App.accreditLogin = false
      this._initData(this.optionsId)
    }
  },

  onShareAppMessage: function() {
    return {
      title: this.data.info.data.NickName,
      path: `/pages/apply/mine/user-page/user-page?id=${this.optionsId}`
    }
  },

  __init() {
    this.getUserInfo(options.id)
    this._getRecordList()
    this._getCourseList()
  },

  /**
   * 内部调用事件
   * */

  collectEvent: function() { // 收藏事件
    userFavor(
      {
        data_id: this.optionsId,
        type: 'user'
      }).then((res) => {
      this.setData({
        'info.is_favor': res.is_favor
      })
      Toast.text({ text: txt })
    })
  },

  likeEvent: function() {
    userLike({
      data_id: this.optionsId,
      type: 'user'
    }).then((res) => {
      this.setData({
        'info.is_like': true
      })
    })
  },

  getUserInfo: function(id) {
    getUserInfo({
        userID: id
      })
        .then((res) => {
          this.setData({
            info: res
          })
        })
  },

  /**
   * list切换
   * @param e
   */
  detailChangeEvent: function (e) {
    const index = Number(e.currentTarget.dataset.index)
    this.setData({
      current: index
    })
  },

  scrollToLowerEvent: function (e) {
    if(this.data.current === 0) {
      if(this.data.record.lastPage || this.isLoading) {
        return false
      }
      this.data.record.pageNumber++
      this._getRecordList()
    }else if(this.data.current === 1) {
      if(this.data.course.lastPage || this.isLoadin) {
        return false
      }
      this.data.course.pageNumber++
      this._getCourseList()
    }
  },

  _getCourseList: function() {
    this.isLoading = true
    getCourseList({
      user_id: this.optionsId,
      page: this.data.course.pageNumber
    }).then((res) => {
      this.isLoading = false
      this.setData({
        'course.lastPage': res.lastPage,
        'course.list': this.data.course.list.concat(res.list)
      })
    })
  },

  _getRecordList: function() {
    this.isLoading = true

    getRecordList({
      user_id: this.optionsId,
      page: this.data.record.pageNumber,
      bln_public: 1
    }).then((res) => {
      this.isLoading = false
      this.setData({
        'record.lastPage': res.lastPage,
        'record.list': this.data.record.list.concat(res.list)
      })
    })
  }
})