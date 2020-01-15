const App = getApp()
const { $wuNavigation } = require('../../../../components/wu/index')

Page({
    data: {
      courseList: []
    },

    onLoad: function () {
    },

    onShow: function () {
    },

    onPageScroll: function (e) {
      $wuNavigation().scrollTop(e.scrollTop)
    },

    // 自定义事件
    slideChangeEvent: function (e) {
    }

})
