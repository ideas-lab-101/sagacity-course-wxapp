'use strict';

class InnerAudioManager {
    constructor(backFn) {
        this.innerAudioContext = null
        this.backFn = backFn
        // 初始化
        this.init(backFn)
    }

    /**
     * 初始化
     **/
    init(backFn) {
        console.log('this audio manager init')
        this.innerAudioContext = wx.createInnerAudioContext()
        if(wx.setInnerAudioOption) {
            wx.setInnerAudioOption({
                mixWithOther: false,
                obeyMuteSwitch: false
            })
        }else {
            this.innerAudioContext.obeyMuteSwitch = false
        }
        this.innerAudioContext.autoplay = true
        this._listenEvent(backFn)
    }

    play(url) {
        if(url) {
            this.innerAudioContext.src = url
        }
        this.innerAudioContext.play()
    }

    pause() {
        this.innerAudioContext.pause()
    }

    seek(percent) {
        if(this.seekFn) {
            clearTimeout(this.seekFn)
        }
        this.pause()
        this.seekFn = setTimeout(() => {
            this.seekFrame = parseInt(percent * this.duration)
            this.innerAudioContext.seek(Number(this.seekFrame))
        }, 10)
    }

    stop(){
        if(this.innerAudioContext) {
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
    _filterTime(time) {
        const max = parseInt(time / 60)
        return this._prefixTime(max) + ':' + this._prefixTime(parseInt(time % 60))
    }

    _prefixTime(num) {
        return num < 10 ? '0'+num : num;
    }

    _listenEvent(options) {

        this.innerAudioContext.onPlay( () => {
            console.log('play')
            this.isEnded = false
            options && options.play && options.play()
        })

        this.innerAudioContext.onPause( () => {
            console.log('onPause')
            options && options.pause && options.pause()
        })

        this.innerAudioContext.onStop( () => {
            options && options.stop && options.stop()
        })

        this.innerAudioContext.onWaiting( () => {
            console.log('onWaiting')
            options && options.waiting && options.waiting()
        })

        this.innerAudioContext.onSeeked( () => {
            console.log('onSeeked')
            this.play()
        })

        this.innerAudioContext.onEnded( () => {
            console.log('ended')
            options && options.end && options.end()
        })

        this.innerAudioContext.onError( (res) => {
            options && options.error && options.error(res)
        })

        this.innerAudioContext.onCanplay( () => {
            console.log('can play')
            options && options.canPlay && options.canPlay()
        })

        this.innerAudioContext.onTimeUpdate( () => {
            this.duration = this.innerAudioContext.duration
            const proto = {
                duration: this.innerAudioContext.duration,
                currentTime: this.innerAudioContext.currentTime,
                durationFormat: this._filterTime(this.innerAudioContext.duration),
                currentTimeFormat: this._filterTime(this.innerAudioContext.currentTime)
            }
            options && options.timeUpdate && options.timeUpdate(proto)
        })
    }
}

module.exports = InnerAudioManager