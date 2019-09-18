import baseBehavior from '../helpers/baseBehavior'

Component({
    behaviors: [baseBehavior],
    properties: {
        hideTabBar: {
            type: Boolean,
            value: false,
            observer: function(newVal, oldVal, changedPath) {
                this.__tabBarChange(newVal, oldVal)
            }
        },
        title: {type: String, value: ''},
        shadowBackColor: {type: String, value: 'transparent'},
        color: {type: String, value: '#000'}
    },
    data: {
        transformsCSS: false,
        animate: [
            {
                backColor: '#49b6df',
                animation: false
            },
            {
                backColor: '#35ba1f',
                animation: false
            },
            {
                backColor: '#d73e2a',
                animation: false
            }
        ]
    },

    ready: function () {
        this._setTransformsCSS()
        // this._create()
    },

    methods: {
        /*
        * 展示
        */
        show: function (opts={}) {
            opts.visible = true
            const options = this.$$mergeOptionsAndBindMethods(Object.assign({}, this.data, opts))
            this.$$setData({ ...options })
            this._setTransformsCSS() // 打开样式动画
        },

        /*
        * 隐藏
        */
        hide: function () {
            this.$$setData({
                visible: false
            })
            this._setTransformsCSS() // 关闭样式动画
            if (this.data.hideTabBar) {
                wx.showTabBar()
            }
        },

        animationendEvent: function (e) {
            const index = e.currentTarget.dataset.index
            let obj = `animate[${index}].animation`
            this.setData({
                [obj]: false
            })
        },

        // 内部调用方法
        _setTransformsCSS: function () {
            if (this.data.visible) {
                this.setData({
                    transformsCSS: true
                })
            }else {
                this.setData({
                    transformsCSS: false
                })
            }
        },

        _create: function () {
            let index = 0
            this.animateTimeFn = setInterval(() => {
                if (!this.data.visible) {
                    clearInterval(this.animateTimeFn)
                    return false
                }
                this._setAnimate(index)
                index++
                if (index === this.data.animate.length ) {
                    index = 0
                }
            }, 1200)
        },

        _setAnimate: function (index) {
            let obj = `animate[${index}].animation`
            if (this.data.visible) {
                this.setData({
                    [obj]: true
                })
            }
        },
        
        // 内部属性改变方法
        __tabBarChange: function (newVal, oldVal) {
            if (newVal) {
                wx.hideTabBar()
            }
        }
    }
})
