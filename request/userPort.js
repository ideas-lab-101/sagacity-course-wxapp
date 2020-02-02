import { fetch } from '../axios/fetch'
import { postPay } from './payPort'
const { host } = require('../sever.config')

/**
 * 活动用户账户信息
 */
export function userAccountInfo(data) {
  return fetch({
    url: '/wxapp/user/v3/userAccountInfo',
    data: data || {},
    method: 'GET'
  })
}

// 修改个人信息
export function bindUser(data) { //token formData
  return fetch({
    url: '/wxapp/user/v3/bindUser',
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

/**
 * 获得用户订阅列表
 * token page
 */
export function getEnrollList(data) {
  return fetch({
    url: '/wxapp/user/v3/getEnrollList',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 收藏（通用）
 * token data_id type(course|ld|user|record)
 */
export function userFavor(data) {
  if (!getApp().user.ckLogin()) {
    wx.navigateTo({
      url: '/pages/common/accredit/accredit'
    })
    return new Promise((resolve, reject) => {})
  }
  return fetch({
    url: '/wxapp/user/v3/userFavor',
    data: data || {},
    method: 'POST'
  })
}

/**点赞
 * token type(user|record) data_id
  */
export function userLike(data) {
  if (!getApp().user.ckLogin()) {
    wx.navigateTo({
      url: '/pages/common/accredit/accredit'
    })
    return new Promise((resolve, reject) => {})
  }
  return fetch({
    url: '/wxapp/user/v3/userLike',
    data: data || {},
    method: 'POST'
  })
}

/**
 * 获得收藏列表
 * token type
 */
export function getFavorList(data) {
  return fetch({
    url: '/wxapp/user/v3/getFavorList',
    data: data || {},
    method: 'GET'
  })
}

// 获得指定的用户信息
export function getUserInfo(data) { //userID
  return fetch({
    url: '/wxapp/user/v3/getUserInfo',
    data: data || {},
    method: 'GET'
  })
}

// 获得用户开设的课程
export function getCourseList(data) { //userID 分页参数
  return fetch({
    url: '/wxapp/user/v3/getCourseList',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 获得用户录制的作品
 * user_id page bln_public(取全部作品0或公开作品1)
 */
export function getRecordList(data) {
  return fetch({
    url: '/wxapp/user/v3/getRecordList',
    data: data || {},
    method: 'GET'
  })
}

// 增加个人积分
export function addUserPoint(data) { //pointCode(001 002 003)
  return fetch({
    url: '/wxapp/user/v3/addUserPoint',
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
    url: '/wxapp/user/v3/addUserHistory',
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
      return fetch({
        url: '/wxapp/user/v3/userEnroll',
        data: data || {},
        method: 'POST'
      })
          .then((res) => {

            /**
             * 这里判断如果价格不是0  就跳转支付
             */
            const orderInfo = res.data.orderInfo
            if (orderInfo) {
                return postPay(orderInfo)
                    .then((response) => { // 传入需要支付的参数
                        if(response.data.orderState === 1002) {
                          //resolve(response)
                        }else if(response.data.orderState === 1001) {
                          //reject(response)
                        }
                      })
              }
            /**
             * 这里判断如果价格是0  就直接加入成功
             */
            return res
          })
}



