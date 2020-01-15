const { $wuToast } = require('../../../../components/wu/index')
const { userFavor, userLike, addUserPoint } = require('../../../../pages/request/userPort')
const { getTeamRecordInfo, markRecord } = require('../../../../pages/request/teamPort')
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
        systemSeries: App.globalData.systemSeries,
        tryParams: {
            isPlay: false
        },
        slider: {
            current: '00:00',
            duration: '00:00',
            disabled: true,
            value: 0
        },
      /**
       * 数据
       */
        mineInfo: false,
        userData: {},
        recordData: {},
        likes: [],
        mineUserID: null,
    },

    onLoad: function (options) {
        this.optionsRecordId = options.recordid
        this.optionsTeamId = options.teamid
        this.data.mineUserID = App.user.userInfo.UserID
        /**
         * * 停止背景音播放
         **/
        if ( App.globalData.audio) {
            App.globalData.audio.pause()
        }
        /**
         * 加载数据
         */
        this._initRecordInfoData(this.optionsTeamId, this.optionsRecordId)
    },

    onShow: function () {
      if(App.accreditLogin) { // 重新加载数据
        App.accreditLogin = false
        this._initRecordInfoData(this.optionsTeamId, this.optionsRecordId)
      }
    },

    onReady: function () {
    },

    onHide: function () {
    },

    onUnload: function () {
    },
    /**
     * 内部事件
     **/
    recordPlayEvent: function () {
      $audioPlay().resetPlayEvent()
    },

    /**
     * 点赞
     */
    likeEvent: function() {
        userLike({
              dataID: this.data.recordData.RecordID,
              type: 'record'
          }).then((res) => {
              this.setData({is_like: true})
              $wuToast().show({type: 'text', duration: 1000, text: res.msg})
          })
      },
    /**
     * 标记
     * @returns {boolean}
     */
    markEvent: function () {
        if(!App.teamActive || this.data.mineUserID !== App.teamActive.userInfo.UserID) {
          return false
        }
        let state = 0
        if(this.data.recordData.blnMark === 0) {
          state = 1
        }
        markRecord({
          submitID: this.data.recordData.SubmitID,
          state: state
        }).then((res) => {
          this.setData({'recordData.blnMark': state})
          $wuToast().show({type: 'text', duration: 1000, text: res.msg})
        })
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
    _initRecordInfoData: function (teamId, recordId) {
        getTeamRecordInfo({teamID: teamId, recordID: recordId}).then((res) => {
            if (res.code === 1) {
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
                    is_like: res.is_like
                })
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
            console.error('请求背景音出错', ret)
        })
    }
})