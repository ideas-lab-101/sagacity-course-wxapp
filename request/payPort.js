const { fetch } = require('../axios/fetch')

export function postPay(order) {
  wx.showLoading({
    title: '支付中...',
    mask: true
  })
  return new Promise( (resolve, reject) => {

    getApp().request({   // 后台生产支付订单
      url: `/wxapp/pay/v3/wxPay`,
      data: {
        out_trade_no: order.orderCode,
        total_fee: order.totalPay,
        token: getApp().user.ckLogin()
      },
      method: 'POST',
      success: (res) => {
        if (res.data) { // 请求系统的支付界面
          wx.requestPayment({
            'timeStamp': res.data.timeStamp,
            'nonceStr': res.data.nonceStr,
            'package': res.data.package,
            'signType': res.data.signType,
            'paySign': res.data.paySign,
            'success': (response) => {

              // 重新获取支付是否成功验证
              wx.showLoading({title: '支付确认中...', mask: true})
              setTimeout(() => {
                getOrderInfo({orderCode: order.orderCode}).then( r => {
                  console.log(r)
                  resolve(r)
                }).catch( e => {
                  console.log(e)
                  wx.showToast({title: '支付失败', icon: 'none'})
                  wx.showModal({
                    title: '提示',
                    content: '订单未确认，请稍后再试',
                    showCancel: false,
                    success(res) {
                      if (res.confirm) {
                        wx.switchTab({
                          url: `/pages/tabBar/mine/mine`
                        })
                      }
                    }
                  })
                  reject(e)
                })
              }, 2000)

            },
            'fail': (response) => {
              console.log(response)
              wx.showToast({title: '支付失败', icon: 'none'})
              reject(response)
            }
          })
        } else {
          wx.showToast({title: '支付失败', icon: 'none'})
          reject(res.data)
        }
      },
      fail: (ret) => {
        console.error(ret)
        wx.showModal({
          title: '提示',
          content: '支付有问题，请把问题反馈给我们',
          showCancel: false,
          success(res) {}
        })
        reject(ret)
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  })
}


// 可以获得订单状态
function getOrderInfo(data) { //orderCode
  return fetch({
    url: '/wxapp/pay/v3/getOrderInfo',
    data: data || {},
    method: 'GET'
  }, false, ()=>{
    wx.hideLoading()
  })
}
