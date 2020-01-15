const App = getApp()
const { $wuNavigation } = require('../../../../components/wu/index')
const { getEnrollList } = require('../../../request/userPort')

Page({
    data: {
      pager: {
        lastPage: true,
        pageNumber: 1
      },
      courseList: []
    },

    onLoad: function () {
      this._initData()
    },

  _initData: function () {
    this.isLoading = true
    getEnrollList({page: this.data.pager.pageNumber }).then((res) => {
      console.log(res)
      this.isLoading = false
      this.setData({
        'pager.lastPage': res.lastPage,
        courseList: this.data.courseList.concat(res.list)
      })
    })
  },

  onReachBottom: function () {
    if (this.data.lastPage ||  this.isLoading) {
      return false
    }
    this.setData({
      "pager.pageNumber": this.data.pager.pageNumber + 1
    })
    this._initData()
  },

    onShow: function () {
    },

    onPageScroll: function (e) {
      $wuNavigation().scrollTop(e.scrollTop)
    }
})
