Component({

    behaviors: [],

    properties: {
        top: {
            type: String,
            value: '0px'
        },
        left: {
            type: String,
            value: '0px'
        },
        zIndex: {
            type: Number,
            value: 999
        },
        animation: {
            type: Object,
            value: {
                duration: 500,
                timingFunction: "ease-out",
                delay: 0
            }
        }
    },
    data: {
        animationData: {}
    },

    created: function () {
        try {
            var res = wx.getSystemInfoSync()
            this.statusBarHeight = res.statusBarHeight
            this.screenHeight = res.screenHeight
        } catch (e) {
            console.error(e)
        }
        this.animationLive = wx.createAnimation({
            duration: this.data.animation.duration,
            timingFunction: this.data.animation.timingFunction,
            delay: this.data.animation.delay
        })
    },

    attached: function () {
    },

    detached: function(){
        this.setData({
            animationData: {}
        })
    },

    oldVal: 0,

    methods: {
        /*
        * 在page页面   调用方法
        */
        scroll: function (newVal) {
            if (newVal >= this.screenHeight*0.3 && newVal > this.oldVal && !this.transition && !this.hide ) {
                this.animationLive.translateY('-100%').scaleX(0).scaleY(0).opacity(0).step()
                this.transition = true
                clearTimeout(this.timeFn)
                this.timeFn = setTimeout(() => {
                    this.hide = true
                    this.setData({
                        animationData: this.animationLive.export()
                    })
                }, 10)

            } else if ( newVal < this.screenHeight*0.3 && newVal < this.oldVal && !this.transition && this.hide ) {
                if (!this.record || this.record === 0) {
                    this.record = newVal
                }
                if (Math.abs(newVal - this.record) > 50) {
                    this.animationLive.translateY(0).scaleX(1).scaleY(1).opacity(1).step()
                    this.transition = true
                    clearTimeout(this.timeFn)
                    this.timeFn = setTimeout(() => {
                        this.hide = false
                        this.record = 0
                        this.setData({
                            animationData: this.animationLive.export()
                        })
                    }, 10)
                }
            }
            this.oldVal = newVal
        },

        transitionend: function (e) {
            this.transition = false
        },

    }

})