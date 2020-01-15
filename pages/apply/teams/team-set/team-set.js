const App = getApp()
const { $wuNavigation, $wuToast, $wuBackdrop } = require('../../../../components/wu/index')
const {  setTeamLabel, exitTeam, getTeamLabel, getTeamIdentity } = require('../../../request/teamPort')

Page({
    data: {
      nav: {
        title: '',
        model: 'extrude',
        transparent: false,
        animation: {
          duration: 1000,
          timingFunction: "linear"
        }
      },
      isCreator: false,
      attestation: {
        focus: false,
        inp: '',
        temp: '',
        profileName: ''
      }
    },

    onLoad: function (options) {
      this.optionsId = options.id
      this.setData({'nav.title': decodeURI(options.title), isCreator: options.isCreator, blnAuth: Number(options.blnAuth)})
      this._getTeamLabel()
    },

    onShow: function () {
    },

    onPageScroll: function (e) {
      //$wuNavigation().scrollTop(e.scrollTop)
    },

    // 自定义事件
  openStatisticalEvent: function () {
  },
  /**
   * 修改昵称
   */
  openAttestationEvent: function () {
    this.setData({ in: true, 'attestation.focus': true })
    $wuBackdrop().retain()
  },
  closeAttestationEvent: function () {
    this.setData({ in: false, 'attestation.focus': false })
    $wuBackdrop().release()
  },
  attestationSubEvent: function (e) {
    this.setData({'attestation.inp': e.detail.value })
  },

  subAttestationEvent: function () {
    let errText = null
    if(errText === null && this.data.attestation.inp.trim() === '') {
      errText = '不能输入空字符!'
    }
    if(errText === null && /\s+/g.test(this.data.attestation.inp.trim())) {
      errText = '不能有空格!'
    }
    if(errText === null && (this.data.attestation.inp.trim().length < 4 || this.data.attestation.inp.trim().length > 20)) {
      errText = '请输入4~20个文字!'
    }
    if(errText !== null) {
      $wuToast().show({ type: 'forbidden', duration: 1000, text: errText })
      return false
    }
    this._changeNickName(this.data.attestation.inp)
  },
  /**
   * 退出小组
   * @param e
   */
  exitEvent: function (e) {
      const self = this
      wx.showModal({
        title: '提示',
        content: '确定要退出此小组?',
        confirmText: '退出',
        success(res) {
          if(res.confirm) {
            self._exitTeam()
          }
        }
      })
    },
  /**
   * 数据请求
   * @private
   */
  _exitTeam: function () {
      exitTeam({teamID: this.optionsId}).then(res => {
        console.log(res)
        wx.navigateBack({
          delta: 1
        })
      }).catch(ret => {
        if(ret.code === 0) {
          $wuToast().show({ type: 'forbidden', duration: 1000, text: ret.msg })
        }
      })
    },
  _changeNickName: function (label) {
    setTeamLabel({teamID: this.optionsId, label: label}).then((res) => {
      $wuToast().show({ type: 'text', duration: 1000, text: '修改成功' })
      this.setData({'attestation.temp': this.data.attestation.inp})
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
      }, 800)
    })
  },

  _getTeamLabel: function () {
    getTeamIdentity({teamID: this.optionsId}).then((res) => {
      this.setData({'attestation.inp': res.data.Label, 'attestation.temp': res.data.Label, 'attestation.profileName': res.data.ProfileName})
    })
  }

})
