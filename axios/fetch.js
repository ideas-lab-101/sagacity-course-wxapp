const Constants = require('../utils/constants');

/**
 * 继承finally
 * @param callback
 * @returns {Promise<any | never>}
 */
Promise.prototype.finally = function (callback) {
  let P = this.constructor
  return this.then(
    value  => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  )
}
/**
 * 基础方法
 * */
var isSubmiting = false
var requestTokenNum = 0     // 重新请求次数

export const fetch = function (options, loading) {

  /***
   * 锁定所有的POST请求 如果执行完成了 才能执行
   */
  if(options.method === 'POST') {
    if (isSubmiting) {
      return new Promise((resolve, reject) => { reject(false) })
    }
    isSubmiting = true
  }

  if (typeof loading === Object && Object.keys(loading).length > 0) {
    wx.showLoading({
      title: loading.title || `数据加载中`,
      mask: loading.mask || false
    })
  }

  /**
   * 常用参数放进header里面
   * @type {any}
   */
  options.data = Object.assign({},{
    'token': getApp().user.token
  }, options.data)

  return new Promise( (resolve, reject) => {
        getApp().request({
          url: options.url,
          data: options.data,
          timeout: options.timeout,
          method: options.method || 'GET',
          success: (res) => {
            resolve(res)
          },
          fail: (ret) => {
            reject(ret)
          },
          complete: () => {
            if(options.method === 'POST') {
              isSubmiting = false
            }
            if (typeof loading === Object && Object.keys(loading).length > 0) {
              wx.hideLoading()
            }
          }
        })
    })
    .catch(ret => {
      /**
       * 重新拉取 发起的请求数
       * 重新拉取token 再重新发起请求拉数据 如果连续错误会反复拉取5次
       */
      if(ret.code === Constants.ERR_INVALID_SESSION && requestTokenNum < 6) {
        requestTokenNum++

        return getApp().user.goLogin()
          .then((token) => {

            options.data['token'] = token
            return  fetch(options, loading)
          })
      }

      throw ret
    })
      .finally(() => {
        if(options.method === 'POST') {
          isSubmiting = false
        }
      })
}
