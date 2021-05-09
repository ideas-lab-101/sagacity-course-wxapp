'use strict';
class RecordManager {
    constructor(options = {}, listenFn) {
        if (!listenFn) {
            listenFn = { ...options }
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
        this.__init(listenFn)
    }

    __init(listenFn) {
        console.log('The record init')
        this.RecorderManager = wx.getRecorderManager()
        this.__listenEvent(this.RecorderManager, listenFn)
    }

    free() {
        this.RecorderManager = null
        this.time = 0
        this.countManager = false
    }

    start() {
        console.log(this.RecorderManager, this.options)
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

    __listenEvent(manager, options) {
        Object.keys(manager).map(item => {
            const str = "on";
            if (typeof manager[item] === "function" && item.includes(str)) {
                manager[item]((response) => {
                    console.log(`innerAudio ${item}`, response);
                    let params = {}

                    switch (item) {
                        case "onStart":
                            this.counter = true;
                            this.__addTime(); // 开始录制的时候 计算时间
                            break;
                        case "onPause":
                            this.counter = false;
                            break;
                        case "onStop":
                            this.time = 0;
                            this.counter = false;
                            break;
                        case "onResume":
                            this.counter = true;
                            this.__addTime(); // 开始录制的时候 计算时间
                            break;
                        case "onInterruptionBegin":
                            this.RecorderManager.pause();
                            break;
                        case "onInterruptionEnd":
                            this.RecorderManager.resume();
                            break;
                    }

                    if (response && typeof response === "object") {
                        params = Object.assign({}, response, params);
                    }
                    options && options[item] && options[item](params);
                });
            }
        })
    }

    __addTime() {
        if (this.countManager) {
            this.time++
            clearTimeout(this.countFn)
            this.countFn = setTimeout(() => {
                this.__addTime()
            }, 1000)
        }
    }

    __countTime(time) {
        let minute = parseInt(time / 60)
        let second = time - minute * 60
        return this.__prefixTime(minute) + ':' + this.__prefixTime(second)
    }

    __prefixTime(num) {
        return Number(num) < 10 ? '0' + num : num
    }

}
module.exports = RecordManager
