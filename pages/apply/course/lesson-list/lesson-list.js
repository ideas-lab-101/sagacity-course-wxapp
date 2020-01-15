const App = getApp()
const { GetCourseList } = require('../../../../request/coursePort')
const { $wuPlayWidget } = require('../../../../components/wu/index')

Page({
    data: {
        pager: {
          lastPage: true,
          pageNumber: 1,
        },
        lessons: []
    },

    onLoad: function (options) {
        this._initData()
    },

    onShow: function () {
      $wuPlayWidget().show()
    },

    onHide: function() {
    },

    onReachBottom: function () {
        if (this.data.pager.lastPage) {
            return false
        }
        this.data.pager.pageNumber++
        this._initData()
    },

    _initData: function() {
        GetCourseList({
              page: this.data.pager.pageNumber,
              typeID: 0
        }).then((res) => {
            this.setData({
              'pager.lastPage': res.lastPage,
              'pager.pageNumber': res.pageNumber,
              lessons: this.data.lessons.concat(res.list)
            })
        })
    }
})