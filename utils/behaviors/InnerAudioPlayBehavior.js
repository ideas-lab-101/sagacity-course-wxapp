import InnerAudioManager from '../../controller/InnerAudioManager'

module.exports = Behavior({
    data: {
        tryParams: {
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
                play: this._audioManagerPlay,
                pause: this._audioManagerPause,
                stop: this._audioManagerStop,
                end: this._audioManagerEnd,
                error: this._audioManagerError,
                destroy: this._audioManagerDestroy
            })
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
        _audioManagerPlay: function () {
        },
        _audioManagerPause: function () {
            this.setData({
                'tryParams.isPlay': false
            })
        },
        _audioManagerStop: function () {
            this._audioManagerRelease()
        },
        _audioManagerEnd: function () {
            this._audioManagerRelease()
        },
        _audioManagerError: function () {
            this._audioManagerRelease()
        },
        _audioManagerDestroy: function () {
            this.innerAudioContext = null
        },
        _audioManagerRelease: function () {
            this.setData({
                'tryParams.isPlay': false,
                'tryParams.id': null
            })
        }
    }
})