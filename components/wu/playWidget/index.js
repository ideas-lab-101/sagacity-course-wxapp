import baseBehavior from '../helpers/baseBehavior'

Component({
    behaviors: [baseBehavior],
    properties: {
        zIndex: {
            type: Number,
            value: 999
        }
    },
    data: {
        show: false,
        playerData: {
            id: '',
            play: false,
            pause: false,
            stop: false,
            end: false,
            loopState: 'order', // order or loop
            src: '',
            title: '',
            epname: '',
            coverImgUrl: ''
        }
    },
    lifetimes: {
        attached: function() {
        },
        detached: function() {
        },
    },
    pageLifetimes: {
        show: function() {
            this.show(getApp().backgroundAudioManager.playerOptions)
        },
        hide: function() {
            this.detached()
        }
    },
    methods: {
        /**
         * 显示
         */
        show(player) {
            if (player.play || player.pause) {
                this.setData({
                    show: true,
                    playerData: player
                })
            }else {
                this.setData({
                    playerData: player
                })
            }
        },

        /**
         * 销毁
         */
        detached() {
            this.setData({
                show: false
            })
        },

        /**
         * 更新
         * @param player
         */
        upData(player) {
            if (!player) {
                return false
            }
            const lastPage = getCurrentPages()[getCurrentPages().length - 1]

            if (lastPage.selectComponent('#wu-play-widget')) {
                this.setData({ playerData: player })
            }else {
                this.data.playerData = player
            }
        },

        /**
         * 内置事件
         * @param e
         * @private
         */
        _operationEvent(e) {
            if (this.data.playerData.play) {
                getApp().backgroundAudioManager.pause()
                this.setData({
                    'playerData.play': false,
                    'playerData.pause': true
                })
            }else {
                getApp().backgroundAudioManager.play()
                this.setData({
                    'playerData.play': true,
                    'playerData.pause': false
                })
            }
        },
        _closeEvent(e) {
            this.setData({
                show: false
            })
        }
    }
})