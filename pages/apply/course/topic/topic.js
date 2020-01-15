const App = getApp()
const { $wuNavigation } = require('../../../../components/wu/index')
const { getTopicInfo } = require('../../../../request/topicPort')
const WxParse = require('../../../../components/wxParse/wxParse')

Page({
  data: {
    nav: {
      title: "",
      model: 'fold',
      transparent: true
    },

    floatingButton: {
      position: 'bottomRight',
      theme: 'light',
      buttons: [
        {
          label: '收藏',
          icon: 'iconfont icon-aixin1',
        },
        {
          openType: 'share',
          label: '分享',
          icon: 'iconfont icon-fenxiang4',
        }
      ]
    },

    /**
     * * 详情 数据
     **/
    info: {}
  },

  onLoad: function (options) {
    this.optionsId = options.id
    this.getTopicContent()
  },

  onShow: function () {
  },

  onPageScroll: function (e) {
    $wuNavigation().scrollTop(e.scrollTop)
  },

  onHide: function() {
  },

  onShareAppMessage: function () {
    return {
      title: this.data.info.TopicName,
      imageUrl: this.data.info.LogoURL,
      path: `/pages/apply/course/topic/topic?id=${this.optionsId}`,
      success: (ret) => {}
    }
  },

  // 自定义事件
  /**
   * 链接事件
   **/
  userFavorEvent(callback) { // 用户收藏
    userFavor({
      dataID: this.optionsId,
      type: 'topic'                 // (activity|course|match|info)
    }).then((res) => {
      callback && callback(res)
    })
  },

  /**
   * 获取数据
   **/
  getTopicContent() { // 拉取活动信息
    getTopicInfo({
      topicID: this.optionsId
    }).then((res) => {
      this.setData({info: res.topicInfo})
      // 文稿编译
      WxParse.wxParse('detail', 'html', res.topicInfo.Content || '<p style="font-size: 14px;">暂无介绍</p>', this, 5)
    })
  }

})