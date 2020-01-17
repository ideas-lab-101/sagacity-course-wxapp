const App = getApp()
import { $wuLogin } from '../../../components/pages/index'
import { index } from '../../../request/mainPort'
import { getUserHistory } from '../../../request/userPort'
const AppLaunchBehavior = require('../../../utils/behaviors/AppLaunchBehavior')
const Session = require('../../../utils/session')

Page({
    behaviors: [AppLaunchBehavior],
    statusBarHeight: App.globalData.equipment.statusBarHeight,
    data: {
      swiper: [],
      slideCurrent: 0,
      selectionData: [],
      courseList: [],
      /**
       * 参数
       */
      globalSlogon: {
        urls: {
            x1: 'https://sagacity-course-000019.tcb.qcloud.la/system/cover_bg@1x.jpg?sign=af9bdefc99e3e11567c45354915848fd&t=1540790334',
            x2: 'https://sagacity-course-000019.tcb.qcloud.la/system/cover_bg@2x.jpg?sign=c29e6d8bcb76635b9f9e4ca1fdd70972&t=1540790534'
        },
        version: App.version
      },
      historyVisible: true
    },

    onLoad: function (options) {
        /**
         * 请求数据
         **/
        this.__initAppLaunch()
            .then(() => {
                this.__init()
            })
        this.PageOnload = true
    },

    onShow: function () {
        /**
       * 请求历史数据
       **/
        if(App.user.ckLogin() && !this.PageOnload) {
          this.getHistoryData()
        }
    },

    onHide: function() {
        this.PageOnload = false
    },

    onUnload: function() {
        this.PageOnload = false
    },

    onPullDownRefresh: function() {
      this.__init()
      if(App.user.ckLogin()) {
        this.getHistoryData()
      }
      let fn = setTimeout( () => {
        clearTimeout(fn)
        wx.stopPullDownRefresh()
      }, 800)
    },

    onShareAppMessage: function () {
        return {
            title: '晓得Le',
            path: "pages/tabBar/index/index"
        }
    },

    __init() {
        this.getHistoryData()

        index()
            .then((res) => {
                this.setData({
                    swiper: res.data.swiper_list,
                    courseList: res.data.course_list
                })
            })
    },

  /**
   * 链接
   * @param e
   */
    goLinksEvent: function (e) {
      const type = e.currentTarget.dataset.type
      const id = e.currentTarget.dataset.id
      if(type === 'course') {
        wx.navigateTo({
          url: `/pages/apply/course/lesson-page/lesson-page?id=${id}`
        })
      }else if(type === 'topic') {
        wx.navigateTo({
          url: `/pages/apply/course/topic/topic?id=${id}`
        })
      }else if(type === 'album') {
        wx.navigateTo({
          url: `/pages/apply/course/album/album?id=${id}`
        })
      }
    },
    slideChangeEvent: function (e) {
        this.setData({
            slideCurrent: e.detail.current
        })
    },
    /**
    * 请求历史数据
    **/
    getHistoryData: function () {
        const value = Session.getUserHistory()

        if (value === 1) {
            this.setData({historyVisible: false})
        }else {
            this.setData({ historyVisible: true})

            getUserHistory()
                .then((res) => {
                    this.setData({ selectionData: res.data.list})
                })
        }
    },

    goLessonPage(e) {
        const { id } = e.currentTarget.dataset
        wx.navigateTo({
            url: `/pages/apply/course/lesson-page/lesson-page?id=${id}`
        })
    },

    login() {
        $wuLogin().show()
    },

})
