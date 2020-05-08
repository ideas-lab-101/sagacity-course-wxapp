const App = getApp()
import { $wuBackdrop } from '../../../../components/wu/index'
import {  setTeamLabel, exitTeam, getTeamLabel, getTeamIdentity } from '../../../../request/teamPort'
const Toast = require('../../../../viewMethod/toast')
const Dialog = require('../../../../viewMethod/dialog')

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
      this.setData({
        'nav.title': decodeURI(options.title),
        isCreator: options.isCreator,
        blnAuth: Number(options.blnAuth)
      })

      this.eventChannel = this.getOpenerEventChannel()

      this.__init()
    },

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
      Toast.text({ text: errText })
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
      Dialog.confirm({
        title: '提示',
        content: '确定要退出此小组?',
        confirmText: '退出',
        onConfirm: () => {
          self._exitTeam()
        }
      })
    },
  /**
   * 数据请求
   * @private
   */
  _exitTeam: function () {
      exitTeam({
        team_id: this.optionsId
      })
          .then(res => {

            this.eventChannel.emit('acceptDataTeamSet', {teamID: this.optionsId});
            wx.navigateBack({
              delta: 1
            })
          })
          .catch(ret => {
            if(ret.code === 0) {
              Toast.text({ text: ret.msg })
            }
          })
    },

  _changeNickName: function (label) {
    setTeamLabel({
      team_id: this.optionsId,
      label
    })
        .then((res) => {
          Toast.text({ text: '修改成功' })

          this.setData({'attestation.temp': this.data.attestation.inp})
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 800)
        })
  },

  __init: function () {
    getTeamIdentity({
      team_id: this.optionsId
    })
        .then((res) => {
          this.setData({
            'attestation.inp': res.data.label,
            'attestation.temp': res.data.label,
            'attestation.profileName': res.data.profile_name
          })
        })
  }

})
