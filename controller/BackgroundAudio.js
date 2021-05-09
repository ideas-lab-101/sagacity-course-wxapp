'use strict';
class BackgroundAudio {
    constructor() {
        this.backgroundAudioManager = null

        this.duration = 0
        this.currentTime = 0
        this.start = 0
        this.end = 0

        this.player = {
            id: null,
            play: false,
            pause: false,
            stop: false,
            end: false,
            loopState: 'order', // order or loop
            src: null,
            title: '暂无标题',
            epname: '暂无标题',
            coverImgUrl: null,
            frame: 0
        }
        this.__init()
    }

    /**
     * 初始化
     **/
    __init() {
        console.log('This background audio init')
        this.backgroundAudioManager = wx.getBackgroundAudioManager()
    }

    get getPlayer() {
        return this.player
    }

    setPlayer(options = {}) {
        this.player = Object.assign({}, { ...this.player }, { ...options })
    }

    setLoopState(state) {
        this.player.loopState = state
    }

    empty() {
        if (this.backgroundAudioManager.paused) {
            this.backgroundAudioManager = null
        }
    }

    create(options = {}, backFn) {
        if (this.backgroundAudioManager === null) {
            console.error(' The BackgroundAudioManager is undefined')
            return false
        }
        const { stop, end, pause, play, id } = this.player
        /**
         * 判断是否从挂件进入   id相同在播放状态就不重新加载  如果是暂停进入也不加载
         */
        let isSameID = false
        if (id !== null && id === options.id) {
            isSameID = true
        }
        if ((isSameID && !stop && !end && !pause && play) || (isSameID && !stop && !end && pause && !play)) {
            return false
        }

        /**
         * 创建新的播放信息  初始化播放信息参数
         * @type {({} & {play: boolean, coverImgUrl: null, epname: string, stop: boolean, src: null, loopState: string, end: boolean, id: null, title: string, pause: boolean, frame: number}) | any}
         */
        this.player = Object.assign({}, this.player, { ...options })

        console.log('背景音开始播放')
        this.backgroundAudioManager.src = this.player.src
        this.backgroundAudioManager.title = this.player.title
        this.backgroundAudioManager.epname = this.player.epname
        this.backgroundAudioManager.coverImgUrl = this.player.coverImgUrl
        if (Number(this.player.frame) > 0) {
            setTimeout(() => {
                this.backgroundAudioManager.seek(Number(this.player.frame))
            }, 100)
        }
        this.player.play = true
        /**
         * 监听事件
         */
        this._listenEvent(this.backgroundAudioManager, backFn)
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

    stop() {
        if (this.backgroundAudioManager) {
            this.backgroundAudioManager.stop()
        }
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
        this.start = this._prefixTime(parseInt(offset / 60)) + ':' + this._prefixTime(parseInt(offset % 60))
        this.backgroundAudioManager.seek(offset)
    }
    /**
     * 内部事件
     **/
    _filterTime(time) {
        const max = parseInt(time / 60)
        return this._prefixTime(max) + ':' + this._prefixTime(parseInt(time % 60))
    }

    _prefixTime(num) {
        return num < 10 ? '0' + num : num;
    }

    /**
     * 事件监听
     * @param manager
     * @param fns
     * @private
     */
    _listenEvent(manager, fns) {

        manager.onPlay(() => {
            this.setPlayer({
                play: true,
                pause: false,
                stop: false,
                end: false
            })

            if (manager.duration) {
                this.duration = manager.duration
            }
            fns && fns.playFn && fns.playFn(this.player)
        })

        manager.onPause(() => {
            this.setPlayer({
                play: false,
                pause: true,
                stop: false,
                end: false
            })

            fns && fns.pauseFn && fns.pauseFn(this.currentTime)
        })

        manager.onStop(() => {
            this.setPlayer({
                play: false,
                pause: false,
                stop: true,
                end: false
            })

            fns && fns.stopFn && fns.stopFn()
        })

        manager.onTimeUpdate(() => {
            this.duration = this.backgroundAudioManager.duration
            this.currentTime = this.backgroundAudioManager.currentTime
            if (!this.currentTime || this.currentTime > this.duration) {
                this.currentTime = 0
            }
            this.start = this._filterTime(this.currentTime)
            this.end = this._filterTime(this.duration)

            fns && fns.timeUpdateFn && fns.timeUpdateFn(this.currentTime, this.duration, this.start, this.end)
        })

        manager.onEnded(() => {
            this.setPlayer({
                play: false,
                pause: false,
                stop: true,
                end: true
            })

            manager.seek(0)
            this.start = this._filterTime(0)

            fns && fns.endFn && fns.endFn(this.start)
        })

        manager.onPrev(() => { // ios only
            fns && fns.prevPlayFn && fns.prevPlayFn(this.start)
        })

        manager.onNext(() => { // ios only
            fns && fns.nextPlayFn && fns.nextPlayFn(this.start)
        })

        manager.onSeeking(() => {
            fns && fns.seekingFn && fns.seekingFn()
        })

        manager.onSeeked(() => {
            fns && fns.seekedFn && fns.seekedFn()
        })

        manager.onError((err) => {
            console.error('BackgroundAudio：', err)
            fns && fns.errorFn && fns.errorFn(err)
        })

        manager.onCanplay(() => {
            if (manager.duration) {
                this.duration = manager.duration
            }
            fns && fns.canplayFn && fns.canplayFn(this.duration)
        })

        manager.onWaiting(() => {
            if (manager.duration) {
                this.duration = manager.duration
            }
            fns && fns.waitingFn && fns.waitingFn(this.duration)
        })
    }
}

module.exports = BackgroundAudio;
