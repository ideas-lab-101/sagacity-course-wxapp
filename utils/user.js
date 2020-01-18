'use strict';
import { WXLogin, getWxaInfo, bindUser } from '../request/systemPort'
const Session = require('./session')

class user {
    constructor() {
        try {
            this.accountInfo = wx.getAccountInfoSync()
        } catch(e) {
            this.accountInfo = null
        }

        try {
            let authToken = Session.get()
            if (authToken) {
                this.authToken = authToken
            } else {
                throw false
            }
        } catch (e) {
            this.authToken = false
        }
        try {
            let userInfo = Session.getUserInfo()
            if (userInfo) {
                this.userInfo = userInfo
            } else {
                throw false
            }
        } catch (e) {
            this.userInfo = null
        }
    }

    get token() {
        return this.authToken
    }

    /**
     * 是否登录过
     * @returns {boolean|*}
     */
    ckLogin() {
      try {
        let AuthToken = Session.get()
        let UserInfo = Session.getUserInfo()
        if (AuthToken && UserInfo) {
          return AuthToken
        } else {
          throw false
        }
      } catch (e) {
        return false
      }
    }

    /**
     * 清除所有的storage
     */
    clear() {
      try {
          this.authToken = null
          this.userInfo = null
          Session.clear()
      } catch (e) {}
    }

    /**
     * 用户登录
     *
     * @param {any} code
     * @param {any} userInfo
     * @param {any} cb (authToken)
     * @memberof User
     */
    goLogin(userInfo) {
        const FormatUserInfo = JSON.stringify(userInfo) || '';

        return new Promise((resolve, reject) => {

            this._getWxLogin()
                .then( code => {

                    WXLogin({code, userData: FormatUserInfo})
                        .then( (res) => {

                            this.userInfo = res.data.user
                            this.authToken = res.data.token
                            Session.set(this.authToken)
                            Session.setUserInfo(this.userInfo)

                            // 判断是否加载成功
                            getApp().identityLoaded = res.data
                            if (getApp().identityCallback) {
                                getApp().identityCallback()
                            }

                            resolve(this.authToken)
                        }, ret => {
                            reject(ret)
                        })
                })
        })
    }

    /**
     * 授权获取电话号码
     * @param data
     * @returns {Promise<unknown>}
     */
    getPhoneNumber(data) {
      return new Promise((resolve, reject) => {
          this._getWxLogin()
              .then( code => {

                getWxaInfo({...data, code})
                  .then(res => {
                      /**
                       * 执行绑定
                       */
                      //this.bindUser(res.data)
                      resolve(this.authToken)
                  }, ret => {
                      reject(ret)
                  })
          })
      })
    }


    /**
     * 提交给后台 获取完整的user信息
     * @param tel
     * @returns {Promise<unknown>}
     */
    bindUser(tel) {
        const form = {
            name: this.userInfo.Caption,
            tel
        }
        return new Promise((resolve, reject) => {
            return bindUser({
                formData: JSON.stringify(form),
                token: this.authToken
            })
                .then( res => {

                    this.userInfo = res.data.user
                    this.authToken = res.data.session_key
                    Session.set(this.authToken)
                    Session.setUserInfo(this.userInfo)

                    resolve(this.authToken)
                }, ret => {
                    reject(ret)
                })
        })
    }

    /**
     * 获取微信用户信息
     * @returns {Promise<unknown>}
     */
    _getWxLogin() {
        return new Promise((resolve, reject) => {
            wx.login({
                success: res => {
                    resolve(res.code)
                },
                fail: ret => {
                    reject(ret)
                }
            })
        })
    }

    /**
     * 集合code appid参数
     * @param data
     * @returns {Promise<unknown>}
     */
    gatherUserParams(data) {
        return new Promise((resolve, reject) => {

            return this._getWxLogin().then(code => {

                data = Object.assign({}, {
                    code,
                    appId: this.accountInfo.miniProgram.appId
                }, data)

                resolve(data)
            }, ret => {
                reject(ret)
            })
        })
    }
}
module.exports = user
