Component({

    behaviors: [],

    properties: {
        bottom: {
            type: String,
            value: '20px'
        },
        right: {
            type: String,
            value: '20px'
        },
        zIndex: {
            type: Number,
            value: 999
        }
    },
    data: {
        show: false,
        success: function () {}
    },

    detached: function () {
        this._setTiming(false)
    },
    methods: {

        /**
         * 显示
         */
        show(opts = {}) {
            if (opts.isPlay) {
                this.setData({
                    show: true,
                    success: opts.success
                }, () => {
                    this._setTiming(true)
                })
            } else {
                this.setData({
                    show: false,
                    success: opts.success
                })
            }
        },

        detached() {
            this._setTiming(false)
        },

        _setTiming: function (isEnd) {
            if (!isEnd) {
                clearTimeout(this.timer)
                return false
            }
            const isPlay = getApp().globalData.audio.musicPlay
            if (!isPlay) {
                this.outFn = setTimeout(() => {
                    clearTimeout(this.timer)
                    this.setData({
                        show: false
                    })
                    return false
                }, 3000)
            }else {
                clearTimeout(this.outFn)
            }
            this.timer = setTimeout(() => {
                this._setTiming(true)
            }, 1500)
        },

        _stickEvent: function(){
            if (this.data.success) {
                this.data.success()
            }
        }
    }

})