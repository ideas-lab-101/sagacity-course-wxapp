var App = getApp()
import { getCourseUpdate, getRecordUpdate, getHotLessonData } from '../../../request/mainPort'
const MultiplePageReachBottomBehavior = require('../../../utils/behaviors/MultiplePageReachBottomBehavior')
import { $wuLogin } from '../../../components/pages/index'

Page({
    behaviors: [MultiplePageReachBottomBehavior],
    data: {
        statusBarHeight: App.globalData.equipment.statusBarHeight,
        courseList: [],
      /**
       * page params
       */
        swiper: {
            autoplay: false,
            interval: 5000,
            duration: 1000
        }
    },

    onLoad: function(options) {
        this.__init()
    },

    onPullDownRefresh: function() {
        /**
         * 清除缓存数据
         */
        this.__clearTurnPageCacheData()
        this.__init()

        let fn = setTimeout( () => {
            clearTimeout(fn)
            wx.stopPullDownRefresh()
        }, 1000)
    },
    onReachBottom() {
      this.__ReachBottomMultiple()
    },
  /**
   * 获取数据
   */
    __init() {
      this.__getCourseUpdate()

      const params = [
          {
              isPageShow: true,
              interfaceFn: getHotLessonData,
              params: {}
          },
          {
                isPageShow: true,
                interfaceFn: getRecordUpdate,
                params: {
                    day: 10
                }
            }
        ]
      this.__getTurnPageDataListMultiple(params)
    },


    __getCourseUpdate() {
        getCourseUpdate()
            .then(res => {
                this.setData({ courseList: res.data.list})
            })
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
        const { id, format} = e.currentTarget.dataset

        if (format === 'audio') {
            wx.navigateTo({
                url: `/pages/apply/course/lesson-play/lesson-play?id=${id}`,
            })
        } else if(format === 'video') {
            wx.navigateTo({
                url: `/pages/apply/course/lesson-videoPlay/lesson-videoPlay?id=${id}`,
            })
        }
    },

    goFreeRecording() {
        if (!App.user.ckLogin()) {
            $wuLogin().show()
            return false
        }
        wx.navigateTo({
            url: `/pages/apply/course/free-record/free-record?mode=0`,
        })
    }
})
