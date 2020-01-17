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
         */
        upData(player) {
            this.setData({
                playerData: player
            })
        },

        // 内置事件
        _operationEvent(e) {
            if (this.data.playerData.play) {
                getApp().audio.pause()
                this.setData({
                    'playerData.play': false,
                    'playerData.pause': true
                })
            }else {
                getApp().audio.play()
                this.setData({
                    'playerData.play': true,
                    'playerData.pause': false
                })
            }
        },

        _closeEvent(e) {
            //App.playWidgetController = true
            this.setData({
                show: false
            })
        }

    }

})