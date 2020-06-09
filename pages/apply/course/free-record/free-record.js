import { $wuBackdrop } from '../../../../components/wu/index'
import {  submitRecordFile, recordCancel, uploadRecordFile } from '../../../../request/recordPort'
import {  getLessonData } from '../../../../request/coursePort'
const App = getApp()
const AuthSettingBehavior = require('../../../../utils/behaviors/AuthSettingBehavior')
const AuthRecordBehavior = require('../../../../utils/behaviors/AuthRecordBehavior')
const InnerAudioPlayBehavior = require('../../../../utils/behaviors/InnerAudioPlayBehavior')
const Dialog = require('../../../../viewMethod/dialog')
const Toast = require('../../../../viewMethod/toast')

Page({
    behaviors: [AuthSettingBehavior, AuthRecordBehavior, InnerAudioPlayBehavior],
    data: {
        nav: {
          title: "",
          backgroundColor: "white",
          model: 'extrude',
          transparent: true
        },
        systemSeries: App.globalData.systemSeries,
        statusBarHeight: App.globalData.equipment.statusBarHeight,
        windowHeight: App.globalData.equipment.windowHeight,
        windowWidth: App.globalData.equipment.windowWidth,

        backgroundSoundItem: null, // 背景音元素对象
      /**
       * 课程数据
       */
        courseData: null,  // 课程基本信息
        form: {
            dataId: '', // 课程ID
            fileUrl: '', // 混音地址
            recordUrl: '', // 原音地址
            musicId: 0, // 背景音ID
            taskId: 0   // 上传后拿到的判断线程的参数
        },
        reciprocal: { // 倒数计时
            visible: false,
            count: 5
        },
        mode: 0, //  朗诵 0 背诵 1 模式
        progressParams: { // 合成混音进度层
            visible: false,
            value: 0
        },
        timeHand: 0
    },
    onLoad: function (options) {
        this.optionsId = options.id
        this.data.form.dataId = options.id
        this.setData({
            mode: options.mode || '0'
        })

        this.__init()

        this.__initInnerAudioManager()
    },
    onShow: function () {},

    onReady: function () {
        const { statusBarHeight, windowHeight } = this.data
        const query = wx.createSelectorQuery()
        query.selectAll('.countHtml').boundingClientRect((res) => {
            let total = 45
            res.map(item => {
                total += item.height
                return item
            })
            this.setData({
                contentHeight: windowHeight - total - statusBarHeight
            })
        })
        query.exec()
      //保持屏幕常亮
      wx.setKeepScreenOn({ keepScreenOn: true })
    },

    onHide: function () {
        /**
         * 音频停止播放
         */
        this.__innerAudioStop()
    },

    onUnload: function () {
        this.freeRecord() //  置空录音管理器
        this.__innerAudioDestroy()
    },

    __init: function () {
        /**
         * 初始化授权
         */
        this.__getAuthRecordSetting()
        /**
         * 初始化录音管理器
         */
        this.__initRecorder()

        if (this.data.form.dataId) {
            this.getLessonDataById(this.data.form.dataId)
        }
    },

    getLessonDataById(id) {
        getLessonData({
            dataId: Number(this.data.form.dataId)
        })
            .then((res) => {
                this.setData({ courseData: res.data})
            })
    },

    removeCourse() {
        // const query = wx.createSelectorQuery()
        // query.select('#courseDetail').boundingClientRect((res) => {
        //     console.log(this)
        //     const clientWidth = res.width

        //     this.animate('#courseDetail', [
        //         { width: clientWidth},
        //         { width: 0},
        //         ], 3000, function () {
                
        //       }.bind(this))

        // })
        // query.exec()
        this.data.form.dataId = ""
        this.setData({ courseData: null })
    },
    addCourse() {
        wx.navigateTo({
            url: `/pages/apply/course/course-template/course-template?id=${this.optionsId}`,
            events: {
                acceptDataSetCourseTemplate: (data) => {
                    if (!data.id) {
                        this.setData({courseData: null})
                        this.data.form.dataId = ''
                        return false
                    }
                    this.data.form.dataId = data.id
                    this.getLessonDataById(data.id)
                }
            }
        })
    },
    modeSwitch() {
        let mode = this.data.mode
        if (mode === '0') {
            mode = '1'
        }else {
            mode = '0'
        }
        this.setData({ mode})
    },
    startRecord: function (e) {
        this.__setAuthRecordSetting()
            .then(() => {
                this.startRecordCheckMusic()
            })
    },
  /**
   * 授权后 开始录音  判断是否选择背景音
   * @returns {boolean}
   */
    startRecordCheckMusic: function () {
        if (!this.data.form.musicId && !this.startRecordAction) {
            Dialog.confirm({
                title: '尚无背景音',
                content: '选择背景音将有更好的作品表现',
                cancelText: '去录制',
                confirmText: '去选择',
                onConfirm: () => {
                    this.getBackSoundListEvent()
                },
                onCancel: () => {
                    this.startRecordSettingBack()
                }
            })
        }else {
            this.startRecordSettingBack()
        }
    },
  /**
   * 授权后 开始录音
   * @returns {boolean}
   */
    startRecordSettingBack: function () {
        this.startRecordAction = true
        if (this.data.reciprocal.visible) {
            return false
        }
      /**
       * 音频停止播放
       */
        this.__innerAudioStop()

        this.setData({
            'reciprocal.visible': true
        })
        this._reciprocalCount(this.data.reciprocal.count, this.startRecordExecute)  // 倒计时调用 加返回方法
    },

    /**
     * 关闭录制层
     */
    closeRecordOverEvent: function () {
        /**
         * 音频停止播放
         */
        this.__innerAudioStop()

        $wuBackdrop().release()
        this.setData({recordIn: false})
    },
    /**
     * 重新录制
     */
    resetEvent: function () {
        this.closeRecordOverEvent()
        /**
        * 清理垃圾录音
        **/
        const {fileUrl, recordUrl, taskId} = this.data.form

        recordCancel({
            fileUrl,
            recordUrl,
            taskId
        })
    },
  /**
   * 链接到背景音列表
   */
    getBackSoundListEvent: function () {
        wx.navigateTo({
            url: `/pages/apply/course/background-sound-list/background-sound-list`,
            events: {
                acceptDataSetBackgroundSound: (data) => {
                    console.log('backgroundSoundItem', data)
                    if (!data.item) {
                        this.setData({backgroundSoundItem: null})
                        this.data.form.musicId = 0
                        return false
                    }
                    this.setData({backgroundSoundItem: {...data.item}})
                    this.data.form.musicId = data.item.music_id
                }
            },
            success: (res) => {
                res.eventChannel.emit('acceptDataSetBackgroundSound', { item: this.data.backgroundSoundItem })
            }
        })
    },
    /**
     * 倒数计时回调
     **/
    _reciprocalCount: function (count, backFn) {
        const fn = setTimeout(() => {
            count--
            if (count === 0) {
                clearTimeout(fn)
                this.setData({
                    'reciprocal.visible': false,
                    'reciprocal.count': 5
                })
                backFn()
                return false
            }
            this.setData({
                'reciprocal.count': count
            })
            this._reciprocalCount(count, backFn)
        }, 1000)
    },

    /**
     * 上传完成后合成混音
     */
    submitEvent: function () {
        submitRecordFile({
                ...this.data.form,
                mode: this.data.mode
            })
            .then((res) => {
                Toast.text({ text: '提交成功'})
                this.closeRecordOverEvent() // 关闭弹出层

                const BackFn = setTimeout(() => {
                    clearTimeout(BackFn)
                    wx.navigateTo({
                        url: `/pages/apply/mine/my-record/my-record?skip=1`
                    })
                }, 100)
            })
            .catch((ret) => {
                Toast.text({ text: ret.msg})
            })
      },
    /**
     * 上传到服务器  获取音频合成的接口
     * @param path
     * @param musicID
     * @param duration
     * @private
     */
    getMixtureRecord: function (path, duration) {
        this.setData({
            'progressParams.visible': true
        })
        uploadRecordFile({
                path: path,
                musicId: this.data.form.musicId,
                duration: duration
            },
            (progress) => {
                this.setData({
                    'progressParams.value': progress.progress
                })
            },
            () => {
                this.setData({
                    recordIn: false,
                    'progressParams.visible': false
                })
            })
            .then((res) => {
                this.data.form.fileUrl = res.data.file_url
                this.data.form.recordUrl = res.data.record_url
                this.data.form.taskId = res.data.task_id

                $wuBackdrop().retain() // 打开已经录制的音频层
                this.setData({ recordIn: true, 'form.fileUrl': res.data.file_url})
            })
            .catch((ret) => {
                Toast.text({ text: ret || '录音合成失败,请重新录制'})
            })
    }
})