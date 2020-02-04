'use strict';

import { WXLogin, getWxaPhone, bindUser } from '../request/systemPort'
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
            let authInfo = Session.getUserInfo()
            if (authInfo) {
                this.authInfo = authInfo
            } else {
                throw false
            }
        } catch (e) {
            this.authInfo = null
        }
    }

    get token() {
        return Session.get()
    }

    get userInfo() {
        return Session.getUserInfo()
    }

    /**
     * 是否登录过
     * @returns {boolean|*}
     */
    ckLogin() {
      try {
        let AuthToken = Session.get()
        let AuthInfo = Session.getUserInfo()
        if (AuthToken && AuthInfo) {
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
          this.authInfo = null
          Session.clear()
      } catch (e) {}
    }

    /**
     * 用户登录
     *
     * @param {any} code
     * @param {any} authInfo
     * @param {any} cb (authToken)
     * @memberof User
     */
    goLogin(authInfo) {
        const FormatUserInfo = JSON.stringify(authInfo) || '';

        return new Promise((resolve, reject) => {

            this.__getWxLogin()
                .then( code => {

                    WXLogin({code, userData: FormatUserInfo})
                        .then( (res) => {

                            this.authInfo = res.data.user
                            this.authToken = res.data.token

                            if(!FormatUserInfo) {
                                Session.set(this.authToken)
                                Session.setUserInfo(this.authInfo)

                                // 判断onLaunch是否先加载成功 在执行后面的方法
                                this.__getLaunchIsLoad(res.data)
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
          this.__getWxLogin()
              .then( code => {

                getWxaPhone({...data, code})
                  .then(res => {
                      /**
                       * 执行绑定
                       */
                      this.__bindUser(res.data.phone)
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
    __bindUser(tel) {
        const form = {
            name: this.authInfo.caption,
            tel
        }
        return new Promise((resolve, reject) => {
            return bindUser({
                formData: JSON.stringify(form),
                token: this.authToken
            })
                .then( res => {

                    this.authInfo = res.data.user
                    Session.set(this.authToken)
                    Session.setUserInfo(this.authInfo)

                    // 判断onLaunch是否先加载成功 在执行后面的方法
                    this.__getLaunchIsLoad(res.data)

                    resolve(this.authToken)
                }, ret => {
                    reject(ret)
                })
        })
    }


    __getUnReadMessage() {

    }

    /**
     * 判断onLaunch是否先加载成功 在执行后面的方法
     * @private
     */
    __getLaunchIsLoad(data) {
        getApp().identityLoaded = data
        if (getApp().identityCallback) {
            getApp().identityCallback()
        }
    }

    /**
     * 获取微信用户信息
     * @returns {Promise<unknown>}
     */
    __getWxLogin() {
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

            return this.__getWxLogin().then(code => {

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