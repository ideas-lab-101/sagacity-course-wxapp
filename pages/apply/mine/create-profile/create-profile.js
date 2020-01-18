const App = getApp()
const { $wuNavigation, $wuToast } = require('../../../../components/wu/index')
const { bindUser, getUserInfo } = require('../../../../request/userPort')
const { getPhoneNumber } = require('../../../../request/systemPort')
import WxValidate from '../../../../utils/WxValidate'

Page({
    data: {
      nav: {
        title: "编辑个人资料",
        model: 'extrude',
        transparent: false
      },

      form: {
        name: '',
        tel: '',
        email: '',
        sign: ''
      }
    },

    onLoad: function () {
        this._initValidate()
        this.getUserInfo()
    },

    onShow: function () {
      if(App.phone.verify) {  // 手机号通过验证 就反向传值
        this.setData({ 'form.tel': App.phone.tel })
      }
    },

    onPageScroll: function (e) {
      $wuNavigation().scrollTop(e.scrollTop)
    },
  /**
   * 字段验证
   **/
  validators: {},
  validationMsgs: {},
  _initValidate() {
    Object.assign(this.validators, {
      'name': {
        required: true
      },
      'tel': {
        required: true,
        tel: true,
      },
      'email': {
        email: true
      }
    })
    Object.assign(this.validationMsgs, {
      'name': {
        required: '请输入姓名',
      },
      'tel': {
        required: '请输入手机号',
        tel: '请输入正确的手机号',
      },
      'email': {
        email: '请输入有效的电子邮件地址。'
      }
    })
    this.WxValidate = new WxValidate(this.validators, this.validationMsgs)
  },
  // 自定义事件
  goVerifyTelEvent() {
    wx.navigateTo({
      url: `/pages/apply/mine/verify-tel/verify-tel`
    })
  },
  setValueEvent(e) {  // 全局输入框设置数据
    const type = e.currentTarget.dataset.name
    this.setData({ [type]: e.detail.value })
  },
  /**
   * 提交表单
   **/
  formSubmit(e) {
    console.log(e)
    if (!this.WxValidate.checkForm(e)) {    //   验证字段
      const error = this.WxValidate.errorList[0]
      console.log(error)
      this._errorToast(error) // 错误提示
      return false
    }

    bindUser({
      formData: JSON.stringify(e.detail.value)
    }).then((res) => {
      console.log(res)
      this._errorToast(res)
      setTimeout(()=> {
        wx.navigateBack()
      }, 500)
    })

  },

  _errorToast(error) {
    $wuToast().show({
      type: 'text',
      duration: 1000,
      color: '#ffffff',
      text: error.msg
    })
  },
  /**
   * 请求用户信息
   **/
  getUserInfo() {
    getUserInfo({ userID: App.user.userInfo.UserID }).then((res) => {
      this.setData({
        'form.name': res.data.Caption,
        'form.tel': res.data.MobilePhone,
        'form.email': res.data.Email,
        'form.sign': res.data.SignText
      })
    })
  },
  /**
     *  验证电话号码 自定义事件
     * */
    // getPhoneEvent: function (e) {
    //     if (e.detail.errMsg === 'getPhoneNumber:ok') {
    //         getPhoneNumber({
    //                 encryptedData: e.detail.encryptedData,
    //                 iv: e.detail.iv,
    //                 session_key: App.user.sessionKey
    //         }).then((res) => {
    //             bindUser({phoneNumber: res.data}).then( ret => {
    //                 wx.switchTab({
    //                     url: '/pages/tabBar/mine/mine'
    //                 })
    //             })
    //         })
    //     }
    // }

})
