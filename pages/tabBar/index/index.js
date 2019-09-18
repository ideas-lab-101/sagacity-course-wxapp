const App = getApp()

Page({
    data: {
    },

    onLoad: function (options) {
        /**
         * 请求数据
         **/
        //this._initData()
    },

    onShow: function () {
        /**
       * 请求历史数据
       **/
       /* if(App.user.ckLogin()) {
          this.getHistoryData()
        }
        $wuPlayWidget().show(App.globalData.audio.getPlayer())*/
    },

    onReady() {
    },

    onHide: function() {
    },

    onPullDownRefresh: function() {

    },

    onShareAppMessage: function () {
        return {
            title: '晓得Le',
            path: "pages/tabBar/index/index"
        }
    }

})
