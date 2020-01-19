const App = getApp()
import { $wuNavigation } from '../../../../components/wu/index'
import { getInfoList } from '../../../../request/infoPort'
const Toast = require('../../../../viewMethod/toast')
const Session = require('../../../../utils/session')

Page({
    data: {
      controlFix: true,
      documents: []
    },

    onLoad: function () {
      try {
        const value = Session.getUserHistory()
        if (value === 1) {
          this.setData({
            controlFix: false
          })
        }
      } catch (e) {}
      this._getInfoList()
    },

    onShow: function () {
    },

    onPageScroll: function (e) {
      $wuNavigation().scrollTop(e.scrollTop)
    },

    // 自定义事件
    goToGuidesEvent: function (e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/common/documents/documents?id=${id}`
        })
    },

    controlFixEvent: function (e) {
        this.setData({
            controlFix: e.detail.value
        })
        let temp = '不显示历史记录'
        let his = 1
        if (e.detail.value) {
            temp = '显示历史记录'
            his = 0
        }
        Toast.text({ text: temp})
        Session.setUserHistory(his)
    },

    goContactEvent: function (e) {
        console.log(e)
    },
  /**
   * 获取文档列表
   * @private
   */
    _getInfoList: function () {
      getInfoList({
        channelID: 2
      }).then((res) => {
        this.setData({documents: res.list})
      })
    }

})
