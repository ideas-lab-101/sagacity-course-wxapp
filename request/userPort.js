import { fetch } from '../axios/fetch'
import { postPay } from './payPort'
const { host } = require('../sever.config')

/**
 * 用户方法调用
 * */
// 获取个人信息
export function GetAccountInfo(data) {
  return fetch({
    url: '/wxapp/user/GetAccountInfo',
    data: data || {},
    method: 'GET'
  })
}

// 修改个人信息
export function bindUser(data) { //token formData
  return fetch({
    url: '/wxapp/user/bindUser',
    data: data || {},
    method: 'POST'
  })
}

// 更新用户空间背景
export function updateZoneBg(options, cancelTask) { //token bgFile(File)

  wx.showLoading({
    title: '正在上传图片，请等候...',
    mask: true
  })

  return new Promise( (resolve, reject) => {

    var uploadTask = wx.uploadFile({
      url: host + '/wxapp/user/updateZoneBg',
      filePath: options.bgFile,
      name: 'bgFile',
      formData:  {
        token: getApp().user.ckLogin(),
        userID: options.userID
      },
      success: function (res) {
        resolve(res)
      },
      fail: function (error) {
        reject(error)
      },
      complete: function () {
        wx.hideLoading()
      }
    })

    cancelTask && cancelTask(() => {
      uploadTask.abort()
    })
  })
}

// 获得加入列表
export function getEnrollList(data) { //token 分页参数
  return fetch({
    url: '/wxapp/user/getEnrollList',
    data: data || {},
    method: 'GET'
  })
}

// 收藏（通用）
export function userFavor(data) { //token dataID type(course|ld|user|record)
  if (!getApp().user.ckLogin()) {
    wx.navigateTo({
      url: '/pages/common/accredit/accredit'
    })
    return new Promise((resolve, reject) => {})
  }
  return fetch({
    url: '/wxapp/user/userFavor',
    data: data || {},
    method: 'POST'
  })
}

// 点赞
export function userLike(data) { //token dataID type(user|record)
  if (!getApp().user.ckLogin()) {
    wx.navigateTo({
      url: '/pages/common/accredit/accredit'
    })
    return new Promise((resolve, reject) => {})
  }
  return fetch({
    url: '/wxapp/user/userLike',
    data: data || {},
    method: 'POST'
  })
}

// 获得收藏列表
export function getFavorList(data) { //token type 分页相关参数
  return fetch({
    url: '/wxapp/user/getFavorList',
    data: data || {},
    method: 'GET'
  })
}

// 获得指定的用户信息
export function getUserInfo(data) { //userID
  return fetch({
    url: '/wxapp/user/getUserInfo',
    data: data || {},
    method: 'GET'
  })
}

// 获得用户开设的课程
export function getCourseList(data) { //userID 分页参数
  return fetch({
    url: '/wxapp/user/getCourseList',
    data: data || {},
    method: 'GET'
  })
}

// 获得用户录制的作品
export function getRecordList(data) { //userID 分页参数
  return fetch({
    url: '/wxapp/user/getRecordList',
    data: data || {},
    method: 'GET'
  })
}

// 增加个人积分
export function addUserPoint(data) { //pointCode(001 002 003)
  return fetch({
    url: '/wxapp/user/addUserPoint',
    data: data || {},
    method: 'POST'
  })
}

/**
 * 增加个人历史记录
 * token data_id(资源ID) frame(时间进度)
 */
export function addUserHistory(data) {
  return fetch({
    url: '/wxapp/user/addUserHistory',
    data: data || {},
    method: 'POST'
  })
}

/**
 * 获取个人历史记录
 * @param data
 * @returns {Promise<unknown>}
 */
export function getUserHistory(data) {
  if (!getApp().user.ckLogin()) {
    return new Promise((resolve, reject) => {})
  }
  return fetch({
    url: '/wxapp/user/v3/getUserHistory',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 订阅
 * token course_id
 */
export function userEnroll(data) {
  return new Promise( (resolve, reject) => {
      fetch({
        url: '/wxapp/user/v3/userEnroll',
        data: data || {},
        method: 'POST'
      })
          .then((res) => {

            // 这里判断如果价格不是0  就跳转支付
            if (res.orderInfo) {

              return postPay(res.orderInfo)
                  .then((response) => { // 传入需要支付的参数
                      if(response.data.orderState === 1002) {
                        resolve(response)
                      }else if(response.data.orderState === 1001) {
                        reject(response)
                      }
                    })
                    .catch( err => {
                      reject(err)
                    })
            }  // 这里判断如果价格是0  就直接加入成功

            resolve(res)
          })
  })
}



