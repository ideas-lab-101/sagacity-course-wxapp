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
            seekedFn: this._seeked.bind(this)
        }
        /**
         * 初始化播放器
         * @type {audio}
         */
        this.AudioPlayer = new BackgroundAudio()
    }

    create(options, pageAudioBack, info) {
        this.info = Object.assign({}, this.info, info)
        this.options = options
        this.pageAudioBack = pageAudioBack

        if (!info.isEnroll && info.openState === 0) {
            return false
        }
        this.AudioPlayer.create(options, this.audioBack)
    }

    play() {
        this.AudioPlayer.play()
    }

    pause() {
        this.AudioPlayer.pause()
    }

    seek(position) {
        this.AudioPlayer.seek(position)
    }

    prevPlay() {
        const id = this.info.prevID
        if (id === 0) {
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
        this.AudioPlayer.create(this.options, this.audioBack, this.info)
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
                const loopState = this.options.loopState

                this.options = {
                    id: data.data_id,
                    loopState,
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
    _playBack(id) {
        console.log('BackgroundAudioManager play', id)
        this.pageAudioBack && this.pageAudioBack.playFn && this.pageAudioBack.playFn(id)
    }
    _pauseBack(currentTime) {
        console.log('BackgroundAudioManager pause', currentTime)
        postHistoryEvent(this.options.id, Math.ceil(currentTime*1000)) // 存储历史记录
        this.pageAudioBack && this.pageAudioBack.pauseFn && this.pageAudioBack.pauseFn()
    }
    _endBack(start) {
        setTimeout(() => {
            if (this.options.loopState === 'order') {
                this.nextPlay() // 自动播放下一首
            }else {
                this.singleLoop() // 单曲循环播放
            }
        }, 200)

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


const postHistoryEvent = function (dataID, frame) {
    // 这里请求新的地址  就给一条记录
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

const audioEndClearPlayWidget = function () {
    // 重置palyWidget 组件中的数据
    const player = getApp().backgroundAudio.getPlayer()
    $wuPlayWidget().upData(player)
}