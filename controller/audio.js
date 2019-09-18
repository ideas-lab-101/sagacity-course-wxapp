const { audioRequest, postHistoryEvent, audioEndClearPlayWidget } = require('./audioRequest')

class audio {
    constructor() {
        this.backgroundAudioManager = null

        this.duration = 0
        this.start = 0
        this.currentTime = 0
        this.end = 0

        this.player = {
            id: '',
            play: false,
            pause: false,
            stop: false,
            end: false,
            loopState: 'order', // order or loop
            src: '',
            title: '',
            epname: '',
            coverImgUrl: ''
        }
        this.res = ''
        this.backFn = ''
        // 初始化
        this.init()
    }

    /**
     * 初始化
     **/
    init() {
        console.log('this audio init')
        this.backgroundAudioManager = wx.getBackgroundAudioManager()
    }

    getPlayer() {
        return this.player
    }

    setPlayer(options = {}) {
        this.player.play = options.play
        this.player.pause = options.pause
        this.player.stop = options.stop
        this.player.end = options.end
    }

    setLoopState(state) {
        this.player.loopState = state
    }

    empty() {
        if (this.backgroundAudioManager.paused) {
            this.backgroundAudioManager = null
        }
    }

    create(isSameID, res, loopState, frame, backFn) {
        if (this.backgroundAudioManager === null) {
            console.error(' The BackgroundAudioManager is undefined')
            return false
        }

       /**
       * 判断是否从挂件进入   id相同在播放状态就不重新加载  如果是暂停进入也不加载
       */
        if ((isSameID && !this.player.stop && !this.player.end  && !this.player.pause && this.player.play) || (isSameID && !this.player.stop && !this.player.end  && this.player.pause && !this.player.play)) {
          return false
        }
        // 创建新的播放信息  初始化播放信息参数
        this.res = res
        this.backFn = backFn
        this.player = {
            id: res.data.DataID,
            loopState: loopState ? loopState : 'order',
            src: res.data.DataURL,
            title: res.data.LessonName ? res.data.LessonName : '暂无标题',
            epname: res.data.DataName ? res.data.DataName : '暂无标题',
            coverImgUrl: res.data.CoverURL,
            play: false,
            pause: false,
            stop: false,
            end: false
        }
        if (frame === null || frame === undefined) {
          frame = 0
        }

        if(res.is_enroll || (!res.is_enroll && res.data.openState === 1)) {
          console.log('开始播放')
          this.backgroundAudioManager.src = res.data.DataURL
          this.player.play = true
          setTimeout(() => {
            this.backgroundAudioManager.seek(Number(frame))
          }, 100)
        }
        this.backgroundAudioManager.title = res.data.LessonName ? res.data.LessonName : '暂无标题'
        this.backgroundAudioManager.epname = res.data.DataName ? res.data.DataName : '暂无标题'
        this.backgroundAudioManager.coverImgUrl  = res.data.CoverURL
        this._listenEvent(backFn) // 监听事件
    }


    getFilterPlayList(res) {
        let openStateArr = []
        res.lessonList.forEach((item, index) => { // 存储开发播放的数据
            item.LessonData.forEach((i, j) => {

                if (!res.is_enroll && item.openState === 1) { // 是否加入  是否是试听
                    openStateArr.push(Number(i.DataID))
                }else if(res.is_enroll) {
                    openStateArr.push(Number(i.DataID))
                }

            })
        })
        return openStateArr
    }

    play() {
        if (this.player.end) {
            this.player.end = false
            return false
        }
        this.backgroundAudioManager.play()
    }

    pause() {
        this.backgroundAudioManager.pause()
    }

    stop(){
        if (this.backgroundAudioManager) {
            this.backgroundAudioManager.stop()
        }
    }

    prevPlay() {
        if (this.res.preDataID !== 0) {
            const page = this._isResetPage() // 重新执行页面渲染
            let temp = null
            if (page) {
                temp = page.initSetPage
            }
            audioRequest(this.res.preDataID, this.player.loopState, 0, this.backFn, temp).then(() => {   // 重新请求数据
                if (!this._isResetPage()) {
                    audioEndClearPlayWidget() // 反向更新播放小组件
                }
            })
        }else {
            if (!this._isResetPage()) {
                audioEndClearPlayWidget() // 反向更新播放小组件
            }
        }
    }

    nextPlay() {
        if (this.res.nextDataID !== 0) {
            const page = this._isResetPage() // 重新执行页面渲染
            let temp = null
            if (page) {
                temp = page.initSetPage
            }

            // 重新请求数据
            audioRequest(this.res.nextDataID, this.player.loopState, 0, this.backFn, temp).then(() => {
                if (!this._isResetPage()) {
                    audioEndClearPlayWidget() // 反向更新播放小组件
                }
            })
        }else {
            if (!this._isResetPage()) {
                audioEndClearPlayWidget() // 反向更新播放小组件
            }
        }
    }

    singleLoop() {
        this.create(true, this.res, this.player.loopState, 0, this.backFn)
    }

    /**
     * 手动跳转
     **/
    seek(position) {
        const buffered = this.backgroundAudioManager.buffered
        let offset = parseInt(position)
        if (buffered < position) {
            offset = buffered
        }
        const starttime = this._prefixTime(parseInt(offset / 60)) + ':' + this._prefixTime(parseInt(offset % 60))
        this.start = starttime
        this.backgroundAudioManager.seek(offset)
    }
    /**
     * 内部事件
     **/
    _fiterTime(time) {
        var max = parseInt(time / 60)
        return this._prefixTime(max) + ':' + this._prefixTime(parseInt(time % 60))
    }

    _prefixTime(num) {
        return num < 10 ? '0'+num : num;
    }

    _isResetPage() {
        const lastPage = getCurrentPages()[getCurrentPages().length - 1]
        if ( lastPage.__route__ === 'pages/apply/course/lesson-play/lesson-play') {
            return lastPage
        }
        return false
    }

    _timeupdate() {
        this.duration = this.backgroundAudioManager.duration
        this.currentTime = this.backgroundAudioManager.currentTime
        if (!this.currentTime || this.currentTime > this.duration) {
            this.currentTime = 0
        }
        this.start = this._fiterTime(this.currentTime)
        this.end = this._fiterTime(this.duration)
    }

    _listenEvent(options) {

        this.backgroundAudioManager.onPlay( () => {
            this.setPlayer({play: true, pause: false, stop: false, end: false})
            if (this.backgroundAudioManager.duration) {
                this.duration = this.backgroundAudioManager.duration
            }

            const page = this._isResetPage() // 重新执行页面渲染
            if (options && options.playFn && page) {
                try {
                    page[options.playFn.name.split('bound ')[1]](this.player.id)
                }catch (err) {}
            }else {
                options.playFn(this.player.id)
            }
        })

        this.backgroundAudioManager.onPause( () => {
            this.setPlayer({play: false, pause: true, stop: false, end: false})
            postHistoryEvent(this.player.id, Math.ceil(this.currentTime*1000)) // 存储历史记录

            const page = this._isResetPage() // 重新执行页面渲染
            if (options && options.pauseFn && page) {
                try {
                    page[options.pauseFn.name.split('bound ')[1]]()
                }catch (err) {}
            }else {
                options.pauseFn()
            }
        })

        this.backgroundAudioManager.onStop( () => {
            this.setPlayer({play: false, pause: false, stop: true, end: false})
            postHistoryEvent(this.player.id, 0) // 存储历史记录

            const page = this._isResetPage() // 重新执行页面渲染
            if (options && options.stopFn && page) {
                try {
                    page[options.stopFn.name.split('bound ')[1]]()
                }catch (err) {}
            }else {
                options.stopFn()
            }
        })

        this.backgroundAudioManager.onTimeUpdate( () => {
            this._timeupdate()

            const page = this._isResetPage() // 重新执行页面渲染
            if (options && options.timeUpdateFn && page) {
                try {
                    page[options.timeUpdateFn.name.split('bound ')[1]](this.currentTime, this.duration, this.start, this.end)
                }catch (err) {}
            }else {
                options.timeUpdateFn(this.currentTime, this.duration, this.start, this.end)
            }
        })

        this.backgroundAudioManager.onEnded( () => {
            this.setPlayer({play: false, pause: false, stop: true, end: true})
            postHistoryEvent(this.player.id, 0) // 存储历史记录

            this.backgroundAudioManager.seek(0)
            this.start = this._fiterTime(0)

            setTimeout(() => {
                if (this.player.loopState === 'order') {
                    this.nextPlay() // 自动播放下一首
                }else {
                    this.singleLoop() // 单曲循环播放
                }
            }, 200)

            const page = this._isResetPage() // 重新执行页面渲染
            if (options && options.endFn && page) {
                try {
                    page[options.endFn.name.split('bound ')[1]](this.start)
                }catch (err) {}
            }else {
                options.endFn(this.start)
            }
        })

        this.backgroundAudioManager.onPrev( () => { // ios only
            this.prevPlay() // 上一首
        })

        this.backgroundAudioManager.onNext( () => { // ios only
            this.nextPlay() // 下一首
        })

        this.backgroundAudioManager.onError( () => {
        })

        this.backgroundAudioManager.onCanplay( () => {
            if (this.backgroundAudioManager.duration) {
                this.duration = this.backgroundAudioManager.duration
            }
            options && options.canplayFn && this._isResetPage() && options.canplayFn(this.duration)
        })

        this.backgroundAudioManager.onWaiting( () => {
            if (this.backgroundAudioManager.duration) {
                this.duration = this.backgroundAudioManager.duration
            }
            options && options.waitingFn && this._isResetPage() && options.waitingFn(this.duration)
        })
    }

}

module.exports = audio