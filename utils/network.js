
/**
 * 观察当前网络状态  是否处于链接状态
 */
const networkChange = function () {

  wx.onNetworkStatusChange(function (res) {

    if(!res.isConnected) {
      wx.showModal({
        title: '网络提示',
        content: '网络链接已断开，请查看网络',
        cancelText: false,
        confirmText: '确定',
        success: res => {}
      })
    }

  })

}


export {
  networkChange
}
