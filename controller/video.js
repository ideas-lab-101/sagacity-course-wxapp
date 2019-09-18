class video {
    constructor() {
        this.videoEnd = false
        this.videoContext = null
        this.init()
    }

    /**
     * 初始化
     *
     * @returns boolean
     * @memberof User
     */
    init() {
        this.videoContext = wx.createVideoContext('video-player')
        this._screenChangeManager()
    }

    create(options) {
        wx.startAccelerometer()
    }

    play() {
        this.videoContext.play()
    }

    pause() {
        this.videoContext.pause()
    }

    stop() {
        this.videoContext.stop()
    }

    clear() {
        wx.stopAccelerometer()
    }
    /**
     * 内部事件
     **/
    _fiterTime(time) {
        var max = parseInt(time / 60)
        return this.filterTime(max) + ':' + this.filterTime(parseInt(time % 60))
    }

    _filterTime(num) {
        return num < 10 ? '0'+num : num;
    }

    _screenChangeManager(){
        let lastState = 0
        let lastTime = Date.now()
        const that = this

        wx.onAccelerometerChange((res) => {
            const now = Date.now()
            // 500ms检测一次
            if (now - lastTime < 500) {
                return
            }
            lastTime = now
            let nowState
            // 57.3 = 180 / Math.PI
            const Roll = Math.atan2(-res.x, Math.sqrt(res.y * res.y + res.z * res.z)) * 57.3
            const Pitch = Math.atan2(res.y, res.z) * 57.3
            // console.log('Roll: ' + Roll, 'Pitch: ' + Pitch)

            // 横屏状态
            if (Roll > 50) {
                if ((Pitch > -180 && Pitch < -60) || (Pitch > 130)) {
                    nowState = 1
                } else {
                    nowState = lastState
                }
            } else if ((Roll > 0 && Roll < 30) || (Roll < 0 && Roll > -30)) {
                let absPitch = Math.abs(Pitch)
                // 如果手机平躺，保持原状态不变，40容错率
                if ((absPitch > 140 || absPitch < 40)) {
                    nowState = lastState
                } else if (Pitch < 0) { /*收集竖向正立的情况*/
                    nowState = 0
                } else {
                    nowState = lastState
                }
            }
            else {
                nowState = lastState
            }
            // 状态变化时，触发
            if (nowState !== lastState) {
                lastState = nowState
                if (nowState === 1) {
                    console.log('change:横屏')
                    console.log(that.videoContext)
                    that.videoContext.requestFullScreen({
                        direction: 90
                    })
                } else {
                    console.log('change:竖屏')
                    that.videoContext.exitFullScreen()
                }
            }
        })
    }
}

module.exports = video