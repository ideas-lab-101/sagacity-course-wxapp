import {getFavorList} from "../../../request/userPort";

var App = getApp()
import { getCourseUpdate, getRecordUpdate, getHotLessonData } from '../../../request/mainPort'
const MultiplePageReachBottomBehavior = require('../../../utils/behaviors/MultiplePageReachBottomBehavior')

Page({
    behaviors: [MultiplePageReachBottomBehavior],
    data: {
        statusBarHeight: App.globalData.equipment.statusBarHeight,
        courseList: [],
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
      this.__ReachBottomMultiple()
    },
  /**
   * 获取数据
   */
    __init() {
      const params = [
          {
              isPageShow: true,
              interfaceFn: getCourseUpdate,
              params: {}
          },
          {
              isPageShow: true,
              interfaceFn: getHotLessonData,
              params: {}
          }
      ]

      this.__getTurnPageDataListMultiple(params)
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
