import InnerAudioManager from '../../controller/InnerAudioManager'

module.exports = Behavior({
    data: {
        tryParams: {
            list: null,
            isPlay: false,
            id: null
        }
    },
    methods: {
        __initInnerAudioManager: function() {
            /**
             * 初始换播放插件
             * @type {InnerAudioManager}
             */
            this.innerAudioContext = new InnerAudioManager({
                play: this.__audioManagerPlay,
                pause: this.__audioManagerPause,
                stop: this.__audioManagerStop,
                waiting: this.__audioManagerWaiting,
                end: this.__audioManagerEnd,
                error: this.__audioManagerError,
                destroy: this.__audioManagerDestroy,
                timeUpdate: this.__audioManagerTimeUpdate,
                canPlay: this.__audioManagerCanPlay
            })
        },

        __innerAudioStop() {
            if (this.innerAudioContext) {
                this.innerAudioContext.stop()
            }
        },

        __innerAudioDestroy() {
            if (this.innerAudioContext) {
                this.innerAudioContext.destroy()
                this.innerAudioContext = null
            }
        },

        tryListenEvent: function (e) {
            const { id, url } = e.currentTarget.dataset

            if (this.data.tryParams.isPlay && id === this.data.tryParams.id) {
                this.innerAudioContext.stop()
                return false
            }
            this.setData({
                'tryParams.isPlay': true,
                'tryParams.id': id
            })
            this.innerAudioContext.play(url)
        },

        /**
         * audio播放回调方法
         **/
        __audioManagerPlay: function () {

        },
        __audioManagerPause: function () {
            this.setData({
                'tryParams.isPlay': false
            })
        },
        __audioManagerStop: function () {
            this.__audioManagerRelease()
        },

        __audioManagerWaiting: function() {

        },

        __audioManagerEnd: function () {
            this.__audioEnd()
        },
        __audioManagerError: function (err) {
            this.__audioManagerRelease()
        },
        __audioManagerDestroy: function () {
            this.innerAudioContext = null
        },

        __audioManagerTimeUpdate: function(params) {

        },

        __audioManagerCanPlay: function() {

        },

        __audioManagerRelease: function () {
            this.setData({
                'tryParams.isPlay': false,
                'tryParams.id': null
            })
        },

        /**
         * 初始化播放列表
         * @param originalList
         * @param recordID
         * @param fileUrl
         * @returns {boolean}
         * @private
         */
        __initTryParamsList(originalList, recordID, fileUrl) {
            if (!originalList || originalList.length <= 0) {
                return false
            }
            const { list } = this.data.tryParams

            const formatList = originalList.map(item => {
                return {
                    RecordID: item[recordID],
                    FileURL: item[fileUrl]
                }
            })

            if (!list) {
                this.data.tryParams.list = [...formatList]
                return false
            }
            this.data.tryParams.list = [...list].concat(formatList)
        },

        /**
         * audio播放回调方法
         **/
          __audioEnd() {
            const { list, id } = this.data.tryParams
            /**
             * 判断单个播放的情况
             */
            if (!list) {
                this.__audioManagerRelease()
                return false
            }

            let index = list.findIndex(item => id === item.RecordID)
            if(index === -1 || index === list.length - 1) {
                this.__audioManagerRelease()
                return false
            }
            index ++
            const currentID = list[index].RecordID
            const url = list[index].FileURL

            this.setData({
                'tryParams.isPlay': true,
                'tryParams.id': currentID
            })
            this.innerAudioContext.play(url)
        }
    }
})