var App = getApp()
const { getCourseIndex, getCourseIndexList } = require('../../../../request/coursePort')

Page({
    data: {
        catalogTile: [],
        current: 0,
        statusBarHeight: App.globalData.deviceStatusBarHeight,
        gather: {
            pageNumber: 1,
            lastPage: false,
            list: [],
            pageSize: 12,
            totalRow: 0
        }
    },

    onLoad: function(options) {
        this.getCourseListData()
        if (!App.globalData.deviceStatusBarHeight) {
            try {
                var res = wx.getSystemInfoSync()
                this.setData({
                    statusBarHeight: res.statusBarHeight
                })
            } catch (e) {}
        }
    },

    onShow: function () {
    },

    onHide: function() {
    },

    onReachBottom: function () {
        this._ReachBottom()
    },

    // 自定义事件
    getCourseListData() {
        getCourseIndex().then((res) => {
            this.setData({ catalogTile: res.list })
            this.__getCatalogList(true)
        })
    },

    changeMenuEvent: function (e) {
        const index = e.currentTarget.dataset.index
        const { catalogTile } = this.data

        const item = App.dataStorageManager.change(catalogTile[index].TypeID)
        if(item) {
            this.setData({
                current: index,
                'gather.pageNumber': item.pageNumber,
                'gather.lastPage': item.lastPage,
                'gather.totalRow': item.totalRow,
                'gather.list': item.list
            })
        }else {
            this.setData({ current: index })
            this.__getCatalogList(true)
        }
    },

    /**
     * 下拉加载更多
     * @returns {boolean}
     * @private
     */
    _ReachBottom() {
        let { lastPage, pageNumber } = this.data.gather
        if (lastPage || this.isLoading) {
            return false
        }
        this.isLoading = true
        pageNumber++
        this.data.gather.pageNumber = pageNumber

        this.__getCatalogList()
          .catch(() => {
              this.data.gather.pageNumber--
          })
          .finally(() => {
              this.isLoading = false
          })
    },

    __getCatalogList(isPageShow) {
        let { pageNumber, pageSize, list } = this.data.gather
        const { current, catalogTile } = this.data

        if (isPageShow) {
            pageNumber = 1
            this.data.gather.pageNumber = pageNumber
        }

        return getCourseIndexList({
            page: pageNumber,
            pageSize,
            typeID: catalogTile[current].TypeID
        })
          .then(res => {
              let tempList = [...res.list]
              if (!isPageShow) {
                  tempList = list.concat(tempList)
              }
              this.setData({
                  'gather.lastPage': res.lastPage,
                  'gather.totalRow': res.totalRow,
                  'gather.list': tempList
              }, () => {
                  /**
                   * 缓存数据
                   */
                  App.dataStorageManager.add(catalogTile[current].TypeID, this.data.gather)
              })

          })
    }
})
