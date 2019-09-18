import baseBehavior from '../helpers/baseBehavior'
import mergeOptionsToData from '../helpers/mergeOptionsToData'

const defaults = {
    time: 3,
    apply: {
        version: '',
        statusBarHeight: 20,
        scale: 1
    },
    leaveClass: '',
    launch: getApp().launch
}

Component({
    behaviors: [baseBehavior],
    externalClasses: ['wux-class'],
    data: mergeOptionsToData(defaults),
    properties: {
        sliders: {
            type: Object,
            value: {},
        },
        version: {
            type: String,
            value: '',
        }
    },
    created() {
        this.slogonStorage = this._getStorage()
    },
    attached() {
        this._checkMarker(this.data.version)
        wx.getSystemInfo({
            success: (res) => {
                if (res.windowWidth/res.windowHeight < 0.6) {
                    this.data.apply.scale = 2
                }
                this.$$setData({
                    'apply.version': res.version,
                    'apply.statusBarHeight': res.statusBarHeight,
                    'apply.scale': this.data.apply.scale
                })
            }
        })
    },
    detached() {
        this._setStorage(this.slogonStorage)
    },
    methods: {
        /**
         * 隐藏
         */
        hide() {
            this._setStorage(this.slogonStorage)
            //this.$$setData({ in: false })
            this.$$setData({ leaveClass: 'leave' })
            clearTimeout(this.slogonFn)
            wx.showTabBar()
        },
        /**
         * 显示
         */
        show(opts = {}) {
            wx.hideTabBar()
            const options = this.$$mergeOptionsAndBindMethods(Object.assign({}, defaults, opts))
            this.$$setData({in: true, ...options })
        },
        /**
         * 控制事件
         */
        leaveEvent: function (e) {
            this.hide()
        },

        imageLoadEvent: function (e) {
            this._count()
        },

        transitionendEvent: function () {
            this.$$setData({ in: false })
        },

        _count: function () {
            if (this.data.time === 0) {
                this.hide()
                return false
            }
            this.slogonFn = setTimeout(() => {
                this.data.time--
                if (this.data.time > 0) {
                    this.$$setData({
                        time: this.data.time
                    })
                }
                this._count()
            }, 1000)
        },

        _checkMarker: function (version) {
            const page = getCurrentPages()[getCurrentPages().length - 1]
            if (!this.slogonStorage){
                this.slogonStorage = {}
            }
            //if (!this._has(page.__route__) || !this._check(page.__route__, version)) {
            if (!this._has(page.__route__) || this.data.launch) {
                this.show()
                this._add(page.__route__, version) // 添加进去  或者修改
            }
        },

        _has: function (__route__) {
            return this.slogonStorage.hasOwnProperty(__route__)
        },

        _check: function (__route__, version) {
            if (!this._has(__route__)) {
                return false
            }
            if (version === this.slogonStorage[__route__].version && this.slogonStorage[__route__].state === 1 ) {
                return true
            }
            return false
        },

        _add: function (__route__, version) {
            let temp = {
                state: 1,
                version: version
            }
            this.slogonStorage[__route__] = temp
        },

        _getStorage: function () {
            try {
                return wx.getStorageSync('___Slogon')
            }catch (err) {
                return {}
            }
        },

        _setStorage: function (data) {
            wx.setStorage({
                key:'___Slogon',
                data: data,
                success: () => {}
            })
        }

    },
})