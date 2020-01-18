
module.exports = Behavior({
    data: {
        audioParams: {
            isPlay: false,
            sliderValue: 0,
            currentTime: 0,
            sliderStart: '00:00',
            sliderEnd: '00:00'
        },
        timeTotal: '00:00',
        state: 'order', // order or loop
        audioBack: null
    },
    methods: {

        __initBackgroundAudio: function(options) {
            const { info } = this.data
            let formatInfo = {
                openState: info.lesson_data.open_state,
                nextID: info.next_data_id,
                prevID: info.pre_data_id,
                isEnroll: info.is_enroll
            }

            this.data.audioBack = {
                canplayFn: this._canplayBack,
                playFn: this._playBack,
                pauseFn: this._pauseBack,
                endFn: this._endBack,
                stopFn: this._stopBack,
                timeUpdateFn: this._timeUpdateBack,
                waitingFn: this._waiting,
                seekingFn: this._seeking,
                seekedFn: this._seeked
            }
            getApp().backgroundAudioManager.create(options, this.data.audioBack, formatInfo)
        },

        /**
         * 播放暂停切换
         */
        audioPlayOrPause() {
            /*if (App.backgroundAudio.getPlayer().end && App.backgroundAudio.getPlayer().stop) {
                return false
            }*/
            if (!this.data.audioParams.isPlay) {
                getApp().backgroundAudioManager.play()
            } else {
                getApp().backgroundAudioManager.pause()
            }
        },

        /**
         * 单循环和顺序播放切换
         */
        loopStateChange(newState) {
            getApp().backgroundAudioManager.setLoopState(newState)
        },

        pauseBackgroundAudio() {
            getApp().backgroundAudioManager.pause()
        },

        /**
         **  audio监听回调方法
         **/
        _canplayBack: function (duration) {
            console.log('Audio canplay')
            this.duration = duration
        },

        _playBack: function (player) {
            console.log('Audio play')
            this.setData({
                'audioParams.isPlay': true,
                sliderProgressVisible: true
            })
        },

        _pauseBack: function () {
            console.log('Audio pause')
            setTimeout(() => {
                this.setData({
                    'audioParams.isPlay': false
                })
            }, 100)
        },

        _stopBack: function () {
            console.log('Audio stop')
            this.setData({
                'audioParams.isPlay': false,
                progress: 0,
                sliderProgressVisible: false
            })
        },

        _endBack: function (start) {
            console.log('Audio end')
            this.duration = 0
            this.setData({
                'audioParams.isPlay': false,
                'audioParams.sliderValue': 0,
                progress: 0,
                sliderProgressVisible: false
            })
        },

        _timeUpdateBack: function (currentTime, duration, start, end) {
            this.duration = duration
            if (Math.round(currentTime) === Math.round(duration) || Math.ceil(currentTime) === Math.ceil(duration)) {
                currentTime = duration
            }

            let sector = (currentTime*100/duration)/100
            const sliderVal =  currentTime*100 / duration

            this.setData({
                'audioParams.isPlay': true,
                'audioParams.currentTime': currentTime,
                timeTotal: end,
                'audioParams.sliderValue': sliderVal,
                'audioParams.sliderStart': start,
                'audioParams.sliderEnd': end,
                progress: sector,
                sliderProgressVisible: true
            })
        },

        _waiting: function () {
            console.log('Audio waiting')
        },

        _seeking: function () {
            
        },

        _seeked: function () {
            
        }
    }
})