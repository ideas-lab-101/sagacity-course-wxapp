import baseBehavior from '../helpers/baseBehavior'
import mergeOptionsToData from '../helpers/mergeOptionsToData'
import { $wuBackdrop } from '../index'

const defaults = {
    current: 0
}

Component({
    behaviors: [baseBehavior],
    externalClasses: ['wux-class'],
    data: mergeOptionsToData(defaults),
    properties: {
        words: {
            type: Array,
            value: [],
        },
        version: {
            type: String,
            value: '',
        },
        exhibition: {
            type: Boolean,
            value: true,
        }
    },
    created() {
        this.$wuBackdrop = $wuBackdrop('#wu-backdrop', this)
        this.markedRecord = this._getStorage()
    },
    attached() {
        this._checkMarker()
    },
    ready() {
    },
    detached() {
        //this._setStorage(this.markedRecord)
    },
    methods: {
        /**
         * 隐藏
         */
        hide() {
            this.$wuBackdrop.release()
            this.$$setData({ in: false })
            this._setStorage(this.markedRecord)
        },
        /**
         * 显示
         */
        show(opts = {}) {
            const options = this.$$mergeOptionsAndBindMethods(Object.assign({}, defaults, opts))
            this.$$setData({ in: true, ...options })
            this.$wuBackdrop.retain()

            var myEventDetail = {index: this.data.current}
            var myEventOption = {}
            this.triggerEvent('markDownFree', myEventDetail, myEventOption)
        },

        handlerTapEvent: function (e) {
            let j = e.currentTarget.dataset.j
            let index = e.currentTarget.dataset.index
            let release= false

            if (this.data.words[index] && this.data.words[index].urls[j].release) {
                release = true
                this.hide()
            }
            if (this.data.words[index] && this.data.words[index].urls[j].next) {
                if ( index === this.data.words.length-1) {
                    return false
                }
                index++
                this.$$setData({ current: index })
            }
            var myEventDetail = {index: index, release: release}
            var myEventOption = {}
            this.triggerEvent('markDownFree', myEventDetail, myEventOption)
        },

        _checkMarker: function () {
            const version = this.data.version
            if (!this.properties.exhibition) {
              return false
            }
            const page = getCurrentPages()[getCurrentPages().length - 1]
            if (!this.markedRecord){
                this.markedRecord = {}
            }

            if (!this._has(page.__route__) || !this._check(page.__route__, version)) {
                this.show()
                this._add(page.__route__, version) // 添加进去  或者修改
            }
        },

        _has: function (__route__) {
            return this.markedRecord.hasOwnProperty(__route__)
        },

        _check: function (__route__, version) {
            if (!this._has(__route__)) {
                return false
            }
            if (version === this.markedRecord[__route__].version && this.markedRecord[__route__].data === 1 ) {
                return true
            }
            return false
        },

        _add: function (__route__, version) {
            let temp = {
                data: 1,
                version: version
            }
            this.markedRecord[__route__] = temp
        },

        _getStorage: function () {
            try {
                return wx.getStorageSync('___MarkedWords')
            }catch (err) {
                return {}
            }
        },

        _setStorage: function (data) {
            wx.setStorage({
                key:'___MarkedWords',
                data: data,
                success: () => {}
            })
        }

    },
})