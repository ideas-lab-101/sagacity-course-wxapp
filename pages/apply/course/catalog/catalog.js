var App = getApp()
const { getCourseList } = require('../../../../request/coursePort')
const { getEnumDetail } = require('../../../../request/systemPort')

Page({
    data: {
        catalogTile: [],
        current: 0,
        statusBarHeight: App.globalData.equipment.statusBarHeight,
        gather: {
            pageNumber: 1,
            lastPage: false,
            list: [],
            pageSize: 12,
            totalRow: 0
        }
    },

    onLoad: function(options) {
        this.__init()
    },

    onReachBottom: function () {
        this._ReachBottom()
    },

    // 自定义事件
    __init() {
        getEnumDetail({
            masterId: 9
        })
            .then((res) => {
                this.setData({ catalogTile: res.data.list })

                this.__getCatalogList(true)
            })
    },

    /**
     * TAB切换
     * @param e
     */
    changeMenuEvent: function (e) {
        const index = e.currentTarget.dataset.index
        const { catalogTile } = this.data

        const item = App.dataStorageManager.change(catalogTile[index].detail_id)
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

    goCoursePage(e) {
      const { id } = e.currentTarget.dataset
        wx.navigateTo({
            url: `/pages/apply/course/lesson-page/lesson-page?id=${id}`
        })
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

        return getCourseList({
            page: pageNumber,
            pageSize,
            typeId: catalogTile[current].detail_id
        })
          .then(res => {
              let tempList = [...res.data.list]
              if (!isPageShow) {
                  tempList = list.concat(tempList)
              }
              this.setData({
                  'gather.lastPage': res.data.lastPage,
                  'gather.totalRow': res.data.totalRow,
                  'gather.list': tempList
              }, () => {
                  /**
                   * 缓存数据
                   */
                  App.dataStorageManager.add(catalogTile[current].detail_id, this.data.gather)
              })

          })
    }
})
