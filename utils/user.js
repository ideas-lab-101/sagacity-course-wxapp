const { $wuLoading } = require('../components/wu/index')
const { host } = require('../sever.config')

class user {
    constructor() {
        try {
            let authToken = wx.getStorageSync('authToken')
            if (authToken) {
                this.authToken = authToken
            } else {
                throw false
            }
        } catch (e) {
            this.authToken = false
        }
        try {
            let userInfo = wx.getStorageSync('userInfo')
            if (userInfo) {
                this.userInfo = userInfo
            } else {
                throw false
            }
        } catch (e) {
            this.userInfo = null
        }
    }

    /**
     * 是否登录过
     *
     * @returns boolean
     * @memberof User
     */
    ckLogin() {
      try {
        let AuthToken = wx.getStorageSync('authToken')
        let UserInfo = wx.getStorageSync('userInfo')
        if (AuthToken && UserInfo && UserInfo.LoginName) {
          return AuthToken
        } else {
          throw false
        }
      } catch (e) {
        return false
      }
    }
    /**
     * 是否授权基本信息
     * @returns {Promise<any>}
     */
    ckSetting() {
      return new Promise((resolve, reject) => {
        wx.getSetting({
          success: (res) => {
            if (res.authSetting['scope.userInfo']) {
              resolve()
            }else {
              reject()
            }
          }
        })
      })
    }
    /**
     * * 已经登录的情况下，判断sessionKey是否失效  如果失效就重新登录
     **/
    checkSessionWait() {
      return new Promise((resolve, reject) => {
        this.ckSetting()
          .then(() => {
            if(!this.authToken) {
              return false
            }
            /**
             * 查询session是否失效
             */
            wx.checkSession({
              success: (e) => {
                console.log(e)
                resolve(e)
              },
              fail: (e) => {
                console.error(e)
                /**
                 * 如果过期，就清除原有的信息， 重新赋值
                 */
                this.clear()
                this.retTokenLogin( token => {})
                reject(e)
              }
            })
          })
          .catch(() => {
            /**
             * 如果没授权，获取取消了授权，就删除原有的数据
             */
            this.clear()
          })
      })
    }
    /**
     * 清除所有的storage
     *
     * @returns boolean
     * @memberof User
     */
    clear() {
      try {
        wx.removeStorageSync('userInfo')
        wx.removeStorageSync('authToken')
      } catch (e) {}
    }
    /**
     * 检测用户是否登录，未登录进行登录操作
     */
    isLogin(userInfo, cb) {
        try {
            let AuthToken = wx.getStorageSync('authToken')
            if (AuthToken) {
                typeof cb === "function" && cb(AuthToken)
            } else {
                throw false
            }
        } catch (e) {
            this.getUser(userInfo, res => {
                typeof cb === "function" && cb(res)
            })
        }
    }
    /**
   * 检测用户是否登录，未登录进行登录操作
   */
    getUser(fo, cb) {
      let that = this
      this._getWxUserInfo(function(code) {
        that._goLogin(code, fo, function (authToken, userInfo) {
          typeof cb === "function" && cb(authToken, userInfo)
        })
      })
    }
    /**
     * 用户登录
     *
     * @param {any} code
     * @param {any} userInfo
     * @param {any} cb (authToken)
     * @memberof User
     */
    _goLogin(code, userInfo, cb) {
        wx.showNavigationBarLoading()
        $wuLoading().show({
            title: '获取登录信息'
        })
        wx.request({
            url: `${host}wxapp/system/WXSSMain`,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                userInfo: JSON.stringify(userInfo),
                code: code
            },
            method: 'POST',
            success: res => {
              console.log(res)
                if (res.errMsg === 'request:ok' && res.data.code === 1) {
                  this.userInfo = res.data.user
                  this.authToken = res.data.session_key
                  if(res.data.user.LoginName) {
                    wx.setStorageSync('userInfo', res.data.user)
                    wx.setStorageSync('authToken', res.data.session_key)
                  }
                  console.log(this.authToken)
                  console.log(this.userInfo)
                  typeof cb === "function" && cb(this.authToken, this.userInfo)
                } else {
                    wx.showModal({content: '登录个人信息失败', showCancel: false})
                }
            },
            complete: function () {
                wx.hideNavigationBarLoading()
                $wuLoading().hide()
            }
        })
    }

  /**
   * 电影获取电话号码
   * @param detail
   * @param cb
   */
  getPhone(detail, cb) {
      let that = this
      this._getWxUserInfo(function(code) {
        that.getPhoneNumber(code, detail, function (authToken, userInfo) {
          typeof cb === "function" && cb(authToken, userInfo)
        })
      })
    }
  /**
   * 授权获取电话号码
   * @param detail
   * @param cb
   * @private
   */
    getPhoneNumber(detail, cb) {
      wx.showNavigationBarLoading()
      $wuLoading().show({
        title: '获取电话号码'
      })
      wx.request({
        url: `${host}wxapp/system/v2/getWXPhoneNumber`,
        header: {
          'content-type': 'application/json'
        },
        data: {
          encryptedData: detail.encryptedData,
          session_key: this.authToken,
          iv: detail.iv
        },
        method: 'GET',
        success: res => {
          console.log(res)
          if (res.errMsg === 'request:ok' && res.data.code === 1) {
            /**
             * 成功后调用提交用户方法 获取完整用户信息
             */
            this._bindUser(res.data.data, cb)
          } else {
            wx.showModal({content: '获取电话号码失败', showCancel: false})
          }
        },
        fail: ret => {},
        complete: () => {
          wx.hideNavigationBarLoading()
          $wuLoading().hide()
        }
      })
    }


    /**
     * 提交给后台 获取完整的user信息
     * @param phone
     * @param cb
     * @private
     */
    _bindUser(phone, cb) {
      const form = {
        name: this.userInfo.Caption,
        tel: phone
      }
      wx.request({
        url: `${host}wxapp/user/bindUser`,
        header: { 'content-type': 'application/x-www-form-urlencoded'},
        data: {
          formData: JSON.stringify(form),
          token: this.authToken
        },
        method: 'POST',
        success: res => {
          console.log(res)
          if (res.errMsg === 'request:ok' && res.data.code === 1) {
            /**
             * 重新写入storage
             */
            wx.setStorageSync('userInfo', res.data.user)
            this.userInfo = res.data.user
            wx.setStorageSync('authToken', this.authToken)

            typeof cb === "function" && cb(this.authToken, this.userInfo)
          } else {
            wx.showModal({content: '登录失败', showCancel: false})
          }
        },
        complete: () => {}
      })
    }

    /**
     * 请求token失效 重新获取token请求
     * @param cb
     */
    retTokenLogin(cb) {
      this._retToken(cb)
    }
    /**
    * 微信session_key 失效 重新请求
    *
    * @param {any} cb (authToken)
    * @memberof User
    */
    _retToken(cb) {
        this._getWxUserInfo((code) => {
          wx.request({
            url:  `${host}wxapp/system/WXSSLogin`,
            header: {'content-type': 'application/x-www-form-urlencoded'},
            data: { code: code },
            method: 'POST',
            success: res => {
              console.log(res)
              wx.setStorageSync('userInfo', res.data.user)
              this.userInfo = res.data.user
              wx.setStorageSync('authToken', res.data.session_key)
              this.authToken = res.data.session_key
              typeof cb === "function" && cb(this.authToken, this.userInfo)
            },
            complete: function () {}
          })
        })
    }
    /**
     * 获取微信用户信息
     *
     * @param {any} cb (userInfo, code)
     * @memberof User
     */
    _getWxUserInfo(cb) {
        wx.login({
            success: res => {
                typeof cb === "function" && cb(res.code)
            }
        })
    }
}
module.exports = user
