const App = getApp()
const { $wuNavigation } = require('../../../../components/wu/index')
const { getEnrollList } = require('../../../../request/userPort')
const PageReachBottomBehavior = require('../../../../utils/behaviors/PageReachBottomBehavior')

Page({
    behaviors: [PageReachBottomBehavior],
    data: {},

    onLoad: function () {

      this.__init()
    },

    onReachBottom: function () {
      this.__ReachBottom()
    },

    onPageScroll: function (e) {
      $wuNavigation().scrollTop(e.scrollTop)
    },

    __init () {
      this.__getTurnPageDataList({
        isPageShow: true,
        interfaceFn: getEnrollList,
        params: {}
      })
    },

    goCoursePage(e) {
      const { id } = e.currentTarget.dataset
      wx.navigateTo({
        url: `/pages/apply/course/lesson-page/lesson-page?id=${id}`
      })
    }
})
