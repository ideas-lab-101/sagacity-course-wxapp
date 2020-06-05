const App = getApp()
import { getWxaPhone, getIdentityCode, checkIdentityCode } from '../../../../request/systemPort'
import WxValidate from '../../../../utils/WxValidate'
const Toast = require('../../../../viewMethod/toast')

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
      this.eventChannel = this.getOpenerEventChannel()

      this._initValidate()
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
      let { count } = this.data.countDown
      if(count <= 0) {
        this.setData({ 'countDown.count': 121, 'countDown.visible': true })
        return false
      }

      count--
      this.setData({ 'countDown.count': count })

      const TimeFn = setTimeout(() => {
        clearTimeout(TimeFn)
        this._countTime()
      }, 1000)
    },

    getPhoneNumber(e) {
      if (e.detail.errMsg === "getPhoneNumber:ok") {
        getWxaPhone({
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv
        })
            .then((res) => {

              this.eventChannel.emit('acceptDataVerifyTel', { mobile: res.data.phone});

              const BackFn = setTimeout(() => {
                clearTimeout(BackFn)
                wx.navigateBack({ delta: 1 })
              }, 500)
            })
      }
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
        Toast.text({ text: error})
        return false
      }

      if (!this.data.countDown.visible) {
        return false
      }

      getIdentityCode({
        account: this.data.form.tel,
        accountType: 1         // （1-电话|2-邮件）
      })
          .then((res) => {
            this.setData({ 'countDown.visible': false })
            this._countTime()
          })
    },

    formSubmit(e) {
      if (!this.WxValidate.checkForm(e)) {
        const error = this.WxValidate.errorList[0]
        Toast.text({ text: error})
        return false
      }
      checkIdentityCode({
        account: this.data.form.tel,
        identityCode: this.data.form.identityCode
      })
          .then((res) => {
            this.eventChannel.emit('acceptDataVerifyTel', { mobile: this.data.form.tel });

            const BackFn = setTimeout(() => {
              clearTimeout(BackFn)
              wx.navigateBack({ delta: 1 })
            }, 500)
          })
          .catch((error) => {
            Toast.text({ text: error.msg})
          })
    }

})
