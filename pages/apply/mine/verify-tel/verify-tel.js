const App = getApp()
const { $wuxToast } = require('wux-weapp')
const { getWXPhoneNumber, getIdentityCode, checkIdentityCode } = require('../../../../request/systemPort')
import WxValidate from '../../../../utils/WxValidate'

Page({
    data: {
        nav: {
            title: "验证手机号",
            model: 'extrude',
            transparent: false
        },
        form: {
          tel: '',
          identityCode: ''
        },
        countDown: {
          count: 121,
          visible: true
        },

    },

    onLoad: function () {
      this._initValidate()
    },

    onShow: function () {
    },

  /**
   * 字段验证
   **/
    validators: {},
    validationMsgs: {},
    phoneValidators: {},
    phoneValidationMsgs: {},
    _initValidate() {
      Object.assign(this.validators, {
        'tel': {
          required: true,
          tel: true,
        },
        'identityCode': {
          required: true
        }
      })
      Object.assign(this.validationMsgs, {
        'tel': {
          required: '请输入手机号',
          tel: '请输入正确的手机号',
        },
        'identityCode': {
          required: '请填写验证码'
        }
      })
      this.WxValidate = new WxValidate(this.validators, this.validationMsgs)

      Object.assign(this.phoneValidators, {
        'tel': {
          required: true,
          tel: true,
        }
      })
      Object.assign(this.phoneValidationMsgs, {
        'tel': {
          required: '请输入手机号',
          tel: '请输入正确的手机号',
        }
      })
      this.phoneWxValidate = new WxValidate(this.phoneValidators, this.phoneValidationMsgs)
    },
    /**
     * 自定义事件
     **/
    setValueEvent(e) {
      const type = e.currentTarget.dataset.name
      this.setData({ [type]: e.detail.value })
    },

    _countTime() {
      if(this.data.countDown.count <= 0) {
        console.log(this.data.countDown.count)
        this.setData({ 'countDown.count': 121, 'countDown.visible': true })
        return false
      }

      this.data.countDown.count--
      this.setData({ 'countDown.count': this.data.countDown.count })
      setTimeout(() => {
        this._countTime()
      }, 1000)
    },

    getPhoneNumber(e) {
      console.log(e)
      getWXPhoneNumber({
        encryptedData: e.detail.encryptedData,
        session_key:  App.user.authToken,
        iv: e.detail.iv
      }).then((res) => {
        console.log(res)
        App.phone.verify = true     // 反向设置手机验证通过
        App.phone.tel = res.data
        setTimeout(() => {
          wx.navigateBack()
        }, 300)
      })
    },

    /**
    * 请求事件
    **/
    getCodeEvent() {
      let e = {
        detail: {
          value: {
            tel: this.data.form.tel
          }
        }
      }
      if (!this.phoneWxValidate.checkForm(e)) {    //   验证字段
        const error = this.phoneWxValidate.errorList[0]
        this._errorToast(error) // 错误提示
        return false
      }
      getIdentityCode({
        account: this.data.form.tel,
        accountType: 1         // （1-电话|2-邮件）
      }).then((res) => {
        console.log(res)
        this.setData({ 'countDown.visible': false })
        this._countTime()
      })
    },

    formSubmit(e) {
      if (!this.WxValidate.checkForm(e)) {    //   验证字段
        const error = this.WxValidate.errorList[0]
        this._errorToast(error) // 错误提示
        return false
      }
      checkIdentityCode({
        account: this.data.form.tel,
        identityCode: this.data.form.identityCode
      }).then((res) => {
        console.log(res)

        App.phone.verify = true               // 反向设置手机验证通过
        App.phone.tel = this.data.form.tel
        setTimeout(() => {
          wx.navigateBack()
        }, 300)
      }).catch((error) => {
        this._errorToast({
          msg: error.msg
        })
      })
    },

    _errorToast(error) {
      $wuxToast().show({
        type: 'text',
        duration: 1000,
        color: '#ffffff',
        text: error.msg
      })
    }

})
