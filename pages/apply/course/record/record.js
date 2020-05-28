import { $wuBackdrop } from '../../../../components/wu/index'
import {  getLessonData } from '../../../../request/coursePort'
import {  submitRecordFile, recordCancel, uploadRecordFile } from '../../../../request/recordPort'
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
          model: 'fold',
          transparent: true,
          animation: {
            duration: 500,
            timingFunction: "linear"
          }
        },
        systemSeries: App.globalData.systemSeries,
        statusBarHeight: App.globalData.equipment.statusBarHeight,
        markedWords: {
            data: [
              {
                show: false,
                urls: [
                      {
                          url:'https://sagacity-course-000019.tcb.qcloud.la/markedWords/2.1.6/record/marker-01.png?sign=3aea4d7a3ea7a468709f77aff0d453ac&t=1542898587',
                          width: '360rpx',
                          top: '120rpx',
                          left: '60rpx'
                      },
                        {
                          query: '#MarkDown01'
                        },
                        {
                          url:'https://sagacity-course-000019.tcb.qcloud.la/markedWords/2.1.6/record/marker-03.png?sign=714e3eec09d0298c5c0b27884c2f00b6&t=1540883317',
                          width: '220rpx',
                          top: '300rpx',
                          left: '460rpx',
                          release: true
                      }
                  ]
              }
          ],
            version: App.version
        },

        backgroundSoundItem: null, // 背景音元素对象
      /**
       * 课程数据
       */
        courseData: null,  // 课程基本信息
        form: {
            data_id: '', // 课程ID
            file_url: '', // 混音地址
            record_url: '', // 原音地址
            music_id: 0, // 背景音ID
            task_id: 0   // 上传后拿到的判断线程的参数
        },
        reciprocal: { // 倒数计时
            visible: false,
            count: 5
        },
        mode: 0, //  朗诵 0 背诵 1 模式
        progressParams: { // 合成混音进度层
            visible: false,
            value: 5
        }
    },
    onLoad: function (options) {
        this.setData({
            mode: options.mode,
            'form.data_id': options.id
        })
        this.__init(options.id) // 请求数据

        this.__initInnerAudioManager()
    },
    onShow: function () {},

    onReady: function () {
      /**
       * 保持屏幕常亮
       */
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

    /**
     * 初始化获取course数据事件
     * @param id
     * @private
     */
    __init: function (id) {
        /**
         * 初始化授权
         */
        this.__getAuthRecordSetting()
        /**
         * 初始化录音管理器
         */
        this.__initRecorder()

        getLessonData({
            data_id: Number(id)
        })
            .then((res) => {
                this.setData({ courseData: res.data })
            })
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
        if (!this.data.form.music_id && !this.startRecordAction) {
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
        this.__innerAudioStop()
        this.closeRecordOverEvent()
        /**
        * 清理垃圾录音
        **/
        const {file_url, record_url, task_id} = this.data.form

        recordCancel({
            file_url,
            record_url,
            task_id
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
                        this.data.form.music_id = 0
                        return false
                    }
                    this.setData({backgroundSoundItem: {...data.item}})
                    this.data.form.music_id = data.item.music_id
                }
            },
            success: (res) => {
                res.eventChannel.emit('acceptDataSetBackgroundSound', { item: this.data.backgroundSoundItem })
            }
        })
    },
      /**
       * 引导返回控制事件
       * @param e
       */
    markDownFreeEvent: function (e) {
        const i = e.detail.index
        const release = e.detail.release
        this.data.markedWords.data.forEach( (item, index) => {
            let temp = false
            if (i === index && !release) {
                temp = true
            }
            const obj = `markedWords.data[${index}].show`
            this.setData({
                [obj]: temp
            })
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

                setTimeout(() => {
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
                    musicID: this.data.form.music_id,
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
                    const result = JSON.parse(res.data)
                    console.log(result)

                    this.data.form.file_url = result.data.file_url
                    this.data.form.record_url = result.data.record_url
                    this.data.form.task_id = result.data.task_id

                    $wuBackdrop().retain() // 打开已经录制的音频层
                    this.setData({ recordIn: true, 'form.file_url': result.data.file_url})
                })
                .catch((ret) => {
                    Toast.text({ text: '录音合成失败,请重新录制'})
                })
        }
})