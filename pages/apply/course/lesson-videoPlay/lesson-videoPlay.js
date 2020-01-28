const Video = require('../../../../controller/video')
const App = getApp()
import { lessonDataInfo, getLessonList } from '../../../../request/coursePort'
const { userFavor, addUserHistory } = require('../../../../request/userPort')
const WxParse = require('../../../../components/wxParse/wxParse')
const { $wuBackdrop } = require('../../../../components/wu/index')
const Toast = require('../../../../viewMethod/toast')
const Dialog = require('../../../../viewMethod/dialog')
const PageReachBottomBehavior = require('../../../../utils/behaviors/PageReachBottomBehavior')
const AppLaunchBehavior = require('../../../../utils/behaviors/AppLaunchBehavior')

Page({
    behaviors: [AppLaunchBehavior, PageReachBottomBehavior],
    data: {
        info: null,
        resource: null,
        videoShowCenterPlayBtn: false,
        videoControls: true,
        videoAutoplay: false,
        scrollHeight: '100%'
    },

    onLoad: function (options) {
        try {
            App.backgroundAudioManager.stop()
        }catch (err) {}

        this.optionsId = options.id

        this.__initAppLaunch({
            data_id: this.optionsId
        })

        this.isLoadPass = true
    },

    onShow: function () {
        if (!this.isLoadPass) {
            if (!this.data.info.is_enroll && App.enroll.has(this.data.info.lesson_data.course_id) && App.user.ckLogin()){
                this.__init({data_id: this.optionsId})
            }
        }
    },

    onReady: function () {
        try {
            var res = wx.getSystemInfoSync()
            var screenHeight = res.windowHeight
        } catch (e) {}
        var query = wx.createSelectorQuery()
        query.select('#wu-navigation').boundingClientRect()
        query.select('#play-video').boundingClientRect()
        query.exec((ret) => {
            let h = 0
            ret.forEach((item) => {
                h += item.height
            })
            this.setData({
                scrollHeight: `${screenHeight - h}px`
            })
        })
        /***
         *视频组件控制初始化
         **/
        this.thisVideo = new Video()
    },

    onHide: function () {
        /***
         *视频组件控制清除
         **/
        this.thisVideo.clear()
        this.videoEnd = true
        this.isLoadPass = false
    },

    onUnload: function () {
        this.thisVideo = null
        this.isLoadPass = false
    },

    onPageScroll: function (e) {
      //$wuNavigation().scrollTop(e.scrollTop)
    },

    onShareAppMessage: function () {
        return {
            title: this.data.info.lesson_data.data_name,
            path: `/pages/apply/course/lesson-videoPlay/lesson-videoPlay?id=${this.data.info.lesson_data.data_id}`
        }
    },

    /**
     *  media video
     */
    turnBackPageEvent: function () {
        if (this.thisVideo) {
            this.thisVideo.videoContext.stop()
        }
        wx.navigateTo({
            url: `/pages/apply/course/lesson-page/lesson-page?id=${this.data.info.lesson_data.course_id}`
        })
    },

    changeVideoEvent: function (e) {
        const openState = e.currentTarget.dataset.openstate
        const id = e.currentTarget.dataset.id
        if (this.data.info.is_enroll || (!this.data.info.is_enroll && openState === 1)) {
            if (id === this.data.info.lesson_data.data_id) {
                if (this.videoEnd) {
                    this.thisVideo.play()
                    return false
                }
                return false
            }
            this.__init({data_id: id}) // 重新请求新的视频链接
        }else {

            Dialog.confirm({
                content: '尚未加入，不能查看。',
                cancelText: '算了',
                confirmText: '去加入',
                onConfirm: () => {
                    if (this.thisVideo) {
                        this.thisVideo.videoContext.stop()
                    }
                    wx.navigateTo({
                        url: `/pages/apply/course/lesson-page/lesson-page?id=${this.data.info.lesson_data.course_id}`
                    })
                }
            })
        }
    },

    collectEvent: function (e) {
      userFavor({
          data_id: Number(this.data.info.lesson_data.data_id),
          type: 'ld'
      })
          .then((res) => {
            this.setData({
                'info.is_favor': res.data.is_favor
            })
            Toast.text({ text: res.msg})
        })
    },

    openDraftEvent: function (e) {
        $wuBackdrop().retain()
        this.setData({
            in: true
        })
    },

    closeDraftEvent: function (e) {
        $wuBackdrop().release()
        this.setData({
            in: false
        })
    },

    tipEvent: function (e) {

        Dialog.confirm({
            content: '尚未加入，不能查看。',
            cancelText: '算了',
            confirmText: '去加入',
            onConfirm: () => {
                wx.navigateTo({
                    url: `/pages/apply/course/lesson-page/lesson-page?id=${this.data.info.lesson_data.course_id}`
                })
            }
        })
    },

    /**
     *视频组件 监听事件
     **/
    videoPlayEvent: function (e) {
        this.thisVideo.create() // 视频组件控制调用
        this.videoEnd = false
    },

    videoEndEvent: function (e) {
        const id = this.data.info.next_data_id
        if (id !== 0) {
            this.__init({data_id:id})  // 重新请求数据  顺序播放
        }else {
            this.videoEnd = true
        }
    },

    videoErrEvent: function (e) {},

    /**
    **  media video init event
    **/
    __init: function ({data_id}) {
      lessonDataInfo({
          data_id: data_id
      })
          .then((res) => {
                this.setData({
                    info: res.data
                })
                WxParse.wxParse('detail', 'html', res.data.lesson_data.content || '<p style="font-size: 14px;">暂无介绍</p>', this, 5) // 添加文稿

                if(this.data.content.list.length<=0) {
                  this.getLessonList()
                }
            })
          .then(() => {
                const { lesson_data } = this.data.info
                if (lesson_data.format === 'video') {
                    this.initVideo(lesson_data.data_id)
                } else {
                    console.error('文件和文件类型不匹配')
                }
        })
    },

    lessonScollTolowerEvent() {
        this.__ReachBottom()
    },

    getLessonList() {
        const courseID = this.data.info.lesson_data.course_id

        return this.__getTurnPageDataList({
            isPageShow: true,
            interfaceFn: getLessonList,
            params: {
                course_id: courseID
            }
        })
    },

    initVideo: function (id) {
        if (this.data.info.is_enroll || this.data.info.lesson_data.open_state === 1) { // 判断进入的时候的 id 是否在播放列表中, 给出结果 是否被中断, 如果中断说明传入ID 不在播放列表中
          this.setData({
            videoControls: true,
            videoAutoplay: true
          })
        }else {
          this.setData({
            videoControls: false,
            videoAutoplay: false
          })
          return false
        }

        this.setData({
            resource: this.data.info.lesson_data
        })
        /**
         * 这里请求新的地址  就给一条记录
         */
        addUserHistory({
            data_id: Number(this.data.info.lesson_data.data_id)
        })
            .then((res) => {
                console.log('添加到历史记录')
            })
    }

})