const { $wuToast, $wuBackdrop } = require('../../../../components/wu/index')
const {  GetLessonInfo } = require('../../../../request/coursePort')
const {  uploadRecordFile, submitRecordFile, recordCancel } = require('../../../../request/recordPort')
import recordManager from './recordManager'
import AudioManager from '../../../../controller/audioManager'
const App = getApp()

Page({
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
        deviceStatusBarHeight: App.globalData.deviceStatusBarHeight,
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
        userInfo: App.user.userInfo,

        backgroundSoundItem: null, // 背景音元素对象
      /**
       * 课程数据
       */
        courseData: {},  // 课程基本信息
      /**
       * 录音参数
       */
        recordStart: false,
        recordEnd: false,
        isPause: false,
        recordTime: 0, // 录音时间

        progressParams: { // 合成混音进度层
            visible: false,
            value: 5
        },

        form: {
            dataID: '', // 课程ID
            fileURL: '', // 混音地址
            recordURL: '', // 原音地址
            teamID: 1, // 默认组ID
            musicID: 0, // 背景音ID
            taskID: 0   // 上传后拿到的判断线程的参数
        },

        tryParams: { // 试听控制
            isPlay: false,
            id: ''
        },

        reciprocal: { // 倒数计时
            visible: false,
            count: 5
        },

        mode: 0, //  朗诵 0 背诵 1 模式

        recordSetting: false,
        recordSettingOpened: false
    },

    onLoad: function (options) {
        this.setData({
            mode: options.mode,
            recordSetting: App.setting.recordSetting.set,
            recordSettingOpened: App.setting.recordSetting.opened,
            'form.dataID': options.id
        })
        this._initCourseData(options.id) // 请求数据
    },

    onShow: function () {
      /**
       * 建立录音管理器
       * @type {recordManager}
       */
        this.Recorder = new recordManager({
            listenBack: {
                startBack: this._startBack,
                stopBack: this._stopBack,
                resumeBack: this._resumeBack,
                errorBack: this._errorBack,
                interruptionBeginBack: this._interruptionBeginBack,
                interruptionEndBack: this._interruptionEndBack
            }
        })
      /**
       * 初始换播放插件
       * @type {audioManager}
       */
        this.innerAudioContext = new AudioManager({
            play: this._audioManagerPlay,
            stop: this._audioManagerStop,
            end: this._audioManagerEnd,
            error: this._audioManagerError,
            destroy: this._audioManagerDestroy
        })

        this._resetBackSound() // 重置推荐背景音列表
    },

    onReady: function () {
      /**
       * 保持屏幕常亮
       */
      wx.setKeepScreenOn({
        keepScreenOn: true
      })
    },

    onHide: function () {
        this.Recorder.free() //  置空录音管理器
        if (this.innerAudioContext) {
          this.innerAudioContext.stop()
        }
    },

    onUnload: function () {
        this.Recorder.free() //  置空录音管理器
        if (this.innerAudioContext) {
          this.innerAudioContext.destroy()
          this.innerAudioContext = null
        }
        App.globalData.bachgroundSound = null //清空背景音
    },

    /**
     * 录音授权
     **/
    opensettingEvent: function (e) {
        if (e.detail.authSetting['scope.record']) {
            this.setData({
                recordSetting: true
            })
            App.setting.recordSetting.set = true
        }
    },
    startRecord: function (e) {
        wx.getSetting({
            success: (res) => {
                if (res.authSetting['scope.record']) {
                    this.startRecordCheckMusic()
                }else {
                    wx.authorize({
                        scope: 'scope.record',
                        success: () => {
                            this.startRecordCheckMusic()
                            this.setData({
                                recordSetting: true,
                                recordSettingOpened: true
                            })
                            App.setting.recordSetting.set = true
                            App.setting.recordSetting.opened = true
                        },
                        fail: (err) => {
                            this.setData({
                                recordSetting: false,
                                recordSettingOpened: true
                            })
                            App.setting.recordSetting.opened = true
                        }
                    })
                }
            }
        })
    },
  /**
   * 授权后 开始录音  判断是否选择背景音
   * @returns {boolean}
   */
    startRecordCheckMusic: function () {
        if (!this.data.form.musicID && !this.startRecordAction) {
            wx.showModal({
                title: '尚无背景音',
                content: '选择背景音将有更好的作品表现',
                showCancel: true,
                cancelText: '去录制',
                confirmText: '去选择',
                success: (res) => {
                    if (!res.confirm) {
                        this.startRecordSettingBack()
                    }else {
                        this.getBackSoundListEvent()
                    }
                }
            })
            return false
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
        this.innerAudioContext.stop()
        this.setData({
            'reciprocal.visible': true
        })
        this._reciprocalCount(this.data.reciprocal.count, this.startRecordExecute)  // 倒计时调用 加返回方法
    },
  /**
   * 计算器   计算出录音录制时间
   */
    resetTime: function () {
        this.recordTimeFn = setTimeout(() => {
            clearTimeout(this.recordTimeFn)
            if (!this.data.recordStart || (this.data.recordStart && this.data.isPause)) {
                return false
            }
          /**
           * 如果时间长于590 就停止录制
           */
          if(this.data.recordTime > 590) {
              this.endRecord()
              return false
            }
            this.data.recordTime++
            this.setData({ recordTime:  this.data.recordTime })
            this.resetTime()
        }, 1000)
    },
  /**
   * 录音事件
   * @param e
   */
    startRecordExecute: function () {
      this.cancelRecordParams = false
      this.Recorder.start()
    },
    endRecord: function (e) {
      this.submitRecordAction = false // 重置录音混音完成提交成功后 执行操作
        this.startRecordAction = false
        this.setData({
            recordStart: false,
            isPause: false
        })
        this.Recorder.stop()
    },

    pauseRecord: function () {
        this.Recorder.pause()
        this.setData({isPause: true})
    },

    resumeRecord: function () {
        this.Recorder.resume()
        this.setData({isPause: false})
    },

    cancelRecord: function (e) {
        this.startRecordAction = false
        this.cancelRecordParams = true
        this.setData({
            recordStart: false,
            isPause: false,
            recordTime: 0
        })
        this.Recorder.stop()
    },
  /**
   * 试听
   * @returns {boolean}
   */
    recordPlayEvent: function () {
        const id = 'tryListenID'
        if (this.data.tryParams.isPlay && id === this.data.tryParams.id) {
            this.innerAudioContext.stop()
            return false
        }
        this.data.tryParams.id = id
        this.innerAudioContext.play(this.data.form.fileURL)
    },

    closeRecordOverEvent: function () {
        if (this.innerAudioContext) {
            this.innerAudioContext.stop()
        }
        $wuBackdrop().release()
        this.setData({recordin: false})
    },

    resetEvent: function () {
        this.closeRecordOverEvent()
        /**
        * 清理垃圾录音
        **/
        recordCancel({
            fileURL: this.data.form.fileURL,
            recordURL: this.data.form.recordURL,
            taskID: this.data.form.taskID
        }).then((res) => {})
    },
  /**
   * 链接到背景音列表
   */
    getBackSoundListEvent: function () {
        wx.navigateTo({
            url: `/pages/apply/course/background-sound-list/background-sound-list`
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
     * 监听回调事件
     **/
    _startBack: function () {
        this.setData({recordStart: true})
        this.resetTime() // 获取录制时间
    },
    _stopBack: function (res) {
        if (this.data.recordTime < 15 && !this.cancelRecordParams) {
          $wuToast().show({
                type: 'forbidden',
                duration: 2000,
                color: '#fff',
                text: '录制时间不得低于15秒',
                success: () => {}
            })
            this.setData({
                recordTime: 0
            })
            return false
        }
        if (this.cancelRecordParams) {
            return false
        }
        this.setData({
            'progressParams.visible': true,
            recordTime: 0
        })
        this._getMixtureRecord(res.tempFilePath, this.data.form.musicID, Math.ceil(res.duration)) // 上传到服务器  获取音频合成的接口
    },
    _resumeBack: function () {
        this.resetTime() // 获取录制时间
    },
    _errorBack: function () {
    },
    _interruptionBeginBack: function () {
      this.setData({isPause: true})
    },
    _interruptionEndBack: function () {
      this.setData({isPause: false})
      this.resetTime() // 获取录制时间
    },
    /**
     * audio播放回调方法
     **/
    _audioManagerPlay: function () {
        this.setData({
            'tryParams.isPlay': true,
            'tryParams.id': this.data.tryParams.id
        })
    },
    _audioManagerStop: function () {
        this._audioManagerBackFn()
    },
    _audioManagerEnd: function () {
        this._audioManagerBackFn()
    },
    _audioManagerError: function (res) {
        this._audioManagerBackFn()
    },
    _audioManagerDestroy: function () {
      this.innerAudioContext = null
    },
    _audioManagerBackFn: function () {
        this.setData({
            'tryParams.isPlay': false,
            'tryParams.id': ''
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
   * 初始化获取course数据事件
   * @param id
   * @private
   */
    _initCourseData: function (id) {
        GetLessonInfo({dataID: Number(id)}).then((res) => {
            this.setData({ courseData: res.data })
        })
    },

  /**
   * 上传到服务器  获取音频合成的接口
   * @param path
   * @param musicID
   * @param duration
   * @private
   */
    _getMixtureRecord: function (path, musicID, duration) {
        uploadRecordFile({
            path: path,
            musicID: musicID,
            duration: duration
        },
            (progress) => {
                this.setData({
                    'progressParams.value': progress.progress
                })
            },
            () => {
                this.setData({
                    recordin: false,
                    'progressParams.visible': false
                })
            })
            .then((res) => {
                console.error(res)
                const data = JSON.parse(res.data)
                this.data.form.fileURL = data.file_url
                this.data.form.recordURL = data.record_url
                this.data.form.taskID = data.taskID

                $wuBackdrop().retain() // 打开已经录制的音频层
                this.setData({ recordin: true})
            })
            .catch((ret) => {
              console.error(ret)
              $wuToast().show({
                    type: 'text',
                    duration: 1500,
                    text: '录音合成失败,请重新录制'
                })
            })
    },
    /**
     * 上传完成后合成混音
     */
    submitEvent: function () {
        if(this.submitRecordAction) {
          return false
        }
        submitRecordFile({
                dataID: this.data.form.dataID,
                teamID: this.data.form.teamID,
                fileURL: this.data.form.fileURL,
                recordURL: this.data.form.recordURL,
                musicID: this.data.form.musicID,
                taskID: this.data.form.taskID,
                mode: this.data.mode
            }).then((res) => {
                $wuToast().show({type: 'text', color: '#fff', text: '提交成功', success: () => {}})
                this.closeRecordOverEvent() // 关闭弹出层
                this.submitRecordAction = true // 如果正式提交录音  做记录
                App.globalData.bachgroundSound = null //清空背景音
                setTimeout(() => {
                    wx.navigateTo({
                        url: `/pages/apply/mine/my-record/my-record?id=${res.data}&skip=1`
                    })
                }, 100)
        }).catch((ret) => {
            $wuToast().show({
                type: 'text',
                color: '#fff',
                text: ret.msg,
                success: () => {}
            })
        })
      },
    /**
     * 重置推荐背景音列表
     **/
    _resetBackSound: function () {
        const globalItem = App.globalData.bachgroundSound
        if (!globalItem) {
            this.setData({
              backgroundSoundItem: null,
              'form.musicID': 0
            })
            return false
        }
        this.setData({
            backgroundSoundItem: globalItem,
            'form.musicID': globalItem.MusicID
        })
    }
})