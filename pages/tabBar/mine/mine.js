const App = getApp()
const { $wuBackdrop } = require('../../../components/wu/index')
const { $share } = require('../../../components/pages/index')
const { ScanLogin } = require('../../../request/systemPort')
const { GetAccountInfo, getRecordList, addUserPoint, updateZoneBg } = require('../../../request/userPort')
import AudioManager from '../../../controller/audioManager'

Page({
    data: {
        userInfo: {},
        msgCount: 10,
        record: {
            list: [],
            lastPage: false,
            pageNumber: 1
        },
        scroll: {
            scrollTop: 0,
            fixed: 540,
            start: 0,
            time: 0
        },

        tryParams: {
            isPlay: false,
            id: ''
        },

        isLogin: true
    },
    onLoad: function (options) {
        App.pages.add(this) // 缓存数据
        if (App.user.ckLogin()) {
            this._initData() // 请求基础数据
            this._initUserRecordData() // 请求我的录制
        } else {
          this.setData({
            isLogin: false
          })
        }
        /**
         * * 停止背景音播放
         **/
        if ( App.globalData.audio) {
          App.globalData.audio.pause()
        }

        this.innerAudioContext = new AudioManager({  //初始换播放插件
          play: this._audioManagerPlay,
          pause: this._audioManagerPause,
          stop: this._audioManagerStop,
          end: this._audioManagerEnd,
          error: this._audioManagerError,
          destroy: this._audioManagerDestroy
        })

        this.isPageLoad = true
    },

    onShow: function () {
      /*if (!App.user.ckLogin()) {
        wx.navigateTo({
          url: '/pages/common/accredit/accredit'
        })
        return false
      }*/
      /**
      * * 判断是否是新弹出页面授权
      **/
      if ( App.accreditLogin && !this.isPageLoad && App.user.ckLogin()) {
        App.accreditLogin = false
        this._initData() // 请求基础数据
        this.setData({
          isLogin: true,
          'record.list': [],
          'record.lastPage': false,
          'record.pageNumber': 1
        })
        this._initUserRecordData() // 请求我的录制
      }
      /**
      * * 更新 消息数 比如加入 收藏 删除等等
      **/

      if (App.requestLoadManager.consume('userEnroll') || App.requestLoadManager.consume('userFavor') ||
          App.requestLoadManager.consume('addUserPoint') || App.requestLoadManager.consume('setMessage') ||
          App.requestLoadManager.consume('bindUser')) {
          this._initData() // 请求基础数据
      }
      if (App.requestLoadManager.consume('submitRecordFile') || App.requestLoadManager.consume('setPublic') || App.requestLoadManager.consume('delRecord')) {
          this.data.record.list = []
          this.data.record.lastPage = false
          this.data.record.pageNumber = 1
          this._initUserRecordData() // 请求我的录制
      }
    },

    onReady: function () {
    },

    onHide: function () {
      this.isPageLoad = false
      /**
       * * 销毁音频播放组件
       **/
      if (this.innerAudioContext) {
        this.innerAudioContext.stop()
      }
    },

    onUnload: function () {
      this.isPageLoad = false
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
            const title = `${this.data.userInfo.Caption} の ${this.data.record.list[this.shareIndex].Name}`
            return {
                title: title,
                imageUrl: `${this.data.record.list[this.shareIndex].CoverURL}?imageView2/5/h/300`,
                path: `/pages/apply/mine/record-play/record-play?id=${this.data.record.list[this.shareIndex].RecordID}`,
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


    goLogin() {
      wx.navigateTo({
        url: '/pages/common/accredit/accredit'
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
            url: '/pages/apply/mine/my-record/my-record?'
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
                        wx.showToast({title: '错误的二维码！', icon: 'none'})
                    }
                } catch (e) {
                    wx.showToast({title: '错误的二维码！', icon: 'none'})
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
            url: '/pages/apply/mine/create-profile/create-profile'
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
                    wx.showModal({
                        title: '提示',
                        content: '图片大小不能超过5M，请重选',
                        showCancel: false
                    })
                    return false
                }
                const tempFilePaths = res.tempFilePaths
                updateZoneBg({
                    bgFile: tempFilePaths[0],
                    userID: this.data.userInfo.UserID
                }).then( (res) => {
                    this.setData({
                        'userInfo.ZoneBgURL': JSON.parse(res.data).zoneBgURL
                    })
                })
            }
        })
    },

    tryListenEvent: function (e) {
        const index = e.currentTarget.dataset.index
        const url = this.data.record.list[index].FileURL
        const id = this.data.record.list[index].RecordID
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
    scrolltolowerEvent: function (e) {
        if (this.data.record.lastPage || this.isLoading) {
            return false
        }
        this.isLoading = true
        this.data.record.pageNumber++
        this._initUserRecordData().then(() => {   // 请求我的录制
          this.isLoading = false
        }).catch(() => {
          this.isLoading = false
          this.data.record.pageNumber--
        })
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
    * 请求调用事件
    **/
    _initData: function () {
        GetAccountInfo().then((res) => {
            this.setData({
                userInfo: res.data
            })
        })
    },

    _scanLogin(key) {
        wx.showModal({
            content: '是否登录网页版？',
            success: res => {
                if (res.confirm) {
                    ScanLogin({key: key}).then((res) => {
                        if (res.code === 1) {
                            wx.showToast({
                                title: res.msg
                            })
                        }else {
                            wx.showToast({
                                title: res.msg,
                                icon: 'none'
                            })
                        }
                    })
                }
            }
        })
    },

    _initUserRecordData: function () {
        return getRecordList({ page: this.data.record.pageNumber, userID: getApp().user.userInfo.UserID, blnPublic: 1}).then((res) => {
            this.setData({
                'record.list': this.data.record.list.concat(res.list),
                'record.lastPage': res.lastPage,
                'record.pageNumber': res.pageNumber
            })
        })
    },

    /**
     * audio播放回调方法
     **/
    _audioManagerPlay: function () {
    },
    _audioManagerPause: function () {
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
        'tryParams.id': ''
      })
    }
})
