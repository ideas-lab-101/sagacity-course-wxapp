const { $wuLoading, $wuNavigation } = require('../../../components/wu/index')
const App = getApp()
const { getInfoContent } = require('../../../request/infoPort')
const WxParse = require('../../../components/wxParse/wxParse')

Page({
    data: {
      nav: {
        title: '',
        model: 'extrude',
        transparent: false,
        animation: {
          duration: 1000,
          timingFunction: "linear"
        }
      },

      /**
       * 数据
       */
      info: ''
    },

    onLoad: function (options) {
        this._initData(options.id)
    },

    onShow: function () {
    },

    onPageScroll: function (e) {
      $wuNavigation().scrollTop(e.scrollTop)
    },
    /**
     *
     * 内部数据获取事件
     * ***/
    _initData: function (id) {
        getInfoContent({infoId: id}).then((res) => {
          if(res.data.ContentType === 'url') {
            this.setData({
              webViewUrl: res.data.Content
            })
          }else if(res.data.ContentType === 'html') {
            this.setData({info: res.data, 'nav.title': res.data.Title})
            // 文稿编译
            WxParse.wxParse('detail', 'html', res.data.Content || '<p style="font-size: 14px;">暂无介绍</p>', this, 5)
          }
        })
    }

})
