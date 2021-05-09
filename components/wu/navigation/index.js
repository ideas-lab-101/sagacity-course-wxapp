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
        backgroundColor: { // fold模式下 不能设置backgroundColor    可以设置渐变色: -webkit-linear-gradient(left, #ffd96a, #ffc857);
            type: String,
            value: 'white'
        },
        color: {
            type: String,
            value: 'black',
            observer: function (newVal, oldVal, changedPath) {
                return this._colorChange(newVal, oldVal)
            }
        },
        transparent: {
            type: Boolean,
            value: false
        },
        navTitle: {
            type: String,
            value: 'HOME',
            observer: function (newVal, oldVal, changedPath) {
                this.navTitleSet = true
            }
        },
        openSlot: {
            type: Boolean,
            value: false
        },
        backFn: {
            type: [Function, null],
            value: null
        },
    },
    data: {
        hide: false,
        opacity: 1,
        titleOpacity: 1,
        boxHeight: '',
        height: '45px',
        paddingTop: 20,
        homeFontVisible: true,
        animationData: {}
    },
    lifetimes: {
        created: function () {
            /**
             * 系统参数
             */
            try {
                this.clientRect = wx.getMenuButtonBoundingClientRect() // 胶囊参数
                const system = getApp().globalData.equipment
                this.statusBarHeight = system.statusBarHeight
                this.screenWidth = system.screenWidth
                this.screenHeight = system.screenHeight
            } catch (e) { }

            this.animation = wx.createAnimation({
                duration: 500,
                timingFunction: 'ease-out',
                delay: 0
            })
        },

        attached: function () {
            this.setData({
                titleWidth: this.screenWidth - (this.screenWidth - this.clientRect.right + this.clientRect.width) * 2
            })
            /**
             * 初始化相关参数
             */
            this._initBasicParams()
        },

        detached: function () {
        }
    },

    pageLifetimes: {
        show: function () { },
        hide: function () { },
        resize: function () { },
    },
    oldVal: 0,

    methods: {

        /**
         * 外部调用方法 页面滚动到距离顶部300px 的距离  那么navigation就收起  反之则显示
         * @param newVal
         * @returns {boolean}
         */
        scrollTop: function (newVal) {
            const interval = 300
            if (this.data.model !== 'fold') {
                return false
            }

            if (newVal > interval) {
                this.setData({
                    transparent: false,
                    opacity: 1,
                    titleOpacity: 1
                })
            } else if (newVal <= 1) {
                this.setData({
                    transparent: true,
                    opacity: 1,
                    titleOpacity: 0
                })
            } else {
                this.setData({
                    transparent: false,
                    opacity: newVal / interval,
                    titleOpacity: 1
                })
            }
        },

        /**
         * 此方法可以设置 navigation 进入的时候是显得的  稍微向下滚动  就隐藏nav
         * @param newVal
         */
        scrollTopTranslateY: function (newVal) {
            if (newVal >= this.screenHeight * 0.5 && !this.hide && newVal > this.oldVal && !this.transition) {
                this.animation.translateY('-100%').step()
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
                    this.animation.translateY(0).step()
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

        /**
         * 返回链接
         * @param e
         */
        navBackEvent: function (e) {
            const { backFn } = this.data

            if (getCurrentPages().length === 1) {
                wx.reLaunch({
                    url: '/pages/tabBar/index/index'
                })
            } else if (backFn) {
                backFn()
            } else {
                wx.navigateBack({
                    delta: 1
                })
            }
        },

        /**
         * 判断动画完成后才执行相关操作
         * @param e
         * @private
         */
        _transitionend: function (e) {
            this.transition = false
        },

        /**
         * 初始化滚动参数 设置模式   高度  间距
         * @private
         */
        _initBasicParams: function () {
            const { model, height } = this.data

            // 判断是否采取内容置顶模式
            let temp = ''
            let titleOpacityTemp = 1
            if (model === 'extrude') {
                temp = (parseInt(height) + this.statusBarHeight) + 'px'
                titleOpacityTemp = 1
            } else {
                temp = `0px`
                titleOpacityTemp = 0
            }

            // 判断是否显示 首页
            let homeFont = true
            if (getCurrentPages().length !== 1 && !this.navTitleSet) {
                homeFont = false
            }

            this.setData({
                paddingTop: this.statusBarHeight,
                boxHeight: temp,
                homeFontVisible: homeFont,
                opacity: 1,
                titleOpacity: titleOpacityTemp
            })
        },

        /**
         * 内部值改变触发事件 监听颜色值
         * @param newVal
         * @param oldVal
         * @returns {boolean}
         * @private
         */
        _colorChange: function (newVal, oldVal) {
            if (newVal !== 'white' && newVal !== 'black') {
                console.error('Color-参数错误,只能是white or black')
                return false
            } else {
                return true
            }
        }
    }
})
