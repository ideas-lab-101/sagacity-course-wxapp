const App = getApp()
import { $wuBackdrop } from '../../../../components/wu/index'
import { $wuLogin } from '../../../../components/pages/index'
import { getTeamInfo, joinTeam, getTeamProfile } from '../../../../request/teamPort'
const Toast = require('../../../../viewMethod/toast')
const AppLaunchBehavior = require('../../../../utils/behaviors/AppLaunchBehavior')
const PageReachBottomBehavior = require('../../../../utils/behaviors/PageReachBottomBehavior')

Page({
    behaviors: [AppLaunchBehavior, PageReachBottomBehavior],
    data: {
      statusBarHeight: App.globalData.equipment.statusBarHeight,
      nav: {
        title: "",
        model: 'fold',
        transparent: true,
        animation: {
          duration: 1000,
          timingFunction: "linear"
        }
      },
      attestation: {
        focus: false,
        inp: ''
      },
      /**
       * 数据参数
       */
      teamInfo: null,
      userInfo: null,
      members: [],
      isJoin: false,
      /**
       * 小组档案
       */
      profileItem: {
        profile_id: null,
        profile_name: null,
        profile_no: null
      }
    },
    onLoad: function (options) {
      this.optionsId = options.id

      this.__initAppLaunch({
        id: this.optionsId
      })
    },

    onShareAppMessage: function (res) {
      const teamID = this.data.teamInfo.team_id
      const teamName = this.data.teamInfo.team_name
      let label  = this.data.userInfo.label || this.data.userInfo.caption

      return {
        title: `${label}创建了（${teamName}）`,
        path: `/pages/apply/teams/user-team/user-team?id=${teamID}&title=${encodeURI(teamName)}`,
        success: (ret) => {}
      }
    },

    /**
     * 链接事件
     * @param e
     */
    goTeamEvent: function (e) {
      wx.reLaunch({
        url: `/pages/tabBar/teams/teams?id=${this.data.teamInfo.team_id}`
      })
    },
    /**
    * 触发事件
    * @param e
    */
    joinTeamEvent: function (e) {
      /**
       * 未登录跳转
       */
      if (!App.user.ckLogin()) {
        $wuLogin().show()
        return false
      }
      if(this.data.teamInfo.bln_auth === 1) {
        this.openAttestationEvent()
        return false
      }
      this._joinTeam('', '')
    },

    attestationSubEvent: function (e) {
      this.setData({'attestation.inp': e.detail.value })
    },
  /**
   * 加入小组验证
   * @returns {boolean}
   */
    subAttestationEvent: function () {
      let errText = null
      if(errText === null && this.data.attestation.inp.trim() === '') {
        errText = '组内昵称必须填哟!'
      }
      if(errText === null && !this.data.profileItem.profile_id) {
        errText = '关联学生必须选择哟!'
      }
      if(errText === null && /\s+/g.test(this.data.attestation.inp.trim())) {
        errText = '不能有空格!'
      }
      if(errText === null && (this.data.attestation.inp.trim().length < 2 || this.data.attestation.inp.trim().length > 20)) {
        errText = '组内昵称请输入2~20个文字!'
      }
      if(errText !== null) {
        Toast.text({ text: errText })
        return false
      }
      this._joinTeam(this.data.attestation.inp, this.data.profileItem.profile_id)
    },

    /**
     * 打开验证弹出框控制
     */
    openAttestationEvent: function () {
      this.setData({ in: true, 'attestation.focus': true })
      $wuBackdrop().retain()
    },
    closeAttestationEvent: function () {
      this.setData({ in: false, 'attestation.focus': false })
      $wuBackdrop().release()
    },

    /**
     * 档案管理
     */
    openProfileEvent() {
      this.setData({ profileIn: true})
      $wuBackdrop("#profile-backdrop", this).retain()
    },
    closeProfileEvent() {
      this.setData({ profileIn: false})
      $wuBackdrop("#profile-backdrop", this).release()
    },
    profileSubmitEvent() {
      this.closeProfileEvent()
    },

    profileToLower(e) {
      this.__ReachBottom()
    },

    profileChange(e) {
      const item = e.currentTarget.dataset.item
      this.setData({ profileItem: item })
    },
  /**
   *  获取数据
     * */
    __init: function ({ id }) {
      getTeamInfo({
        team_id: id
      })
          .then((res) => {
            this.setData({
              teamInfo: res.data.team_info,
              userInfo: res.data.owner,
              members: res.data.members,
              isJoin: res.data.is_join
            })
            /**
             * 如果是需要验证的小组 就请求小组档案
             */
            if(res.data.team_info.bln_auth === 1) {
              this._getTeamProfile(id)
            }
          })
    },
    /**
     * 获取小组档案
     * @param teamID
     * @private
     */
    _getTeamProfile(teamID) {

      return this.__getTurnPageDataList({
        isPageShow: true,
        interfaceFn: getTeamProfile,
        params: {
          team_id: teamID
        }
      })
    },
  /**
   * 加入小组
   * @param label
   * @param profileID
   * @private
   */
    _joinTeam: function (label, profileID) {
      joinTeam({
        team_id: this.data.teamInfo.team_id,
        label: label,
        profile_id: profileID
      })
          .then((res) => {
            /**
             * 链接到学习小组列表
             */
            this.goTeamEvent()
          })
    }
})