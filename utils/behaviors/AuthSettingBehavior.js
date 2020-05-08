
module.exports = Behavior({
    data: {
        recordSetting: false,
        recordSettingOpened: false
    },
    methods: {
        /**
         * 再次录音授权
         * @param e
         */
        openRecordSettingAgainEvent: function (e) {
            if (e.detail.authSetting['scope.record']) {
                this.setData({
                    recordSetting: true
                })
            }
        },

        __setAuthRecordSetting() {
            const { recordSetting, recordSettingOpened } = this.data

            return new Promise((resolve, reject) => {

                if (!recordSetting && !recordSettingOpened) {

                    wx.authorize({
                        scope: 'scope.record',
                        success: () => {

                            this.setData({
                                recordSetting: true,
                                recordSettingOpened: true
                            })
                            resolve()
                        },
                        fail: (err) => {
                            this.setData({
                                recordSetting: false,
                                recordSettingOpened: true
                            })
                            reject(err)
                        }
                    })
                }else if (recordSetting) {
                    resolve()
                }

            })
        },

        __getAuthRecordSetting() {
            wx.getSetting({
                success: (res) => {
                    if (res.authSetting.hasOwnProperty('scope.record')) {

                        if (res.authSetting['scope.record']) {
                            this.setData({ recordSetting: true, recordSettingOpened: true })
                        }else {
                            this.setData({ recordSetting: false, recordSettingOpened: true })
                        }

                    }else {
                        this.setData({ recordSetting: false })
                    }
                }
            })
        }
    }
})