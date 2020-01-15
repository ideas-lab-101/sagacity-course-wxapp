

class recordManager {

    constructor(options) {
        this.recorderManager = null
        this.time = 0
        this.countManager = false

        // 初始化
        this.init(options.listenBack)
    }

    /**
     * 初始化
     **/
    init(BackFn) {
        console.log('this record init')
        this.recorderManager = wx.getRecorderManager()
        this._listenEvent(BackFn)
    }

    free() {
        this.recorderManager = null
        this.time = 0
        this.countManager = false
    }

    start() {
        this.recorderManager.start({
            duration: 600000,
            sampleRate: 44100,
            numberOfChannels: 1,
            encodeBitRate: 192000,
            audioSource: 'auto',
            format: 'aac'
        })
        this.countManager = true
    }

    pause() {
        this.recorderManager.pause()
        this.countManager = false
    }

    stop() {
        if (this.recorderManager) {
            this.recorderManager.stop()
        }
        this.time = 0
        this.countManager = false
    }

    resume() {
        this.recorderManager.resume()
        this.countManager = true
    }

    get totalTime() {
        return this._countTime(this.time)
    }

    /**
     * 内部事件
     **/

    _listenEvent(options) {

        this.recorderManager.onStart( () => {
            console.log('start record')
            this._addTime() // 开始录制的时候 计算时间
            options.startBack && options.startBack()
        })

        this.recorderManager.onPause( () => {
            console.log('pause record')
            options.pauseBack && options.pauseBack(res)
        })

        this.recorderManager.onStop( (res) => {
            console.log('stop record')
            console.log(res)
            const { tempFilePath } = res
            options.stopBack && options.stopBack(res)
        })

        this.recorderManager.onResume( () => {
            this._addTime() // 开始录制的时候 计算时间
            options.resumeBack && options.resumeBack()
        })

        this.recorderManager.onError( (res) => {
            console.error(res)
            options.errorBack && options.errorBack(res)
        })

        this.recorderManager.onInterruptionBegin( () => {
            options.interruptionBeginBack && options.interruptionBeginBack()
        })

        this.recorderManager.onInterruptionEnd( () => {
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


module.exports = recordManager
