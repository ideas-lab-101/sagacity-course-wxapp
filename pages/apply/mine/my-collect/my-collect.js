const App = getApp()
const { $wuNavigation } = require('../../../../components/wu/index')
const { getFavorList, userFavor } = require('../../../../request/userPort')
const { getObjectType } = require('../../../../request/systemPort')

Page({
    data: {
      favorType: [],
      current: 0,
      favors: {
          list: [],
          code: ''
      },
      pager: {
        lastPage: true,
        pageNumber: 1
      }
    },

    onLoad: function () {
      getObjectType().then((res) => {
            this.setData({
              favorType: res.list,
              'favors.code': res.list[this.data.current].ObjectCode
            })
        }).then(() => {
            this._initCollectList()
        })
    },

    onShow: function () {},

    onPageScroll: function (e) {
      $wuNavigation().scrollTop(e.scrollTop)
    },

    onReachBottom: function () {
        if (this.data.pager.lastPage || this.isLoading) {
            return false
        }
        this.setData({
            'pager.pageNumber': this.data.pager.pageNumber+1
        })
        this._initCollectList()
    },

    // 自定义事件
    cancelCollectEvent: function (e) {
        const id = e.currentTarget.dataset.id
        const type = e.currentTarget.dataset.type
        const index = e.currentTarget.dataset.index
        userFavor({dataID: id, type: type}).then((res) => {
            this.data.favors.list.splice(index, 1)
            this.setData({
                'favors.list': this.data.favors.list
            })
        })
    },

    changeTypeEvent: function (e) {
        const index = e.currentTarget.dataset.index
        const code = e.currentTarget.dataset.code
        this.setData({
            current: index,
            'favors.list': [],
            'favors.code': code,
            'pager.pageNumber': 1,
            'pager.lastPage': true
        })
        this._initCollectList()
    },

    _initCollectList: function () {
      this.isLoading = true
      getFavorList({page: this.data.pager.pageNumber, type: this.data.favors.code}).then((res) => {
        this.isLoading = false
        this.setData({
            'pager.lastPage': res.lastPage,
            'favors.list': this.data.favors.list.concat(res.list)
        })
      })
    }

})
