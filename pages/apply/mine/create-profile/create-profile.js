const App = getApp()
import { $wuNavigation } from '../../../../components/wu/index'
import { bindUser, getUserInfo } from '../../../../request/userPort'
import { getPhoneNumber } from '../../../../request/systemPort'
import WxValidate from '../../../../utils/WxValidate'
const Toast = require('../../../../viewMethod/toast')

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
        this.__init()
    },

    onShow: function () {
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
      url: `/pages/apply/mine/verify-tel/verify-tel`,
      events: {
        acceptDataVerifyTel: (data) => {
          this.setData({ 'form.tel': data.mobile })
        }
      }
    })
  },
  setValueEvent(e) {  // 全局输入框设置数据
    const type = e.currentTarget.dataset.name
    this.setData({ [type]: e.detail.value })
  },

  __init() {
    this._initValidate()
    this._getUserInfo()
  },
  /**
   * 提交表单
   **/
  formSubmit(e) {
    if (!this.WxValidate.checkForm(e)) {    //   验证字段
      const error = this.WxValidate.errorList[0]
      Toast.text({ text: error.msg})
      return false
    }

    bindUser({
      formData: JSON.stringify(e.detail.value)
    })
        .then((res) => {
          Toast.text({ text: res.msg})
          setTimeout(()=> {
            wx.navigateBack({ delta: 1 })
          }, 500)
        })

  },

  /**
   * 请求用户信息
   **/
  _getUserInfo() {
    getUserInfo({
      user_id: App.user.userInfo.user_id
    })
        .then((res) => {
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
