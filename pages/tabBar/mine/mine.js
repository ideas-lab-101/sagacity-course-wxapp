const App = getApp()
//import { $wuLogin } from '../../../components/pages/index'
import { scanLogin } from '../../../request/systemPort'
import { userAccountInfo, addUserPoint, updateZoneBg } from '../../../request/userPort'
const Dialog = require('../../../viewMethod/dialog')
const Toast = require('../../../viewMethod/toast')
const AppLoginBehavior = require('../../../utils/behaviors/AppLoginBehavior')

Page({
    behaviors: [AppLoginBehavior],
    data: {
        statusBarHeight: App.globalData.equipment.statusBarHeight,
        userInfo: {
            enroll_count: 0,
            favor_count: 0,
            coupon: 0,
            msg_count: 0
        },
        msgCount: 10,
        scroll: {
            scrollTop: 0,
            fixed: 540,
            start: 0,
            time: 0
        },
        isLogin: true
    },
    onLoad: function (options) {
        if (App.user.ckLogin()) {
            this.__init()
        } else {
            this.setData({ isLogin: false })
        }

        // 停止背景音播放
        if (App.backgroundAudioManager) {
            App.backgroundAudioManager.pause()
        }
        this.PageOnLoad = true
    },

    onShow: function () {
        // 更新 消息数 比如加入 收藏 删除等等
        if (!this.PageOnLoad && (App.requestManager.update('userEnroll', this.route)
            || App.requestManager.update('userFavor', this.route))) {
            this.__accountInfo()
        }

        if (!this.PageOnLoad && (App.requestManager.update('bindUser', this.route))) {
            this.__init()
        }

        /*if (App.requestLoadManager.consume('userEnroll') || App.requestLoadManager.consume('userFavor') ||
            App.requestLoadManager.consume('addUserPoint') || App.requestLoadManager.consume('setMessage') ||
            App.requestLoadManager.consume('bindUser')) {
            this.__init() // 请求基础数据
        }*/
    },

    onHide: function () {
        this.PageOnLoad = false
        // 销毁音频播放组件
        if (this.innerAudioContext) {
            this.innerAudioContext.stop()
        }
    },

    onUnload: function () {
        this.PageOnLoad = false
        // 销毁音频播放组件
        if (this.innerAudioContext) {
            this.innerAudioContext.destroy()
            this.innerAudioContext = null
        }
    },

    onShareAppMessage: function (res) {
        return {
            title: '晓得Le - 分享知识、分享快乐',
            imageUrl: 'https://sagacity-course-000019.tcb.qcloud.la/system/logon.jpg?sign=f042416f92c2f5c581b3594290af0ce2&t=1540657473',
            path: "/pages/tabBar/index/index",
            success: (ret) => {
                addUserPoint({ pointCode: '003' })
            }
        }
    },

    /**
     * 请求调用事件
     **/
    __init: function () {
        this.__accountInfo()
    },

    __accountInfo() {
        userAccountInfo()
            .then((res) => {
                this.setData({ userInfo: res.data.account })
            })
    },
    /**
    * 链接事件
    **/
    getTicketEvent: function (e) { // 我的课程券
        wx.showModal({
            title: '提示',
            content: '即将开放，敬请期待...',
            showCancel: false
        })
    },
    getUserPageEvent() {
        if (!this.__validateLoginEvent(this.__init)) {
            return false
        }
        const { userInfo } = this.data
        wx.navigateTo({
            url: `/pages/apply/mine/user-page/user-page?id=${userInfo.user_id}`
        })
    },
    getCourseEvent() {
        if (!this.__validateLoginEvent(this.__init)) {
            return false
        }
        wx.navigateTo({
            url: '/pages/apply/mine/my-course/my-course'
        })
    },
    getCollectEvent() {
        if (!this.__validateLoginEvent(this.__init)) {
            return false
        }
        wx.navigateTo({
            url: '/pages/apply/mine/my-collect/my-collect',
            events: {
                acceptDataFromMyCollect: (data) => {
                    this.__init()
                }
            }
        })
    },
    getMessageEvent() {
        if (!this.__validateLoginEvent(this.__init)) {
            return false
        }
        wx.navigateTo({
            url: '/pages/apply/mine/my-message/my-message',
            events: {
                acceptDataFromMyMessage: (data) => {
                    this.__init()
                }
            }
        })
    },

    interestEvent: function (e) {
        if (!this.__validateLoginEvent(this.__init)) {
            return false
        }
        wx.navigateTo({
            url: '/pages/apply/mine/my-record/my-record'
        })
    },

    evaluatingEvent: function (e) {
        wx.showModal({
            title: '提示',
            content: '即将开放，敬请期待...',
            showCancel: false
        })
    },

    getCodeEvent: function () {
        if (!this.__validateLoginEvent(this.__init)) {
            return false
        }
        wx.scanCode({
            onlyFromCamera: false,
            success: res => {
                let data = res.result
                try {
                    const obj = JSON.parse(data)
                    if (obj.type === 'login') {
                        this._scanLogin(obj.key)
                    } else {
                        throw { msg: '错误的二维码！' }
                    }
                } catch (err) {
                    Toast.text({ text: err.msg })
                }
            }
        })
    },

    goToGuidesEvent: function () {
        if (!this.__validateLoginEvent(this.__init)) {
            return false
        }
        wx.navigateTo({
            url: '/pages/apply/mine/my-set/my-set'
        })
    },

    profileEvent: function () {
        if (!this.__validateLoginEvent(this.__init)) {
            return false
        }
        wx.navigateTo({
            url: '/pages/apply/mine/create-profile/create-profile',
            events: {
                acceptDataCreateProfile: (data) => {
                    this.__accountInfo()
                }
            }
        })
    },
    /**
     * 修改封面
     * @param e
     */
    editCoverEvent: function (e) {
        if (!this.__validateLoginEvent(this.__init)) {
            return false
        }
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                if (res.tempFiles[0].size > 5242880) {
                    Dialog.alert({
                        title: '提示',
                        content: '图片大小不能超过5M，请重选！'
                    })
                    return false
                }
                const tempFilePaths = res.tempFilePaths

                updateZoneBg({
                    bgFile: tempFilePaths[0],
                })
                    .then((res) => {
                        this.setData({
                            'userInfo.background_url': res.data.background_url
                        })
                    })
            }
        })
    },

    goLoginEvent() {
        if (!this.__validateLoginEvent(this.__init)) {
            return false
        }
    },

    frameTouchStart(e) {
        this.FrameTouching = true
    },
    frameTouchEnd(e) {
        this.FrameTouching = false
    },
    /**
     * 打开分享界面
     * @param e
     */
    // singleShareEvent: function (e) {
    //     const index = e.currentTarget.dataset.index
    //     const id = this.data.record.list[index].RecordID
    //     const url = this.data.record.list[index].CoverURL
    //     this.shareIndex = index // 保存记录  方便分享获取ID
    //     $share().show({
    //         coverUrl: url,
    //         type: 'r',
    //         id: id
    //     })
    // },

    /**
     * 扫码
     * @param key
     * @private
     */
    _scanLogin(key) {
        Dialog.confirm({
            content: '是否登录网页版？',
            onConfirm: () => {

                scanLogin({ key: key })
                    .then((res) => {
                        Toast.text({ text: res.msg })
                    })
            }
        })
    }
})