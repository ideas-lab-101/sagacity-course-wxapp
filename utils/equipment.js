const Dialog = require('../viewMethod/dialog')

let systemInfo = null

const getSystemInfo = (isForce) => {
  if (!systemInfo || isForce) {
    try {
      systemInfo = wx.getSystemInfoSync()
    } catch(e) { /* Ignore */ }
  }
  return systemInfo
}

const IPHONEX_DEVICE_HEIGHT = 812
const isIPhoneX = ({ model, platform, screenHeight }) => {
  return /iPhone X/.test(model) && platform === 'ios' && screenHeight === IPHONEX_DEVICE_HEIGHT
}

const isIOS = ({ system, platform }) => {
  return /iOS/.test(system) && platform === 'ios'
}

// iPhoneX 竖屏安全区域
export const safeAreaInset = {
  top: 88, // StatusBar & NavBar
  left: 0,
  right: 0,
  bottom: 34, // Home Indicator
}

export const checkIPhoneX = (isForce) => isIPhoneX(getSystemInfo(isForce))

export const checkIOS = (isForce) => isIOS(getSystemInfo(isForce))

export const getStatusBarHeight = (isForce) => getSystemInfo(isForce).statusBarHeight

export const equipmentStatus = (isForce) => getSystemInfo(isForce)

const compareVersion = (v1, v2) => {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}

export const checkVersion = (isForce) => {
  console.log(getSystemInfo(isForce))
  const version  = getSystemInfo(isForce).SDKVersion

  if (compareVersion(version, '2.9.2') < 0) {
    Dialog.alert({
      title: '升级版本',
      content: '当前微信版本过低，无法使用部分功能，请升级到最新微信版本后重试。',
      confirmText: '立即前往'
    })
  }
}
