const { $wuBackdrop, $wuToast } = require('../../../../components/wu/index')
const { getRecordInfo, updateRecordSign } = require('../../../../pages/request/recordPort')
const { userFavor, userLike, addUserPoint } = require('../../../../pages/request/userPort')
const App = getApp()
const { $audioPlay } = require('../../../../components/pages/index')

Page({

    data: {
        nav: {
          title: "",
          model: 'fold',
          transparent: true,
          animation: {
            duration: 1000,
            timingFunction: "linear"
          }
        },

        mineInfo: false,
        userData: {},
        recordData: {},
        likes: [],
        tryParams: {
            isPlay: false
        },
        systemSeries: App.globalData.systemSeries,
        loseMsg: '此作品已经失效了！',
        slider: {
          current: '',
          duration: '',
          disabled: true,
          value: 0
        }
    },

    onLoad: function (options) {
        this.optionsId = options.id
        /**
         * 扫描进入页面
         **/
        if(options.scene) {
          this.optionsId = options.scene
        }
        /**
         * * 停止背景音播放
         **/
        if ( App.globalData.audio) {
            App.globalData.audio.pause()
        }
        this._initRecordInfoData(this.optionsId)

        /**
         * * 初始换播放插件
         **/
        /*this.innerAudioContext = new AudioManager({
          canPlay: this._audioManagerCanPlay,
          play: this._audioManagerPlay,
          pause: this._audioManagerPause,
          timeUpdate: this._audioManagerTimeUpdate,
          stop: this._audioManagerStop,
          end: this._audioManagerEnd,
          destroy: this._audioManagerDestroy
        })*/
    },

    onShow: function () {
      if(App.accreditLogin) { // 重新加载数据
        App.accreditLogin = false
        this._initRecordInfoData(this.optionsId)
      }
        /**
         * * 停止背景音播放
         **/
        if ( App.globalData.audio) {
            App.globalData.audio.pause()
        }
    },
    onReady: function () {
    },
    onHide: function () {
        /*if (this.innerAudioContext) {
          this.innerAudioContext.pause()
        }*/
    },
    onUnload: function () {
        /*console.log('page onUnload')
        if (this.innerAudioContext) {
          this.innerAudioContext.destroy()
          this.innerAudioContext = null
        }*/
    },
    onShareAppMessage: function (res) {
        if(this.data.recordData.blnPublic) {
          const title = this.data.recordData.Sign || `${this.data.userData.Caption} の ${this.data.recordData.Name}`
          return {
            title: title,
            imageUrl: `${this.data.recordData.CoverURL}?imageView2/5/h/300`,
            path: `/pages/apply/mine/record-play/record-play?id=${this.data.recordData.RecordID}`,
            success: (ret) => {
              addUserPoint({pointCode: '002'})
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
  collectEvent: function() {
        userFavor({
                dataID: this.data.recordData.RecordID,
                type: 'record'
        }).then((res) => {
            this.setData({
                'is_favor': res.is_favor
            })
          $wuToast().show({
                type: 'text',
                duration: 1000,
                text: res.msg
            })
        })
    },
    likeEvent: function() {
      userLike({
                dataID: this.data.recordData.RecordID,
                type: 'record'
        }).then((res) => {
            //this.data.recordData.likeCount++
            this.setData({
                'is_like': true,
                // 'recordData.likeCount': this.data.recordData.likeCount
            })
        })
    },
    openCommentEvent: function () {
        wx.navigateTo({
            url: `/pages/common/comment/comment?type=record&id=${this.data.recordData.RecordID}`
        })
    },
    closeEditPlayerEvent: function () {
      $wuBackdrop().release()
        this.setData({
            editin: false
        })
    },
    openEditPlayerEvent: function () {
      $wuBackdrop().retain()
        this.setData({
            editin: true
        })
    },
    submitShareFontEditEvent: function (e) {
        if (e.detail.value.text.trim() === '') {
            return false
        }
      updateRecordSign({
                recordID: this.data.recordData.RecordID,
                text: e.detail.value.text,
                formid: e.detail.formId
        }).then((res) => {
            this.setData({
                'recordData.Sign': e.detail.value.text
            })
            this.closeEditPlayerEvent()
        }).catch((ret) => {})
    },
    goUserPageEvent: function () {
        if (App.user.ckLogin() && this.data.mineInfo) {
            wx.switchTab({
                url: `/pages/tabBar/mine/mine`
            })
        }else {
            wx.navigateTo({
                url: `/pages/apply/mine/user-page/user-page?id=${this.data.userData.UserID}`
            })
        }
    },
    goLessonPlayEvent() {
      if(!App.user.ckLogin()) {
        wx.navigateTo({
          url: '/pages/common/accredit/accredit'
        })
      }else {
        wx.navigateTo({
          url: `/pages/apply/course/lesson-play/lesson-play?id=${this.data.recordData.DataID}`
        })
      }
    },

    /**
     * audio播放回调方法
     **/
    audioEventPlay: function () {
      this.setData({ 'tryParams.isPlay': true, 'slider.disabled': false })
    },
    audioEventPause: function () {
      this.setData({'tryParams.isPlay': false})
    },
    audioEventStop: function () {
      this.setData({'tryParams.isPlay': false})
    },
    audioEventEnd: function () {
      this.setData({'tryParams.isPlay': false})
    },
    audioEventDestroy: function () {
      this.setData({'tryParams.isPlay': false})
    },
    audioEventError: function () {
      this.setData({'tryParams.isPlay': false})
    },
    /**
     * 获取数据事件
     **/
    _initRecordInfoData: function (id) {
        getRecordInfo({recordID: Number(id)}).then((res) => {
            if (res.code) {
                let temp = false
                if (App.user.ckLogin() && App.user.userInfo.UserID === res.data.UserID) {
                    temp = true
                }
                this.setData({
                    loadData: true,
                    mineInfo: temp,
                    result: true,
                    userData: res.userInfo,
                    recordData: res.data,
                    likes: res.likes,
                    is_favor: res.is_favor,
                    is_like: res.is_like
                })
                if(!res.data.blnPublic) {
                  wx.hideShareMenu()
                }
              /**
               * 播放初始化
               **/
              $audioPlay().playInit(res.data.FileURL, res.data.RecordID)
            }else {
                this.setData({
                    loadData: true
                })
            }
        }).catch((ret) => {
          let msg = this.data.loseMsg
          if(ret.code === -1 || ret.code === -2) {
            msg = ret.msg
          }
          this.setData({ loadData: true, loseMsg: msg})
        })
    }
})