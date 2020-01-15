const App = getApp()

Page({
    data: {
      permission: {
        info: false,
        phone: false
      }
    },

    onLoad: function (options) {
      try {
        let userInfo = wx.getStorageSync('userInfo')
        if (userInfo) {
          if(!userInfo.LoginName) {
            this.setData({'permission.info': true, 'permission.phone': false})
          }else {
            this.setData({'permission.info': true, 'permission.phone': true})
          }
        } else {
          throw false
        }
      } catch (e) {
        this.setData({'permission.info': false, 'permission.phone': false})
      }
    },

    onShow: function () {
    },

    /**
     *
     * 内部调用事件
     * ***/
    _getuserinfoEvent(res) {
      if (res.detail.errMsg === "getUserInfo:ok") {
        this._login(res.detail.userInfo)
      }
    },

    _getUserPhoneEvent(res) {
        if (res.detail.errMsg === "getPhoneNumber:ok") {
          this._getPhone(res.detail)
        }
      },

      /**
       * 请求调用事件
       **/
      _login(fo) {
        App.user.getUser(fo, (authToken, userInfo) => {
          if(userInfo.LoginName) {
            this.setData({'permission.phone': true})
            console.log('用户信息授权成功后执行方法')
            App.accreditLogin = true
            setTimeout(() => {
              wx.navigateBack({ delta: 1})
            }, 10)
          }else {
            this.setData({'permission.info': true})
          }
        })
      },

      _getPhone(detail) {
        App.user.getPhoneNumber(detail, (authToken, userInfo) => {
          this.setData({ 'permission.phone': true})
          console.log('电话号码授权成功后执行方法')
          App.accreditLogin = true
          setTimeout(() => {
            wx.navigateBack({ delta: 1})
          }, 10)
        })
      }

})
