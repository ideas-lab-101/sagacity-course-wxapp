const App = getApp()
const { $wuNavigation, $wuToast, $wuBackdrop } = require('../../../../components/wu/index')
const { getTeamInfo, joinTeam, getTeamProfile } = require('../../../../request/teamPort')

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
      statusBarHeight: App.globalData.deviceStatusBarHeight,
      attestation: {
        focus: false,
        inp: ''
      },
      /**
       * 数据参数
       */
      courseList: [],
      teamInfo: '',
      userInfo: '',
      members: [],
      isJoin: false,
      /**
       * 小组档案
       */
      profile: {
        pageNumber: 1,
        lastPage: false,
        list: [],
        totalRow: 0
      },
      profileItem: {
        ProfileID: '',
        ProfileName: '',
        ProfileNo: ''
      }
    },
    onLoad: function (optons) {
      this.optionsId = optons.id
      this._getTeamInfo(this.optionsId)
    },
    onShow: function () {
    },
    onReady: function () {
    },
    onShareAppMessage: function (res) {
      const teamID = this.data.teamInfo.TeamID
      const teamName = this.data.teamInfo.TeamName
      let label  = this.data.userInfo.Label || this.data.userInfo.Caption

      return {
        title: `${label}创建了（${teamName}）`,
        path: `/pages/apply/teams/user-team/user-team?id=${teamID}&title=${encodeURI(teamName)}`,
        success: (ret) => {}
      }
    },

    // 自定义事件
    /**
     * 链接事件
     * @param e
     */
    goTeamEvent: function (e) {
      wx.redirectTo({
        url: `/pages/apply/mine/my-teams/my-teams?id=${this.data.teamInfo.TeamID}`
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
        wx.navigateTo({
          url: '/pages/common/accredit/accredit'
        })
        return false
      }
      if(this.data.teamInfo.blnAuth === 1) {
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
      if(errText === null && !this.data.profileItem.ProfileID) {
        errText = '关联学生必须选择哟!'
      }
      if(errText === null && /\s+/g.test(this.data.attestation.inp.trim())) {
        errText = '不能有空格!'
      }
      if(errText === null && (this.data.attestation.inp.trim().length < 2 || this.data.attestation.inp.trim().length > 20)) {
        errText = '组内昵称请输入2~20个文字!'
      }
      if(errText !== null) {
        $wuToast().show({ type: 'forbidden', duration: 1000, text: errText })
        return false
      }
      this._joinTeam(this.data.attestation.inp, this.data.profileItem.ProfileID)
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
    profileTolower(e) {
      if (this.data.profile.lastPage || this.isLoading) {
        return false
      }
      this.isLoading = true
      this.data.profile.pageNumber++
      this._getTeamProfile(this.optionsId).then(() => {   // 档案数据翻页
        this.isLoading = false
      }).catch(() => {
        this.isLoading = false
        this.data.profile.pageNumber--
      })
    },
    profileChange(e) {
      const item = e.currentTarget.dataset.item
      this.setData({ profileItem: item })
    },
  /**
   *  获取数据
     * */
    _getTeamInfo: function (teamID) {
      getTeamInfo({teamID: teamID}).then((res) => {
        this.setData({
          courseList: res.courseList,
          teamInfo: res.teamInfo,
          userInfo: res.userInfo,
          members: res.members,
          isJoin: res.is_join
        })
        /**
         * 如果是需要验证的小组 就请求小组档案
         */
        if(res.teamInfo.blnAuth === 1) {
          this._getTeamProfile(teamID)
        }
      })
    },
    /**
     * 获取小组档案
     * @param teamID
     * @private
     */
    _getTeamProfile(teamID) {
      return getTeamProfile({
        teamID: teamID,
        page: this.data.profile.pageNumber
      }).then(res => {
        this.setData({
          'profile.list': this.data.profile.list.concat(res.list),
          'profile.lastPage': res.lastPage,
          'profile.totalRow': res.totalRow
        })
      })
    },

    _joinTeam: function (label, profileID) {
      joinTeam({teamID: this.data.teamInfo.TeamID, label: label, profileID: profileID}).then((res) => {
        /**
         * 链接到学习小组列表
         */
        this.goTeamEvent()
      }).catch(ret => {
        if(ret.code === 2) {
          $wuToast().show({ type: 'forbidden', duration: 1000, text: ret.msg })
        }
      })
    }

})
