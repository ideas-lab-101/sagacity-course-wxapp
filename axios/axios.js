'use strict';
const Config = require('../sever.config');
const Toast = require("../viewMethod/toast");
const Constants = require('../utils/constants');
const RequestError = require("./requestError");
const noop = function noop() { };

/**
 * 把对象组装成URL 参数
 * @param data
 * @returns {string}
 */
const formatParams = function (data) {
  var arr = []
  for (var name in data) {
    arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]))
  }
  return arr.join("&")
}

const getFName = function (fn) {
  return (/^[\s\(]*function(?:\s+([\w$_][\w\d$_]*))?\(/).exec(fn.toString())[1] || ''
}

/**
 * 请求
 * @param options
 * @param loading
 */
const requestTask = []		// 请求task
let requestSeq = 0			// 请求id
let requestingNum = 0    // 正在执行的请求数

const axios = function (options = {}) {
  if (typeof options !== 'object') {
    const message = '请求传参应为 object 类型，但实际传了 ' + (typeof options) + ' 类型';
    throw new RequestError(-1, message);
  }

  if (!Config.host) {
    const message = '请求服务器域名为空，请配置成你的服务器域名';
    throw new RequestError(-1, message);
  }

  const success = options.success || noop;
  const fail = options.fail || noop;
  const complete = options.complete || noop;

  const url = Config.host + options.url + (options.params ? ('?' + formatParams(options.params)) : '');
  const timeout = options.timeout || 10000;
  const method = options.method ? options.method.toUpperCase() : 'GET';
  const header = (options.method && options.method.toUpperCase() === 'POST') ? { 'content-type': 'application/x-www-form-urlencoded' } : { 'content-type': 'application/json' };

  /**
   * 并发请求计数
   */
  requestingNum++
  requestSeq++

  requestTask[requestSeq] = wx.request({
    url, data: options.data || '', timeout, method, header, dataType: 'json',
    success: function (response) {
      const { data, statusCode, errMsg } = response;
      console.log(url, '---请求接口参数：', options.data, '---请求接口数据：', data)

      /**
       * 数据结果处理
       */
      if (statusCode === 200) {
        const code = data.code;
        const msg = data.msg || "未知错误";

        if (code === Constants.REQUEST_SUCCESS) {
          /**
           * 请求管理器 里面添加新增的调用成功接口
           */
          if (method === 'POST') {
            const FormatData = typeof data === 'object' ? data : JSON.parse(data)
            getApp().requestManager.add({
              expire: new Date().getTime() + 60 * 60 * 1000 + requestSeq,
              url: url,
              type: FormatData.hasOwnProperty('type') ? FormatData.type : ''
            })
          }
          //1 请求成功
          success(data)

        } else if (code === Constants.REQUEST_FAIL) {
          //0  错误信息
          const error = new RequestError(code, msg);
          Toast.text({ text: msg })
          fail(error)

        } else if (code === Constants.ERR_INVALID_SESSION) {
          //6  无效的数据,但是页面会做相应的变化
          const error = new RequestError(code, msg);
          fail(error)

        } else if (code === Constants.ERR_SERVICE_DATA) {
          //500  服务端错误
          const error = new RequestError(code, msg);
          fail(error)
        } else {
          const error = new RequestError(code, msg);
          fail(error)
        }
      } else {
        const error = new RequestError(statusCode, `微信请求${statusCode} 错误：${errMsg}`);
        fail(error)
      }
    },
    fail: function (err) {
      fail(err)
    },
    complete: function () {
      requestingNum--
      complete()
    }
  })

  // 监听 HTTP Response Header 事件
  requestTask[requestSeq].onHeadersReceived(function (res) { })
}
/**
 * 方法执行前拦截
 */
//const Proxy = InterceptorManager(axios)
module.exports = {
  axios: axios,
  requestTask,
  requestSeq,
  RequestError: RequestError
}
