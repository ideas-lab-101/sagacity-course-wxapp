/**
 * * 检查程序更新
 **/
const checkVersionUpdate = function () {
  const updateManager = wx.getUpdateManager()

  updateManager.onCheckForUpdate(function (res) {
    if (res.hasUpdate) {
      wx.showLoading({
        title: '新版本更新中...',
      })
    }
  })

  updateManager.onUpdateReady(function () {
    wx.hideLoading()
    wx.showModal({
      title: '更新成功提示',
      content: '新版本已准备好，是否重启应用',
      showCancel: false,
      confirmText: '确认升级',
      success: res => {
        if (res.confirm) {
          updateManager.applyUpdate()
        }
      }
    })
  })

  updateManager.onUpdateFailed(function () {
    wx.hideLoading()
    wx.showModal({
      title: '更新失败提示',
      content: '新版本更新失败，请在小程序中先删除，然后重新打开!',
      showCancel: false,
      confirmText: '确定'
    })
  })
}


export {
  checkVersionUpdate
}
