const App = getApp()
import { lessonDataInfo, getLessonList } from '../../../../request/coursePort'
import { userFavor } from '../../../../request/userPort'
const WxParse = require('../../../../components/wxParse/wxParse')
import { $wuBackdrop } from '../../../../components/wu/index'
const Toast = require('../../../../viewMethod/toast')
const Dialog = require('../../../../viewMethod/dialog')
const PageReachBottomBehavior = require('../../../../utils/behaviors/PageReachBottomBehavior')
const AppLaunchBehavior = require('../../../../utils/behaviors/AppLaunchBehavior')
const VideoBehavior = require('../../../../utils/behaviors/VideoBehavior')

Page({
    behaviors: [AppLaunchBehavior, PageReachBottomBehavior, VideoBehavior],
    data: {
        info: null,
        resourceURL: null,
        videoShowCenterPlayBtn: false,
        videoControls: true,
        videoAutoplay: true,
        scrollHeight: '100%'
    },

    onLoad: function (options) {
        try {
            App.backgroundAudioManager.stop()
        }catch (err) {}

        this.optionsId = options.id
        this.optionsFrame = options.frame === null || options.frame === undefined ? 0 : options.frame/1000 // 按照之前的帧数进入

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
        this.__initVideoContext()

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
    },

    onHide: function () {
        this.isLoadPass = false
    },

    onUnload: function () {
        this.isLoadPass = false
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
                    this.videoContextTask.play()
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
        this.setData({ in: true })
    },

    closeDraftEvent: function (e) {
        $wuBackdrop().release()
        this.setData({ in: false})
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
    **  media video init event
    **/
    __init: function ({data_id, isNext}) {
          lessonDataInfo({
              data_id: data_id
          })
              .then((res) => {
                    this.setData({
                        info: res.data
                    })
                    WxParse.wxParse('detail', 'html', res.data.lesson_data.content || '<p style="font-size: 14px;">暂无介绍</p>', this, 5) // 添加文稿

                    if(this.data.content.list.length <= 0) {
                      this.getLessonList()
                    }

                    if (res.data.lesson_data.format === 'video') {
                      this.initVideo(res.data.lesson_data.data_id, isNext)
                    } else {
                      console.error('文件和文件类型不匹配')
                    }
                })
    },

    lessonScrollToLowerEvent() {
        this.__ReachBottom()
    },

    getLessonList() {
        const course_id = this.data.info.lesson_data.course_id

        return this.__getTurnPageDataList({
            isPageShow: true,
            interfaceFn: getLessonList,
            params: { course_id }
        })
    },

    initVideo: function (id, isNext) {
        if (!this.videoContextTask) {
            return false
        }
        /**
         * 判断进入的时候的 id 是否在播放列表中, 给出结果 是否被中断, 如果中断说明传入ID 不在播放列表中
         */
        if (this.data.info.is_enroll || this.data.info.lesson_data.open_state === 1) {
            this.setData({
                videoControls: true,
                videoAutoplay: true
            })
            if (this.optionsFrame && !isNext) {
                this.videoContextTask.seek(this.optionsFrame)
            }else {
                this.videoContextTask.play()
            }
        }else {
          console.log(this.videoContextTask)
          this.setData({
              videoControls: false,
              videoAutoplay: false
          })
            setTimeout(() => {
                this.videoContextTask.stop()
            }, 200)

        }
    }

})