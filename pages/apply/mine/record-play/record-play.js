import { $wuBackdrop } from '../../../../components/wu/index'
import { getRecordInfo, updateRecordSign } from '../../../../request/recordPort'
import { userFavor, userLike, addUserPoint } from '../../../../request/userPort'
const App = getApp()
import { $audioPlay } from '../../../../components/pages/index'
const AppLaunchBehavior = require('../../../../utils/behaviors/AppLaunchBehavior')
const AppLoginBehavior = require('../../../../utils/behaviors/AppLoginBehavior')
const Toast = require('../../../../viewMethod/toast')

Page({
    behaviors: [AppLaunchBehavior, AppLoginBehavior],
    data: {
        systemSeries: App.globalData.systemSeries,
        nav: {
            title: "",
            model: 'fold',
            transparent: true,
            animation: {
                duration: 1000,
                timingFunction: "linear"
            }
        },

        isMine: false,
        userData: {},
        recordData: {},
        likes: [],

        loseMsg: '此作品已经失效了！',
        slider: {
            current: '',
            duration: '',
            disabled: true,
            value: 0
        },
        tryParams: {
            isPlay: false
        }
    },

    onLoad: function (options) {
        this.optionsId = options.id
        /**
         * 扫描进入页面
         **/
        if (options.scene) {
            this.optionsId = options.scene
        }
        /**
         * * 停止背景音播放
         **/
        if (App.backgroundAudioManager.isPlay) {
            App.backgroundAudioManager.pause()
        }

        this.__initAppLaunch({
            id: this.optionsId
        })
    },

    onShareAppMessage: function (res) {
        const { bln_public, sign, name, cover_url, record_id } = this.data.recordData
        const { caption } = this.data.userData
        if (bln_public) {
            const title = sign || `${caption} の ${name}`
            return {
                title: title,
                imageUrl: `${cover_url}?imageView2/5/h/300`,
                path: `/pages/apply/mine/record-play/record-play?id=${record_id}`,
                success: (ret) => {
                    addUserPoint({ pointCode: '002' })
                }
            }
        }
        return false
    },
    /**
     * 内部事件
     **/
    recordPlayEvent: function () {
        $audioPlay().resetPlayEvent()
    },
    /**
     * 收藏事件
     */
    collectEvent: function () {
        userFavor({
            dataId: this.data.recordData.record_id,
            type: 'record'
        }).then((res) => {
            this.setData({
                'is_favor': res.data.is_favor
            })
            Toast.text({ text: res.msg })
        })
    },
    likeEvent: function () {
        userLike({
            dataId: this.data.recordData.record_id,
            type: 'record'
        })
            .then((res) => {
                this.setData({
                    'is_like': true
                })
            })
    },
    openCommentEvent: function () {
        wx.navigateTo({
            url: `/pages/common/comment/comment?type=record&id=${this.data.recordData.record_id}`
        })
    },
    closeEditPlayerEvent: function () {
        $wuBackdrop().release()
        this.setData({
            editIn: false
        })
    },
    openEditPlayerEvent: function () {
        $wuBackdrop().retain()
        this.setData({
            editIn: true
        })
    },
    submitShareFontEditEvent: function (e) {
        if (e.detail.value.text.trim() === '') {
            return false
        }

        updateRecordSign({
            record_id: this.data.recordData.record_id,
            text: e.detail.value.text,
            formid: e.detail.formId
        })
            .then((res) => {
                this.setData({
                    'recordData.Sign': e.detail.value.text
                })
                this.closeEditPlayerEvent()
            })
    },
    goUserPageEvent: function () {
        if (App.user.ckLogin() && this.data.isMine) {
            wx.switchTab({
                url: `/pages/tabBar/mine/mine`
            })
        } else {
            wx.navigateTo({
                url: `/pages/apply/mine/user-page/user-page?id=${this.data.userData.user_id}`
            })
        }
    },
    goLessonPlayEvent() {
        if (!this.__validateLoginEvent(this.__init)) {
            return false
        }
        wx.navigateTo({
            url: `/pages/apply/course/lesson-play/lesson-play?id=${this.data.recordData.data_id}`
        })
    },

    /**
     * 获取数据事件
     * @param id
     * @private
     */
    __init: function ({ id }) {
        getRecordInfo({
            recordId: Number(id)
        })
            .then((res) => {
                let isMine = false
                if (App.user.ckLogin() && App.user.userInfo.user_id === res.data.user.user_id) {
                    isMine = true
                }

                this.setData({
                    loadData: true,
                    isMine: isMine,
                    result: true,
                    userData: res.data.user,
                    recordData: res.data.record_info,
                    likes: res.data.likes,
                    is_favor: res.data.is_favor,
                    is_like: res.data.is_like
                })
                if (!res.data.record_info.bln_public) {
                    wx.hideShareMenu()
                }
                /**
                 * 播放初始化
                 **/
                $audioPlay().playInit(res.data.record_info.file_url, res.data.record_info.record_id)
            })
            .catch((ret) => {
                let msg = this.data.loseMsg
                if (ret.code === -1 || ret.code === -2) {
                    msg = ret.msg
                }
                this.setData({ loadData: true, loseMsg: msg })
            })
    },

    /**
     * audio播放回调方法
     **/
    audioEventPlay: function () {
        this.setData({ 'tryParams.isPlay': true, 'slider.disabled': false })
    },
    audioEventPause: function () {
        this.setData({ 'tryParams.isPlay': false })
    },
    audioEventStop: function () {
        this.setData({ 'tryParams.isPlay': false })
    },
    audioEventEnd: function () {
        this.setData({ 'tryParams.isPlay': false })
    },
    audioEventDestroy: function () {
        this.setData({ 'tryParams.isPlay': false })
    },
    audioEventError: function () {
        this.setData({ 'tryParams.isPlay': false })
    }
})