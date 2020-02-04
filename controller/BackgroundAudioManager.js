'use strict';

import { lessonDataInfo } from '../request/coursePort'
import { addUserHistory } from '../request/userPort'
import { $wuPlayWidget } from '../components/wu/index'
const BackgroundAudio = require('./BackgroundAudio')

/**
 * BackgroundAudioManager 类定义
 */
class BackgroundAudioManager {
    constructor() {
        this.options = null
        this.pageAudioBack = null
        this.info = {
            openState: null,
            nextID: null,
            prevID: null,
            isEnroll: null
        }
        this.loopState = 'order'

        this.audioBack = {
            canplayFn: this._canplayBack.bind(this),
            playFn: this._playBack.bind(this),
            pauseFn: this._pauseBack.bind(this),
            endFn: this._endBack.bind(this),
            stopFn: this._stopBack.bind(this),
            timeUpdateFn: this._timeUpdateBack.bind(this),
            waitingFn: this._waiting.bind(this),
            seekingFn: this._seeking.bind(this),
            seekedFn: this._seeked.bind(this),
            prevPlayFn: this._prevPlay.bind(this),
            nextPlayFn: this._nextPlay.bind(this)
        }
        /**
         * 初始化播放器
         * @type {audio}
         */
        this.AudioPlayer = new BackgroundAudio()
    }

    get playerOptions() {
        const Player = this.AudioPlayer.getPlayer
        return Object.assign({}, Player, this.options)
    }

    get isPlay() {
        return this.AudioPlayer.getPlayer.play
    }

    create(options, pageAudioBack, info) {
        /**
         * 最后页面的渲染
         * @type {boolean|*}
         */
        const page = this._isResetPage()
        if (page) {
            this.pageAudioBack = page.data.audioBack
        }else {
            this.pageAudioBack = null
        }
        /**
         * 判断是同一首进入 就吧渲染播放
         */
        /*if (this.options && this.options.id === options.id ) {
            return false
        }*/
        this.info = Object.assign({}, this.info, info)
        this.options = {...options}
        this.loopState = options.loopState

        if (!info.isEnroll && info.openState === 0) {
            return false
        }
        this.AudioPlayer.create({...options}, this.audioBack)
    }

    play() {
        this.AudioPlayer.play()
    }

    pause() {
        this.AudioPlayer.pause()
    }

    stop() {
        this.AudioPlayer.stop()
    }

    seek(position) {
        this.AudioPlayer.seek(position)
    }

    setLoopState(state) {
        this.loopState = state
    }

    prevPlay() {
        const id = this.info.prevID
        if (id === 0) {
            return false
        }

        /**
         * 最后页面的渲染
         * @type {boolean|*}
         */
        const page = this._isResetPage()
        if (page) {
            page.__init({id, frame: 0})
            return false
        }
        this.loadNewDataEvent(id)
            .then(res => {
                const {openState, isEnroll} = this.info
                if (!isEnroll && openState === 0) {
                    return false
                }
                this.singleLoop()
            })
    }

    nextPlay() {
        const id = this.info.nextID
        if (id === 0) {
            return false
        }
        /**
         * 最后页面的渲染
         * @type {boolean|*}
         */
        const page = this._isResetPage()
        if (page) {
            page.__init({id, frame: 0})
            return false
        }
        this.loadNewDataEvent(id)
            .then(res => {
                const {openState, isEnroll} = this.info
                if (!isEnroll && openState === 0) {
                    return false
                }
                this.singleLoop()
            })
    }

    singleLoop() {
        if (this.options) {
            const options = Object.assign({}, {...this.options}, { frame: 0})
            this.AudioPlayer.create(options, this.audioBack)
        }
    }

    /**
     * 加载新的数据
     * @param dataID
     * @returns {Promise<T>}
     */
    loadNewDataEvent (dataID) {
        return lessonDataInfo({
            data_id: Number(dataID)
        })
            .then((res) => {
                const data = res.data
                this.info = {
                    openState: data.lesson_data.open_state,
                    nextID: data.next_data_id,
                    prevID: data.pre_data_id,
                    isEnroll: data.is_enroll
                }

                this.options = {
                    id: data.data_id,
                    loopState: this.options.loopState,
                    src: data.lesson_data.data_url,
                    title: data.lesson_data.data_name,
                    epname:  data.lesson_data.lesson_name,
                    coverImgUrl: data.lesson_data.cover_url,
                    frame: 0
                }
                return res
            })
            .catch((ret) => {
                console.error('请求音乐播放源出错!')
            })
    }

    /**
     * 监听方法
     * @private
     */
    _canplayBack(duration) {

        this.pageAudioBack && this.pageAudioBack.canplayFn && this.pageAudioBack.canplayFn(this.options.id)
    }
    _playBack(player) {
        console.log('BackgroundAudioManager play', player)
        /**
         * 更新页面显示的播放组件数据
         * @type {boolean|*}
         */
        const page = this._isResetPage()
        backgroundAudioUpdatePlayWidget(player)

        this.pageAudioBack && this.pageAudioBack.playFn && this.pageAudioBack.playFn(player)
    }
    _pauseBack(currentTime) {
        console.log('BackgroundAudioManager pause', currentTime)
        postHistoryEvent(this.options.id, Math.ceil(currentTime*1000)) // 存储历史记录
        this.pageAudioBack && this.pageAudioBack.pauseFn && this.pageAudioBack.pauseFn()
    }
    _endBack(start) {
        if (this.loopState === 'order') {
            this.nextPlay() // 自动播放下一首
        }else {
            this.singleLoop() // 单曲循环播放
        }

        postHistoryEvent(this.options.id, 0) // 存储历史记录
        this.pageAudioBack && this.pageAudioBack.endFn && this.pageAudioBack.endFn()
    }
    _stopBack() {

        postHistoryEvent(this.options.id, 0) // 存储历史记录
        this.pageAudioBack && this.pageAudioBack.stopFn && this.pageAudioBack.stopFn()
    }
    _timeUpdateBack(currentTime, duration, start, end) {
        this.pageAudioBack && this.pageAudioBack.timeUpdateFn && this.pageAudioBack.timeUpdateFn(currentTime, duration, start, end)
    }
    _waiting(duration) {
        this.pageAudioBack && this.pageAudioBack.waitingFn && this.pageAudioBack.waitingFn()
    }
    _seeking() {
        this.pageAudioBack && this.pageAudioBack.seekingFn && this.pageAudioBack.seekingFn()
    }
    _seeked() {
        this.pageAudioBack && this.pageAudioBack.seekedFn && this.pageAudioBack.seekedFn()
    }

    /**
     * IOS 支持
     * @private
     */
    _prevPlay() {
        this.prevPlay()
    }

    _nextPlay() {
        this.nextPlay()
    }

    /**
     * 私有方法  返回当前路由最后一个页面
     * @returns {boolean|*}
     * @private
     */
    _isResetPage() {
        const lastPage = getCurrentPages()[getCurrentPages().length - 1]
        if ( lastPage.route === 'pages/apply/course/lesson-play/lesson-play') {
            return lastPage
        }
        return false
    }
}

module.exports = BackgroundAudioManager

/**
 * 这里请求新的地址  就给一条记录
 * @param dataID
 * @param frame
 */
const postHistoryEvent = function (dataID, frame) {
    addUserHistory({
        data_id: Number(dataID),
        frame: Number(frame)
    })
        .then((res) => {
            console.log('添加到历史记录')
        })
        .catch(() => {
            console.error('添加历史失败')
        })
}

/**
 * 更新页面播放组件
 * @param player
 */
const backgroundAudioUpdatePlayWidget = function (player) {
    try {
        $wuPlayWidget().upData(player)
    }catch (e) {}
}