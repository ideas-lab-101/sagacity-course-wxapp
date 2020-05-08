const App = getApp()
import { $share, $wuLogin } from '../../../components/pages/index'
import { ScanLogin } from '../../../request/systemPort'
import { userAccountInfo, getRecordList, addUserPoint, updateZoneBg } from '../../../request/userPort'

const PageReachBottomBehavior = require('../../../utils/behaviors/PageReachBottomBehavior')
const InnerAudioPlayBehavior = require('../../../utils/behaviors/InnerAudioPlayBehavior')
const Dialog = require('../../../viewMethod/dialog')
const Toast = require('../../../viewMethod/toast')

Page({
    behaviors: [PageReachBottomBehavior, InnerAudioPlayBehavior],
    data: {
        statusBarHeight: App.globalData.equipment.statusBarHeight,
        userInfo: null,
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
        /**
         * * 停止背景音播放
         **/
        if ( App.backgroundAudioManager) {
          App.backgroundAudioManager.pause()
        }
        this.PageOnLoad = true

        this.__initInnerAudioManager()
    },

    onShow: function () {
      /**
      * * 更新 消息数 比如加入 收藏 删除等等
      **/
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
      /**
       * * 销毁音频播放组件
       **/
      if (this.innerAudioContext) {
        this.innerAudioContext.stop()
      }
    },

    onUnload: function () {
      this.PageOnLoad = false
      /**
       * * 销毁音频播放组件
       **/
      if (this.innerAudioContext) {
        this.innerAudioContext.destroy()
        this.innerAudioContext = null
      }
    },

    onShareAppMessage: function (res) {
        if (res.from === 'button' && res.target.id === 'groupShare') {
            if (this.shareIndex === undefined) {
                return false
            }
            const { list } = this.data.content
            const title = `${this.data.userInfo.caption} の ${list[this.shareIndex].name}`
            return {
                title: title,
                imageUrl: `${list[this.shareIndex].cover_url}?imageView2/5/h/300`,
                path: `/pages/apply/mine/record-play/record-play?id=${list[this.shareIndex].record_id}`,
                success: (ret) => {
                    addUserPoint({ pointCode: '002'})
                }
            }
        }
        return {
            title: '晓得Le - 分享知识、分享快乐',
            imageUrl: 'https://sagacity-course-000019.tcb.qcloud.la/system/logon.jpg?sign=f042416f92c2f5c581b3594290af0ce2&t=1540657473',
            path: "/pages/tabBar/index/index",
            success: (ret) => {
                addUserPoint({ pointCode: '003'})
            }
        }
    },

    /**
     * 请求调用事件
     **/
    __init: function () {
        this.__accountInfo()

        this.__getTurnPageDataList({
            isPageShow: true,
            interfaceFn: getRecordList,
            params: {
                user_id: App.user.userInfo.user_id,
                bln_public: 1
            }
        })
    },

    __accountInfo() {
        userAccountInfo()
            .then((res) => {
                this.setData({ userInfo: res.data.account})
            })
    },

    goLogin() {
        $wuLogin().show()
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

    interestEvent: function (e) {
      wx.navigateTo({
        url: '/pages/apply/mine/my-teams/my-teams'
      })
    },

    evaluatingEvent: function (e) {
        wx.showModal({
            title: '提示',
            content: '即将开放，敬请期待...',
            showCancel: false
        })
    },

    goMineAllRecordEvent: function (e) {
        wx.navigateTo({
            url: `/pages/apply/mine/my-record/my-record`,
            events: {
                acceptDataMyRecordPublic: (data) => {
                    if (!data.recordID) {
                        return false
                    }
                    this.__getTurnPageDataList({
                        isPageShow: true,
                        interfaceFn: getRecordList,
                        params: {
                            user_id: App.user.userInfo.user_id,
                            bln_public: 1
                        }
                    })
                }
            }
        })
    },

    getCodeEvent: function () {
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
      wx.navigateTo({
        url: '/pages/apply/mine/my-set/my-set'
      })
    },

    profileEvent: function () {
        wx.navigateTo({
            url: '/pages/apply/mine/create-profile/create-profile',
            events: {
                acceptDataCreateProfile: (data) => {
                    this.__accountInfo()
                }
            }
        })
    },

    goRecordPlay(e) {
        const  { id } = e.currentTarget.dataset
        wx.navigateTo({
            url: `/pages/apply/mine/record-play/record-play?id=${id}`
        })
    },
  /**
   * 修改封面
   * @param e
   */
    editCoverEvent: function (e) {
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
                    .then( (res) => {
                        this.setData({
                            'userInfo.background_url': res.data.background_url
                        })
                    })
            }
        })
    },
  /**
   * 滚动向上滑动效果
   * @param e
   * @returns {boolean}
   */
    pointFixScrollEvent: function (e) {
        if ( e.detail.scrollTop > 0 && e.detail.scrollTop < this.data.scroll.fixed && e.detail.scrollTop > this.data.scroll.start && !this.scrollMove && !this.moveToBottom && !this.FrameTouching) {
            this.moveToBottom = true
            this.scrollMove = true
            this.setData({
                'scroll.scrollTop': this.data.scroll.fixed
            })
            clearTimeout(this.timeFn)
            this.timeFn = setTimeout(() => {
                this.scrollMove = false
            }, 1200)
            return false
        }
        if ( e.detail.scrollTop > 0 && e.detail.scrollTop < this.data.scroll.fixed-100 && e.detail.scrollTop < this.data.scroll.start && !this.scrollMove && this.moveToBottom && !this.FrameTouching) {
            this.moveToBottom = false
            this.scrollMove = true
            this.setData({
                'scroll.scrollTop': 0
            })
            clearTimeout(this.timeFn)
            this.timeFn = setTimeout(() => {
                this.scrollMove = false
            }, 1200)
            return false
        }
        this.data.scroll.start = e.detail.scrollTop

    },
    frameTouchStart(e) {
      this.FrameTouching = true
    },
    frameTouchEnd(e) {
      this.FrameTouching = false
    },
  /**
   * 滚动加载更多数据
   * @param e
   * @returns {boolean}
   */
    scrollToLowerEvent: function (e) {
        this.__ReachBottom()
    },
    scrollRecordEvent: function (e) {
        this.setData({
            'scroll.scrollTop': this.data.scroll.fixed
        })
    },
  /**
   * 打开分享界面
   * @param e
   */
    singleShareEvent: function (e) {
        const index = e.currentTarget.dataset.index
        const id = this.data.record.list[index].RecordID
        const url = this.data.record.list[index].CoverURL
        this.shareIndex = index // 保存记录  方便分享获取ID
        $share().show({
            coverUrl: url,
            type: 'r',
            id: id
        })
    },

    /**
     * 扫码
     * @param key
     * @private
     */
    _scanLogin(key) {
        Dialog.confirm({
            content: '是否登录网页版？',
            onConfirm: () => {

                ScanLogin({key: key})
                    .then((res) => {
                        Toast.text({ text: res.msg })
                    })
            }
        })
    },


})
