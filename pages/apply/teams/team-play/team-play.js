import { userLike } from '../../../../request/userPort'
import { getTeamRecordInfo, markRecord } from '../../../../request/teamPort'
const App = getApp()
import { $audioPlay } from '../../../../components/pages/index'
const Toast = require('../../../../viewMethod/toast')

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
        this.data.mineUserID = App.user.userInfo.user_id
        /**
         * * 停止背景音播放
         **/
        if ( App.backgroundAudioManager) {
            App.backgroundAudioManager.pause()
        }
        /**
         * 加载数据
         */
        this.__init(this.optionsTeamId, this.optionsRecordId)
    },

    onShow: function () {
      if(App.accreditLogin) { // 重新加载数据
        App.accreditLogin = false
        this.__init(this.optionsTeamId, this.optionsRecordId)
      }
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
              data_id: this.data.recordData.record_id,
              type: 'record'
          }).then((res) => {
              this.setData({is_like: true})
              Toast.text({ text: res.msg })
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
        if(this.data.recordData.bln_mark === 0) {
          state = 1
        }
        markRecord({
            submit_id: this.data.recordData.submit_id,
            state: state
        })
            .then((res) => {
                this.setData({'recordData.bln_mark': state})
                Toast.text({ text: res.msg })
            })
      },

    goUserPageEvent: function () {
        if (App.user.ckLogin() && this.data.mineInfo) {
            wx.switchTab({
                url: `/pages/tabBar/mine/mine`
            })
        }else {
            wx.navigateTo({
                url: `/pages/apply/mine/user-page/user-page?id=${this.data.userData.user_id}`
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
    __init: function (teamId, recordId) {
        getTeamRecordInfo({
            team_id: teamId,
            record_id: recordId
        })
            .then((res) => {
                    let temp = false
                    if (App.user.ckLogin() && App.user.userInfo.user_id === res.data.user.user_id) {
                        temp = true
                    }
                    this.setData({
                        loadData: true,
                        mineInfo: temp,
                        result: true,
                        userData: res.data.user,
                        recordData: res.data.record_info,
                        likes: res.data.likes,
                        is_like: res.data.is_like
                    })
                    /**
                     * 播放初始化
                     **/
                    $audioPlay().playInit(res.data.record_info.file_url, res.data.record_info.record_id)
            })
            .catch((ret) => {
                console.error('请求背景音出错', ret)
                this.setData({loadData: true})
            })
    }
})