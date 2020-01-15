const App = getApp()
const { userFavor, addUserPoint } = require('../../../../request/userPort')
const { audioRequest, getLessonList } = require('../../../../controller/audioRequest')
const WxParse = require('../../../../components/wxParse/wxParse')
const { $wuBackdrop, $wuToast, $wuActionSheet } = require('../../../../components/wu/index')

Page({
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
        info: {},
        lesson: {
            pageNumber: 1,
          lastPage: true,
          list: []
        },

        audioParams: {
            isPlay: false,
            sliderValue: 0,
            currentTime: 0,
            sliderStart: '00:00',
            sliderEnd: '00:00'
        },
        hasPrev: false,
        hasNext: false,
        timeTotal: '00:00',
        state: 'order', // order or loop,

        captionCurrent: 0, // 字幕swiper 序列号
        sliderProgressVisible: false,  // 设置是否显示歌词拖动进度

        progress: 0,
        controlFix: false,
        systemSeries: App.globalData.systemSeries
    },

    onLoad: function (options) {
        this.isLoadPass = true // 判断是否重新进入当夜页面
        this.optionsId = options.id
        this.optionsFrame = options.frame/1000 // 按照之前的帧数进入
        if (options.frame === null || options.frame === undefined) {
            this.optionsFrame = 0
        }
        // this.initAudioRequest(this.optionsId, this.optionsFrame) // 传入ID FRAME 帧数
    },

    onShow: function () {
        this.initAudioRequest(this.optionsId, this.optionsFrame) // 传入ID FRAME 帧数
        /*if(App.accreditLogin) { // 重新加载数据
            App.accreditLogin = false
            this.initAudioRequest(this.optionsId, this.optionsFrame)
        }
        if (!this.isLoadPass) { // 没进入onload 再次进入页面时调用
            if (!this.data.info.is_enroll && App.enroll.has(this.data.info.data.CourseID)){
              this.initAudioRequest(this.optionsId, this.optionsFrame) // 传入ID FRAME 帧数
            }
        }*/
    },

    onHide: function () {
        this.isLoadPass = false
    },

    onUnload: function () {
        // App.globalData.audio.empty()
    },

    onShareAppMessage: function () {
        return {
            imageUrl: `${this.data.info.data.CoverURL}?imageView2/5/h/300`,
            title: this.data.info.data.DataName,
            path: "/pages/apply/course/lesson-play/lesson-play?id=" + this.data.info.data.DataID,
            success: (ret) => {
                addUserPoint({ pointCode: '001'})
            }
        }
    },

    /**
    **  media audio 初始化事件
    **/
    initAudioRequest: function (id, frame) {
        const audioBack = {
            canplayFn: this._canplayBack,
            playFn: this._playBack,
            pauseFn: this._pauseBack,
            endFn: this._endBack,
            stopFn: this._stopBack,
            timeUpdateFn: this._timeUpdateBack,
            waitingFn: this._waiting
        }
        audioRequest(id,
            this.data.state,
            frame,
            audioBack,
            this.initSetPage)
    },

    initSetPage: function (res, isSameID, id) {
        this.setData({ info: res, 'nav.title': res.data.DataName })
        if (this.data.info.data.DataType === 'audio') {
            this.initAudio(id, isSameID)
        } else {
            console.error('文件和文件类型不匹配')
        }
        WxParse.wxParse('detail', 'html', this.data.info.data.Content || '<p style="font-size: 14px;">暂无介绍</p>', this, 5)
    },

    initOperation: function (id) {  // 设置上一条 下一条
        let prev = true
        let next = true

        if (this.data.info.preDataID === 0) {
            prev = false
        }
        if (this.data.info.nextDataID === 0) {
            next = false
        }
        this.setData({
            hasPrev: prev,
            hasNext: next
        })
    },

    initAudio: function (id, isSameID) {
        // 判断进入的时候的 id 是否在播放列表中, 给出结果 是否被中断, 如果中断说明传入ID 不在播放列表中
        this.initOperation(id) // 设置上一条 下一条按钮
       /**
       * 判断是否同一首音频进入 并且是播放状态
       */
        if (isSameID && App.globalData.audio.getPlayer().play) {
            App.globalData.audio.play()
            this.setData({
                'audioParams.isPlay': true
            })
        }else if(isSameID && !App.globalData.audio.getPlayer().play) {
            App.globalData.audio.play()
        }
    },

    /**
    **  页面触发事件
    **/

    turnBackPageEvent: function () {
        wx.navigateTo({
            url: `/pages/apply/course/lesson-page/lesson-page?id=${this.data.info.data.CourseID}`
        })
    },

    goRecordListEvent: function () {
        if (!this.data.info.data.rCount || this.data.info.data.rCount === 0) {
            return false
        }
        wx.navigateTo({
            url: `/pages/apply/course/record-list/record-list?id=${this.data.info.data.DataID}`
        })
    },

    audioPlayEvent: function () {
        if (App.globalData.audio.getPlayer().end && App.globalData.audio.getPlayer().stop) {
            return false
        }
        if (!this.data.info.is_enroll && this.data.info.data.openState === 0) {
            wx.showModal({
                title: '',
                content: '您还没有加入此课，还不能查看',
                showCancel: true,
                cancelText: '算了',
                confirmText: '去加入',
                success: (res) => {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: `/pages/apply/course/lesson-page/lesson-page?id=${this.data.info.data.CourseID}`
                        })
                    }
                }
            })
            return false
        }

        if (!this.data.audioParams.isPlay) {
            App.globalData.audio.play()
            this.setData({
                'audioParams.isPlay': true
            })
        } else {
            App.globalData.audio.pause()
            this.setData({
                'audioParams.isPlay': false
            })
        }
    },

    audioPrevEvent: function () {
        if (!this.data.hasPrev) {
            return false
        }
        App.globalData.audio.stop() // 先暂停   防止在播放试听而没加入的下一首产生
        this.optionsId = this.data.info.preDataID
        this.optionsFrame = 0
        this.initAudioRequest(this.data.info.preDataID)   // 重新请求数据
    },

    audioNextEvent: function () {
        if (!this.data.hasNext) {
            return false
        }
        App.globalData.audio.stop() // 先暂停   防止在播放试听而没加入的下一首产生
       this.optionsId = this.data.info.nextDataID
       this.optionsFrame = 0
       this.initAudioRequest(this.data.info.nextDataID)   // 重新请求数据
    },

    audioLoopEvent: function () {
        let txt = ''
        if (this.data.state === 'order') {
            this.setData({
                state: 'loop'
            })
            App.globalData.audio.setLoopState('loop')
            txt = '单曲循环'
        }else {
            this.setData({
                state: 'order'
            })
            App.globalData.audio.setLoopState('order')
            txt = '顺序播放'
        }
        $wuToast().show({
            type: 'text',
            duration: 1000,
            text: txt
        })
    },

    changeAudioEvent: function (e) {
        const openState = e.currentTarget.dataset.openstate
        const id = e.currentTarget.dataset.id
        if (this.data.info.is_enroll || (!this.data.info.is_enroll && openState === 1)) {
            this.initAudioRequest(id)
        }else {
            wx.showModal({
                title: '',
                content: '尚未加入，不能查看',
                confirmText: '去加入',
                cancelText: '算了',
                success: (res) => {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: `/pages/apply/course/lesson-page/lesson-page?id=${this.data.info.data.CourseID}`
                        })
                    }
                }
            })
        }
    },

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
        if(this.data.lesson.list.length <= 0) {
          this._getLessonList().then(res => {
            $wuBackdrop('#wu-backdrop-catalog', this).retain()
            this.setData({ catalogin: true })
          })
          return false
        }
        $wuBackdrop('#wu-backdrop-catalog', this).retain()
        this.setData({ catalogin: true })
    },

    closeCatalogEvent: function (e) {
        $wuBackdrop('#wu-backdrop-catalog', this).release()
        this.setData({ catalogin: false})
    },

    _getLessonList() {
        this.isLoading = true
        return getLessonList({
          courseID: this.data.info.data.CourseID,
          page: this.data.lesson.pageNumber
        }).then(res => {
          console.log(res)
          this.isLoading = false
          this.setData({ 'lesson.list': this.data.lesson.list.concat(res.list),  'lesson.lastPage': res.lastPage})
          return true
        })
    },

    lessonScollTolowerEvent() {
        if(this.data.lesson.lastPage || this.isLoading) {
            return false
        }
        this.data.lesson.pageNumber++
        this._getLessonList()
    },

  /**
   * 课程收藏
   * @param e
   */
    collectEvent: function () {
        userFavor({dataID: Number(this.data.info.data.DataID), type: 'ld'}).then((res) => {
            this.setData({
                'info.is_favor': res.is_favor
            })
            $wuToast().show({
                type: 'text',
                duration: 1000,
                text: res.msg
            })
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
            wx.showModal({
                title: '',
                content: '尚未加入，不能查看',
                confirmText: '去加入',
                cancelText: '算了',
                success: (res) => {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: `/pages/apply/course/lesson-page/lesson-page?id=${this.data.info.data.CourseID}`
                        })
                    }
                }
            })
            return false
        }

        const self = this
        $wuActionSheet().showSheet({
            titleText: '请选择录制模式',
            buttons: [{
                text: '朗诵(显示字幕)'
                },
                {
                text: '背诵(不显示字幕)'
                },
            ],
            buttonClicked(index, item) {
                let readMode = 0
                if(index === 1) {
                  readMode = 1
                }

                App.globalData.audio.pause()
                setTimeout(() => {
                  wx.navigateTo({
                    url: `/pages/apply/course/record/record?id=${self.data.info.data.DataID}&mode=${readMode}` // readMode 背诵还是朗诵
                  })
                }, 100)
                return true
            },
            cancelText: '取消',
            cancel() {}
        })
    },

    sliderChangeEvent: function (e) {
        if (!this.duration) {
            console.error('获取总长度出错')
            return false
        }
        const position = this.duration*e.detail.value / 100
        App.globalData.audio.seek(position)
        App.globalData.audio.play()
    },

    controlFixEvent: function (e) {
        let temp = 0
        if(e.detail.value) {
          temp = 1
        }
        this.setData({controlFix: e.detail.value, captionCurrent: temp})
    },

    /**
    **  audio监听回调方法
    **/
    _canplayBack: function (duration) {
        this.duration = duration
    },
    _playBack: function (id) {
        console.log('play')
        this.setData({
            'audioParams.isPlay': true,
            sliderProgressVisible: true
        })
    },
    _pauseBack: function () {
        console.log('pause')
        this.setData({
            'audioParams.isPlay': false
        })
    },
    _stopBack: function () {
        console.log('stop')
        this.setData({
            'audioParams.isPlay': false,
            progress: 0,
            sliderProgressVisible: false
        })
    },
    _endBack: function (start) {
        console.log('end')
        this.duration = 0
        this.setData({
            'audioParams.isPlay': false,
            'audioParams.sliderValue': 0,
            progress: 0,
            sliderProgressVisible: false
        })
    },
    _timeUpdateBack: function (currentTime, duration, start, end) {
        this.duration = duration
        if (Math.round(currentTime) === Math.round(duration) || Math.ceil(currentTime) === Math.ceil(duration)) {
            currentTime = duration
        }

        let sector = (currentTime*100/duration)/100
        const sliderVal =  currentTime*100 / duration

        this.setData({
            'audioParams.currentTime': currentTime,
            timeTotal: end,
            'audioParams.sliderValue': sliderVal,
            'audioParams.sliderStart': start,
            'audioParams.sliderEnd': end,
            progress: sector,
            sliderProgressVisible: true
        })
    },
    _waiting: function () {
        console.log('Audio waiting')
    }
})
