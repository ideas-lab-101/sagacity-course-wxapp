var requestTask = []		// 请求task
var requestSeq = 0			// 请求id
var requestNum = 0          // 请求数
var reRequestNum = 0     // 重新请求次数
const basicUrl = require('../sever.config')

/**
 * [request 封装request请求]
 * @param {options}
 *   url: 请求接口url
 *   data: 请求参数
 *   success: 成功回调
 *   fail: 失败回调
 *   complete: 完成回调
 */
const request = function (options) {
  if(!basicUrl.host) {
    options.fail && options.fail({
      errCode: -1,
      errMsg: '请求服务器域名为空，请配置成你的服务器域名'
    })
    return
  }

  requestNum++
  requestTask[requestSeq++] = wx.request({
    url: basicUrl.host + options.url + (options.params?('?' + formatParams(options.params)):''),
    data: options.data || {},
    method: options.method ? options.method : 'GET',
    header: options.header || ((options.method && options.method==='POST')?{'content-type': 'application/x-www-form-urlencoded'}:{'content-type': 'application/json'}),
    dataType: 'json',
    success: function(ret) {

      /**
       * 统一在开发环境打印数据
       */
      //if(basicUrl.Environment === 'development') {
        console.log(basicUrl.host + options.url, '---请求接口参数：', options.data, '---请求接口数据：', ret.data)
      //}

      if (ret.errMsg === 'request:ok') {
        if(ret.data.code === 1) {

          /**
           * 请求管理器 里面添加新增的调用接口
           */
          if (options.method && options.method.toUpperCase() === 'POST') {
            getApp().requestLoadManager.add(options.url)
          }

          options.success && options.success(ret.data)
          reRequestNum = 0
        }else if(ret.data.code === 6) {
          console.log('断点请求')
          reRequestNum++
          getApp().user.retTokenLogin((token) => {  // 重新拉取session 再重新发起请求拉数据 如果连续错误会反复拉取5次
            if(reRequestNum < 6) {
              options.data.token = token
              request(options)
            }else {
              reRequestNum = 0
            }
          })

        }else if(ret.data.code === 11) { // 未定阅
          options.success && options.success(ret.data)
        }else {
          options.fail && options.fail(ret.data)
        }
      }else {
        options.fail && options.fail(ret.data)
      }
    },
    fail: function(ret) {
      wx.getNetworkType({
        success: (res) => {
          const networkType = res.networkType
          console.error('网络情况：', networkType)
          if (networkType === 'none') {
            wx.showModal({
              title: '网络问题',
              content: '亲,您的网络出现了问题，快去检查下吧',
              showCancel: false,
              confirmText: '立即检查',
              success: res => {
                if (res.confirm) {}
              }
            })
          }
        }
      })
      options.fail && options.fail(ret)
    },
    complete: options.complete || function() {
      requestNum--
    }
  })

}

const formatParams = function (data) {
  var arr = [];
  for (var name in data) {
    arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]))
  }
  return arr.join("&")
}


const getFName = function (fn){
  return (/^[\s\(]*function(?:\s+([\w$_][\w\d$_]*))?\(/).exec(fn.toString())[1] || '';
}

module.exports = request
