
module.exports = Behavior({
    data: {
        audioParams: {
            isPlay: false,
            sliderValue: 0,
            currentTime: 0,
            sliderStart: '00:00',
            sliderEnd: '00:00'
        }
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

            const audioBack = {
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
            getApp().backgroundAudioManager.create(options, audioBack, formatInfo)
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
         **  audio监听回调方法
         **/
        _canplayBack: function (duration) {
            this.duration = duration
        },

        _playBack: function (id) {
            console.log('play')
            this.setData({
                'audioParams.isPlay': true,
                sliderProgressVisible: true
            })
        },

        _pauseBack: function () {
            console.log('pause')
            this.setData({
                'audioParams.isPlay': false
            })
        },

        _stopBack: function () {
            console.log('stop')
            this.setData({
                'audioParams.isPlay': false,
                progress: 0,
                sliderProgressVisible: false
            })
        },

        _endBack: function (start) {
            console.log('end')
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