const App = getApp()

const WxParse = require('../../../../components/wxParse/wxParse')
import { $wuBackdrop } from '../../../../components/wu/index'
import { $wuxActionSheet  } from 'wux-weapp'
const AppLaunchBehavior = require('../../../../utils/behaviors/AppLaunchBehavior')
const BackgroundAudioPlayBehavior = require('./BackgroundAudioPlayBehavior')
const PageReachBottomBehavior = require('../../../../utils/behaviors/PageReachBottomBehavior')

const { lessonDataInfo, getLessonList } = require('../../../../request/coursePort')
import { userFavor, addUserPoint } from '../../../../request/userPort'

const Toast = require('../../../../viewMethod/toast')
const Dialog = require('../../../../viewMethod/dialog')

Page({
    behaviors: [AppLaunchBehavior, BackgroundAudioPlayBehavior, PageReachBottomBehavior],
    data: {
        nav: {
            title: "",
            model: 'fold',
            transparent: true,
            animation: {
                duration: 1000,
                timingFunction: "linear"
            }
        },
        statusBarHeight: App.globalData.equipment.statusBarHeight,
        hasPrev: false,
        hasNext: false,
        captionCurrent: 0, // 字幕swiper 序列号
        sliderProgressVisible: false,  // 设置是否显示歌词拖动进度
        progress: 0,
        controlFix: false,
        systemSeries: App.globalData.systemSeries,
        /**
         * data
         */
        info: null
    },

    onLoad: function (options) {
        this.optionsId = options.id
        this.optionsFrame = options.frame === null || options.frame === undefined ? 0 : options.frame/1000 // 按照之前的帧数进入

        this.__initAppLaunch({
            id: this.optionsId,
            frame: this.optionsFrame
        })
    },

    onShow: function () {
    },

    onHide: function () {
    },

    onUnload: function () {
    },

    onShareAppMessage: function () {
        const {cover_url, data_name, data_id} = this.data.info.lesson_data
        return {
            imageUrl: `${cover_url}?imageView2/5/h/300`,
            title: data_name,
            path: `/pages/apply/course/lesson-play/lesson-play?id=${data_id}`,
            success: (ret) => {
                addUserPoint({ pointCode: '001'})
            }
        }
    },

    /**
    **  media audio 初始化事件
    **/
    __init: function ({id, frame}) {

        return lessonDataInfo({
            data_id: Number(id)
        })
            .then((res) => {

                this.setData({
                    info: res.data,
                    'nav.title': res.data.lesson_data.data_name
                })
                WxParse.wxParse('detail', 'html', res.data.lesson_data.content || '<p style="font-size: 14px;">暂无介绍</p>', this, 5)

                if (res.data.lesson_data.format === 'audio') {
                    this.initOperation() // 设置上一条 下一条按钮
                    this.initAudio(frame)
                } else {
                    console.error('文件和文件类型不匹配')
                }

                return res
            })
            .catch((ret) => {
                console.error('请求音乐播放源出错!')
            })
    },

    /**
     * 初始化播放器
     */
    initAudio: function (frame) {
        const { lesson_data } = this.data.info
        const id = lesson_data.data_id
        const src = lesson_data.data_url
        const title = lesson_data.data_name
        const epname = lesson_data.lesson_name
        const coverImgUrl = lesson_data.cover_url
        const loopState = this.data.state

        this.__initBackgroundAudio({
            id,
            loopState,
            src,
            title,
            epname,
            coverImgUrl,
            frame
        })
    },
    /**
     * 设置上一条 下一条
     */
    initOperation: function () {
        let prev = true
        let next = true
        const { pre_data_id, next_data_id, lesson_data, is_enroll } = this.data.info

        if (pre_data_id === 0 || (!is_enroll && lesson_data.open_state === 0)) {
            prev = false
        }
        if (next_data_id === 0 || (!is_enroll && lesson_data.open_state === 0)) {
            next = false
        }
        this.setData({
            hasPrev: prev,
            hasNext: next
        })
    },
    /**
     * 上一首
     * @returns {boolean}
     */
    audioPrevEvent: function () {
        const { hasPrev } = this.data
        const { pre_data_id } = this.data.info

        if (!hasPrev) {
            return false
        }
        this.optionsId = pre_data_id
        this.optionsFrame = 0
        this.__init({id: pre_data_id, frame: 0})
    },
    /**
     * 下一首
     * @returns {boolean}
     */
    audioNextEvent: function () {
        const { hasNext } = this.data
        const { next_data_id } = this.data.info

        if (!hasNext) {
            return false
        }
        this.optionsId = next_data_id
        this.optionsFrame = 0
        this.__init({ id: next_data_id, frame: 0})
    },



    /**
    **  页面触发事件
    **/
    turnBackPageEvent: function () {
        wx.navigateTo({
            url: `/pages/apply/course/lesson-page/lesson-page?id=${this.data.info.lesson_data.course_id}`
        })
    },

    goRecordListEvent: function () {
        if (!this.data.info.lesson_data.record_count || this.data.info.lesson_data.record_count === 0) {
            return false
        }
        wx.navigateTo({
            url: `/pages/apply/course/record-list/record-list?id=${this.data.info.lesson_data.data_id}`
        })
    },

    audioPlayEvent: function () {
        const { is_enroll, lesson_data } = this.data.info

        if (!is_enroll && lesson_data.open_state === 0) {
            this.dialogTip()
            return false
        }

        this.audioPlayOrPause()
    },



    /**
     * 是否循环
     */
    audioLoopEvent: function () {
        const { state } = this.data
        let txt = '顺序播放'
        let newState = 'order'

        if (state === 'order') {
            newState = 'loop'
            txt = '单曲循环'
        }
        this.setData({ state: newState })
        this.loopStateChange(newState)
        Toast.text({ text: txt })
    },

    changeAudioEvent: function (e) {
        const openState = Number(e.currentTarget.dataset.openstate)
        const isEnroll = this.data.info.is_enroll
        const id = e.currentTarget.dataset.id

        if (isEnroll || (!isEnroll && openState === 1)) {
            this.__init({ id, frame: 0})
        }else {
            this.dialogTip()
        }
    },

    /**
     * 进度 歌词切换
     * @param e
     */
    captionChangeEvent: function (e) {
      let temp = false
      if(e.detail.current === 1) {
        temp = true
      }
      this.setData({ captionCurrent: e.detail.current, controlFix: temp })
    },

  /**
   * 加载课程目录
   * @param e
   */
    openCatalogEvent: function (e) {
        if(this.data.content.list.length <= 0) {

          this._getLessonList()
              .then(res => {
                $wuBackdrop('#wu-backdrop-catalog', this).retain()
                this.setData({ catalogIn: true })
              })
          return false
        }

        $wuBackdrop('#wu-backdrop-catalog', this).retain()
        this.setData({ catalogIn: true })
    },

    closeCatalogEvent: function (e) {
        $wuBackdrop('#wu-backdrop-catalog', this).release()
        this.setData({ catalogIn: false})
    },

    _getLessonList() {
        const courseID = this.data.info.lesson_data.course_id

        return this.__getTurnPageDataList({
            isPageShow: true,
            interfaceFn: getLessonList,
            params: {
                course_id: courseID
            }
        })
    },

    lessonScrollToLowerEvent() {
        this.__ReachBottom()
    },

  /**
   * 课程收藏
   * @param e
   */
    collectEvent: function () {
        userFavor({dataID: Number(this.data.info.lesson_data.data_id), type: 'ld'}).then((res) => {
            this.setData({
                'info.is_favor': res.is_favor
            })

            Toast.text({ text: res.data.msg })
        })
    },

    recordEvent: function (e) {
        if (!App.user.ckLogin()) {
              wx.navigateTo({
                url: '/pages/common/accredit/accredit'
            })
            return false
        }
        if (!this.data.info.is_enroll) {
            this.dialogTip()
            return false
        }

        const self = this
        $wuxActionSheet().showSheet({
            titleText: '请选择录制模式',
            theme: 'wx',
            buttons: [{ text: '朗诵(显示字幕)'}, { text: '背诵(不显示字幕)'}],
            buttonClicked(index, item) {
                let readMode = 0
                if(index === 1) {
                  readMode = 1
                }
                /**
                 * 暂停背景音播放
                 */
                self.pauseBackgroundAudio()

                setTimeout(() => {
                  wx.navigateTo({
                    url: `/pages/apply/course/record/record?id=${self.data.info.lesson_data.data_id}&mode=${readMode}` // readMode 背诵还是朗诵
                  })
                }, 100)
                return true
            },
            cancelText: '取消',
            cancel() {}
        })
    },


    /**
     * 播放进度
     * @param e
     * @returns {boolean}
     */
    sliderChangeEvent: function (e) {
        if (!this.duration) {
            console.error('获取总长度出错')
            return false
        }
        const position = this.duration*e.detail.value / 100
        App.backgroundAudioManager.seek(position)
        App.backgroundAudioManager.play()
    },

    controlFixEvent: function (e) {
        let temp = 0
        if(e.detail.value) {
          temp = 1
        }
        this.setData({controlFix: e.detail.value, captionCurrent: temp})
    },

    /**
     * 未加入提示
     */
    dialogTip() {
        Dialog.confirm({
            content: '您还没有加入此课，还不能查看',
            cancelText: '算了',
            confirmText: '去加入',
            onConfirm: () => {
                wx.navigateTo({
                    url: `/pages/apply/course/lesson-page/lesson-page?id=${this.data.info.lesson_data.course_id}`
                })
            }
        })
    }
})
