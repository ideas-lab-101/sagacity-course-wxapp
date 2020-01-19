'use strict';

class RecordManager {

    constructor(options = {}, listenFn) {
        if (!listenFn) {
            listenFn = {...options}
        }
        this.options = Object.assign({}, {
            duration: 600000,
            sampleRate: 44100,
            numberOfChannels: 1,
            encodeBitRate: 192000,
            audioSource: 'auto',
            format: 'aac'
        }, options)
        this.RecorderManager = null
        this.time = 0
        this.countManager = false
        /**
         * 初始化
         */
        this.init(listenFn)
    }

    /**
     * 初始化
     **/
    init(BackFn) {
        console.log('The record init')
        this.RecorderManager = wx.getRecorderManager()
        this._listenEvent(this.RecorderManager, BackFn)
    }

    free() {
        this.RecorderManager = null
        this.time = 0
        this.countManager = false
    }

    start() {
        this.RecorderManager.start(this.options)
        this.countManager = true
    }

    pause() {
        this.RecorderManager.pause()
        this.countManager = false
    }

    stop() {
        if (this.RecorderManager) {
            this.RecorderManager.stop()
        }
        this.time = 0
        this.countManager = false
    }

    resume() {
        this.RecorderManager.resume()
        this.countManager = true
    }

    get totalTime() {
        return this._countTime(this.time)
    }

    /**
     * 内部事件
     **/

    _listenEvent(manager, options) {

        manager.onStart( () => {
            console.log('start record')
            this._addTime() // 开始录制的时候 计算时间
            options.startBack && options.startBack()
        })

        manager.onPause( () => {
            console.log('pause record')
            options.pauseBack && options.pauseBack(res)
        })

        manager.onStop( (res) => {
            console.log('stop record', res)
            options.stopBack && options.stopBack(res)
        })

        manager.onResume( () => {
            this._addTime() // 开始录制的时候 计算时间
            options.resumeBack && options.resumeBack()
        })

        manager.onError( (res) => {
            console.error(res)
            options.errorBack && options.errorBack(res)
        })

        manager.onInterruptionBegin( () => {
            this.pause()
            options.interruptionBeginBack && options.interruptionBeginBack()
        })

        manager.onInterruptionEnd( () => {
            this.resume()
            options.interruptionEndBack && options.interruptionEndBack()
        })

    }

    _addTime() {
        if (this.countManager) {
            this.time++
            clearTimeout(this.countFn)
            this.countFn = setTimeout(() => {
                this._addTime()
            }, 1000)
        }
    }

    _countTime(time) {
        let minute = parseInt(time/60)
        let second = time - minute*60
        return this._prefixTime(minute) + ':' + this._prefixTime(second)
    }

    _prefixTime(num) {
        return num < 10 ? '0'+num : num
    }

}
module.exports = RecordManager
