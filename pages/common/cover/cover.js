const { $wuLoading } = require('../../../components/wu/index')
const App = getApp()
const { GetWXSSCode } = require('../../../request/systemPort')
const Toast = require('../../../viewMethod/toast')

Page({
    data: {
        writeSetting: false,
        writeSettingOpened: false
    },

    onLoad: function (options) {
        this.setData({
            writeSetting: App.setting.writeSetting.set,
            writeSettingOpened: App.setting.writeSetting.opened
        })
        this._initData(options.id)
    },
    /**
     *
     * 内部调用事件
     * ***/
    saveLocalEvent: function (e) {
        wx.getSetting({
            success: (res) => {
                if (res.authSetting['scope.writePhotosAlbum']) {
                    this._saveImageToPhoto()
                }else {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success: () => {
                            this._saveImageToPhoto()
                            this.setData({
                                writeSetting: true,
                                writeSettingOpened: true
                            })
                            App.setting.writeSetting.set = true
                            App.setting.writeSetting.opened = true
                        },
                        fail: (err) => {
                            this.setData({
                                writeSetting: false,
                                writeSettingOpened: true
                            })
                            App.setting.writeSetting.opened = true
                        }
                    })
                }
            }
        })
    },

    opensettingEvent: function (e) {
        if (e.detail.authSetting['scope.writePhotosAlbum']) {
            this.setData({
                writeSetting: true
            })
            App.setting.writeSetting.set = true
        }
    },

    _saveImageToPhoto: function () {
        $wuLoading().show({
            title: '正在保存，请等候...'
        })
        wx.downloadFile({
            url: this.data.coverData.CoverURL,
            success: (r) => {
                if (r.statusCode === 200) {

                    wx.saveImageToPhotosAlbum({
                        filePath: r.tempFilePath,
                        success: () => {
                            Toast.text({ text: '保存成功'})
                        },
                        fail: (err) => {
                            Toast.text({ text: '保存失败'})
                        },
                        complete: () => {
                          $wuLoading().hide()
                            // wx.removeSavedFile({
                            //     filePath: r.tempFilePath,
                            //     success: () => {
                            //         $wu.showToast({
                            //             type: 'text',
                            //             duration: 1000,
                            //             text: '删除成功'
                            //         })
                            //     },
                            //     fail: (err) => {
                            //         $wu.showToast({
                            //             type: 'text',
                            //             duration: 1000,
                            //             text: '删除失败'
                            //         })
                            //     }
                            // })
                        }
                    })
                }else {
                  $wuLoading().hide()
                }
            },
            fail: () => {
              $wuLoading().hide()
            }
        })
    },

    /**
     *
     * 内部数据获取事件
     * ***/
    _initData: function (id) {
        GetWXSSCode({dataId: id, type: 'r'}).then((res) => {
            if (res.code) {
                this.setData({
                    'coverData.CoverURL': res.qr_code
                })
            }
        })
    }

})