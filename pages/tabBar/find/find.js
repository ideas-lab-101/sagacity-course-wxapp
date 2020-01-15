var App = getApp()
const { $wuPlayWidget } = require('../../../components/wu/index')
const { getCourseUpdate, getRecordUpdate, getHotLessonData } = require('../../../request/mainPort')

Page({
    data: {
        statusBarHeight: App.globalData.equipment.statusBarHeight,
        courseList: [],
        record:{
          pageNumber: 1,
          lastPage: true,
          list: [],
          pageSize: 10
        },
        hot: {
          pageNumber: 1,
          lastPage: true,
          list: [],
          pageSize: 10
        },
      /**
       * page params
       */
        swiper: {
            autoplay: true,
            interval: 5000,
            duration: 1000
        },
        tab: {
            current: 0
        }
    },

    onLoad: function(options) {
        this.__init()
    },

    onShow: function () {
        $wuPlayWidget().show(App.globalData.audio.getPlayer())
    },

    onHide: function() {
        $wuPlayWidget().detached()
    },

    onPullDownRefresh: function() {
        this.setData({
          'record.list': [],
          'record.lastPage': true,
          'record.pageNumber': 1,
          'hot.list': [],
          'hot.lastPage': true,
          'hot.pageNumber': 1,
          'tab.current': 0
        })
        this.__init()
        let fn = setTimeout( () => {
            clearTimeout(fn)
            wx.stopPullDownRefresh()
        }, 1000)
    },
    onReachBottom() {
      this._reachBottom() // 下拉加载数据
    },
  /**
   * 获取数据
   */
    __init() {
        this._getCourseUpdate()
        this._getRecordUpdate(true)
    },

    _getCourseUpdate() {
        getCourseUpdate()
            .then((res) => {
            this.setData({ courseList: res.data.list })
        })
    },

    _getHotLessonData(isPageShow) {
        let {pageNumber, pageSize, list } = this.data.hot
        if (isPageShow) {
            pageNumber = 1
        }
        if (this.data.HotLoading) {
            return false
        }
        this.data.HotLoading = true

        return getHotLessonData({
          page: pageNumber,
          pageSize
        }).then(res => {

            let tempList = [...res.data.list]
            if (!isPageShow) {
                tempList = list.concat(tempList)
            }

          this.data.hot.pageNumber = pageNumber
          this.setData({
            'hot.list': tempList,
            'hot.lastPage': res.data.lastPage,
            'hot.totalRow': res.data.totalRow,
          })
        })
            .finally(() => {
                this.data.HotLoading = false
            })
    },

    _getRecordUpdate(isPageShow) {
        let { pageNumber, pageSize, list } = this.data.record
        if (isPageShow) {
            pageNumber = 1
        }
        if (this.data.ReordLoading) {
            return false
        }
        this.data.ReordLoading = true

        return getRecordUpdate({
          page: pageNumber,
          pageSize
        }).then(res => {

            let tempList = [...res.data.list]
            if (!isPageShow) {
                tempList = list.concat(tempList)
            }

            this.data.record.pageNumber = pageNumber
            this.setData({
            'record.list': tempList,
            'record.lastPage': res.data.lastPage,
            'record.totalRow': res.data.totalRow,
            })
        })
            .finally(() => {
                this.data.ReordLoading = false
            })
    },
  /**
   * 下拉加载数据调用方法
   * @returns {boolean}
   * @private
   */
    _reachBottom() {
        const { current } = this.data.tab

      if(current === 0) {
        const { lastPage } = this.data.record

        if(lastPage) {
          return false
        }

        this.data.record.pageNumber++
        this._getRecordUpdate()
          .catch(() => {
            this.data.record.pageNumber--
          })


      }else if(current === 1) {

        const { lastPage } = this.data.hot

        if( lastPage) {
          return false
        }

        this.data.hot.pageNumber++
        this._getHotLessonData()
          .catch(() => {
            this.data.hot.pageNumber--
          })
      }

    },
  /**
   * TAB切换事件
   * @param e
   */
  tabEvent: function (e) {
      const index = Number(e.currentTarget.dataset.index)
      this.setData({
          'tab.current': index
      })
      if(index === 1 && this.data.hot.list.length <= 0) {
        this._getHotLessonData(true)
      }
    },
  /**
   * 链接
   */
    goSearchEvent() {
        wx.navigateTo({
            url: '/pages/common/search/search',
        })
    },

    goStoreEvent() {
        wx.navigateTo({
            url: '/pages/apply/course/catalog/catalog',
        })
    },

    goRecordEvent: function (e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/apply/mine/record-play/record-play?id=${id}`,
        })
    },

    goCommentEvent(e) {
      const id = e.currentTarget.dataset.id
      wx.navigateTo({
        url: `/pages/common/comment/comment?id=${id}&type=record`,
      })
    },

    goUserEvent: function (e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/apply/mine/user-page/user-page?id=${id}`,
        })
    },

    goPageEvent: function (e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/apply/course/lesson-page/lesson-page?id=${id}`,
        })
    },

    goDetailEvent: function (e) {
        const index = e.currentTarget.dataset.index
        const id = this.data.hot.list[index].DataID
        const type = this.data.hot.list[index].Format

        if (type === 'audio') {
            wx.navigateTo({
                url: `/pages/apply/course/lesson-play/lesson-play?id=${id}`,
            })
        } else if(type === 'video') {
            wx.navigateTo({
                url: `/pages/apply/course/lesson-videoPlay/lesson-videoPlay?id=${id}`,
            })
        }

    }

})
