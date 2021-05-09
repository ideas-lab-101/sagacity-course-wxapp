'use strict';
class InnerAudioManager {
    constructor(backFn) {
        this.innerAudioContext = null
        this.backFn = backFn
        this.__init(backFn)
    }

    __init(backFn) {
        console.log('this innerAudio manager init')
        this.innerAudioContext = wx.createInnerAudioContext()
        if (wx.setInnerAudioOption) {
            wx.setInnerAudioOption({
                mixWithOther: false,
                obeyMuteSwitch: false
            })
        } else {
            this.innerAudioContext.obeyMuteSwitch = false
        }
        this.innerAudioContext.autoplay = true
        this.__listenEvent(this.innerAudioContext, backFn)
    }

    play(url) {
        if (url) {
            this.innerAudioContext.src = url
        }
        this.innerAudioContext.play()
    }

    pause() {
        this.innerAudioContext.pause()
    }

    seek(percent) {
        if (this.seekFn) {
            clearTimeout(this.seekFn)
        }
        this.pause()
        this.seekFn = setTimeout(() => {
            this.seekFrame = parseInt(percent * this.duration)
            this.innerAudioContext.seek(Number(this.seekFrame))
        }, 10)
    }

    stop() {
        if (this.innerAudioContext) {
            this.innerAudioContext.stop()
            this.innerAudioContext.src = ''
        }
    }

    destroy() {
        this.innerAudioContext.destroy()
        this.innerAudioContext = null
        this.src = null
        this.backFn && this.backFn.destroy && this.backFn.destroy()
    }

    /**
     * 内部事件
     **/
    __filterTime(time) {
        const max = parseInt(time / 60)
        return this.__prefixTime(max) + ':' + this.__prefixTime(parseInt(time % 60))
    }

    __prefixTime(num) {
        return Number(num) < 10 ? '0' + num : num;
    }

    __listenEvent(manager, options) {

        Object.keys(manager).map(item => {
            const str = "on";
            if (typeof manager[item] === "function" && item.includes(str)) {
                manager[item]((response) => {
                    let params = {}

                    switch (item) {
                        case "onPlay":
                            this.isEnded = false
                            break;
                        case "onSeeked":
                            this.play()
                            break;
                        case "onTimeUpdate":
                            this.duration = this.innerAudioContext.duration
                            params = {
                                duration: this.innerAudioContext.duration,
                                currentTime: this.innerAudioContext.currentTime,
                                durationFormat: this.__filterTime(this.innerAudioContext.duration),
                                currentTimeFormat: this.__filterTime(this.innerAudioContext.currentTime)
                            }
                            break;
                    }

                    if (response && typeof response === "object") {
                        params = Object.assign({}, response, params);
                    }
                    options && options[item] && options[item](params);
                })
            }
        })
    }
}

module.exports = InnerAudioManager;
