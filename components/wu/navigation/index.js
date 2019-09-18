Component({
    properties: {
        model: {
          type: String,
          value: 'extrude' // fold or extrude
        },
        title: {
            type: String,
            value: ''
        },
        backgroundColor: { // fold模式下 不能设置backgroundColor
            type: String,
            value: 'white'
        },
        color: {
            type: String,
            value: 'black',
            observer: function(newVal, oldVal, changedPath) {
                return this._colorChange(newVal, oldVal)
            }
        },
        transparent: {
            type: Boolean,
            value: false
        },

        navTitle: {
            type: String,
            value: '首页',
            observer: function(newVal, oldVal, changedPath) {
                this.navTitleTemp = true
            }
        },

        attachment: { // 此项为 在回退箭头后面添加 事件图标 和 文字显示       设置了此项  title 会无效
            type: Array,
            value: [
              // {
              //     type: 'icon',
              //     value:'iconfont icon-pause',
              //     tapBack: null
              //   },
              // {
              //     type: 'text',
              //     value:'在回退箭头后面添加'
              //   }
            ]                           // { type: icon text, value: '', tapBack: }
        },
        backURLType: {
            type: String,
            value: 'navigate' // navigate or switch
        },
        backURL: {
            type: String,
            value: ''
        },
        animation: {
            type: Object,
            value: {
                duration: 1000,
                timingFunction: "linear",
                delay: 0
            },
            observer: function(newVal, oldVal, changedPath) {
                this._animationChange(newVal, oldVal)
            }
        }
    },
    data: {
        hide: false,
        animationData: {},
        opacity: 0,
        boxHeight: '',
        height: '45px',
        paddingTop: '20px',
        homeFontVisible: true
    },

    created: function () {
        try {
            var res = wx.getSystemInfoSync()
            this.statusBarHeight = res.statusBarHeight
            this.screenHeight = res.screenHeight
        } catch (e) {
            console.error(e)
        }
        this.animation = wx.createAnimation({
            duration: this.data.animation.duration,
            timingFunction: this.data.animation.timingFunction,
            delay: this.data.animation.delay
        })
    },

    attached: function () {
        this._initBasicParams()
        this._createAnimation()
    },

    detached: function(){
        this.setData({
            animationData: {}
        })
    },

    oldVal: 0,

    methods: {

        /*
        ** 外部调用方法
         */
        scrollTop: function (newVal) {
            if (newVal >= this.screenHeight*0.5 && !this.hide && newVal > this.oldVal && !this.transition) {
                this.animation.translateY('-100%').step({
                    duration: 500,
                    timingFunction: 'ease-out'
                })
                this.transition = true
                clearTimeout(this.timeFn)
                this.timeFn = setTimeout(() => {
                    this.hide = true
                    this.setData({
                        animationData: this.animation.export()
                    })
                }, 10)

            } else if (this.hide && newVal < this.oldVal && !this.transition) {
                if (!this.record) {
                    this.record = newVal
                }
                if (Math.abs(newVal - this.record) > 80) {
                    this.animation.translateY(0).step({
                        duration: 500,
                        timingFunction: 'ease-out'
                    })
                    this.transition = true
                    clearTimeout(this.timeFn)
                    this.timeFn = setTimeout(() => {
                        this.hide = false
                        this.record = 0
                        this.setData({
                            animationData: this.animation.export()
                        })
                    }, 10)
                }
            }
            this.oldVal = newVal
        },

        // 内部调用事件
        naviBackEvent: function (e) {
            if (getCurrentPages().length === 1) {
                wx.reLaunch({
                    url: '/pages/tabBar/index/index'
                })
            }else if(this.data.backURL){
                if(this.data.backURLType === 'navigate') {
                  wx.reLaunch({
                    url: this.data.backURL
                  })
                }else {
                  wx.switchTab({
                    url: this.data.backURL
                  })
                }
            }else {
                wx.navigateBack({
                    delta: 1
                })
            }
        },

        // 内部方法

        _initBasicParams: function () {
            // 判断是否采取内容置顶模式
            let temp = ''
            if (this.data.model === 'extrude') {
                temp = parseInt(this.data.height) + this.statusBarHeight + 'px'
            }else {
                temp = '0px'
            }
            // 判断是否显示 首页
            var homeFont = true
            if (getCurrentPages().length !== 1 && !this.navTitleTemp) {
                homeFont = false
            }
            this.setData({
                paddingTop: this.statusBarHeight + 'px',
                boxHeight: temp,
                homeFontVisible: homeFont
            })
        },

        _createAnimation: function () {
            if (!this.hasAnimation) {
                this.setData({
                    opacity: 1
                })
                return
            }
            let timeFn = {}
            this.animation.opacity(1).step(this.data.animation)
            clearTimeout(timeFn)
            timeFn = setTimeout(() => {
                this.setData({
                    animationData: this.animation.export()
                })
            }, 10)
        },

        transitionend: function (e) {
            this.transition = false
        },

        // 内部值改变触发事件
        _animationChange: function (newVal, oldVal) {
            if (newVal) {
                this.hasAnimation = true
            }
        },
        _colorChange: function (newVal, oldVal) {
            if (newVal !== 'white' && newVal !== 'black') {
                console.error('Color-参数错误,只能是white or black')
                return false
            }else {
                return true
            }
        },

        _attachmentEvent: function (e) {
            const index = e.currentTarget.dataset.index
            const obj = this.properties.attachment[index]
            obj.tapBack && typeof obj.tapBack === 'Function' && obj.tapBack()
        }
    }
})
