import { fetch } from '../axios/fetch'

/**
 * 登陆接口
 * code userData(可选)
 * */
export const WXLogin = function (data) {
  return fetch({
    url: '/wxapp/system/v3/wxaLogin',
    data: data || {},
    method: 'POST'
  })
}

/**
 * 获得加密信息
 * code encryptedData iv
 * */
export const getWxaPhone = function (data) {
  return fetch({
    url: '/wxapp/system/v3/getWxaPhone',
    data: data || {},
    method: 'POST'
  })
}


/**
 * 绑定手机号、修改用户信息等
 * token formData(json格式的用户信息)
 * */
export const bindUser = function (data) {
  return fetch({
    url: '/wxapp/system/v3/bindUser',
    data: data || {},
    method: 'POST'
  })
}


/**
 * 获得指定的码表值
 * master_id
 */
export function getEnumDetail(data) {
  return fetch({
    url: '/wxapp/system/v3/getEnumDetail',
    data: data || {},
    method: 'GET'
  })
}


/**
 * 搜索
 * key
 */
export function search(data) {
  return fetch({
    url: '/wxapp/system/v3/search',
    data: data || {},
    method: 'POST'
  })
}

/**
 * 热搜词列表
 */
export function hotSearch(data) {
  return fetch({
    url: '/wxapp/system/v3/hotSearch',
    data: data || {},
    method: 'GET'
  })
}

/*
/!**
 * 系统方法调用
 * *!/
// 获得平台中的管理对象
export function getObjectType(data) {
  return fetch({
    url: '/wxapp/system/getObjectType',
    data: data || {},
    method: 'GET'
  })
}



// 检查session接口
export function ValidLogin(data) {  // token
  return fetch({
    url: '/wxapp/system/ValidLogin',
    data: data || {},
    method: 'POST'
  })
}

// 自动登录接口(更新session)
export function WXSSLogin(data) {  // code
  return fetch({
    url: '/wxapp/system/WXSSLogin',
    data: data || {},
    method: 'POST'
  })
}

// 注册接口
export function WXSSMain(data) {  // code userInfo
  return fetch({
    url: '/wxapp/system/WXSSMain',
    data: data || {},
    method: 'POST'
  })
}

// 获得微绑定电话号码
export function getWXPhoneNumber(data) {  // encryptedData session_key iv
  return fetch({
    url: '/wxapp/system/getWXPhoneNumber',
    data: data || {},
    method: 'GET'
  })
}

// 获取电话号码
export function getPhoneNumber(data) { // key
  return fetch({
    url: '/wxapp/system/getPhoneNumber',
    data: data || {},
    method: 'POST'
  })
}
*/

/**
 * 扫码登录
 * key
 */
export function ScanLogin(data) {
  return fetch({
    url: '/wxapp/system/v3/ScanLogin',
    data: data || {},
    method: 'POST'
  })
}


/**
 * 获得验证码 支持电话或邮件
 * account account_type（1-电话|2-邮件）
 */
export function getIdentityCode(data) {
  return fetch({
    url: '/wxapp/system/v3/getIdentityCode',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 验证验证码
 * account identity_code
 */
export function checkIdentityCode(data) {
  return fetch({
    url: '/wxapp/system/v3/checkIdentityCode',
    data: data || {},
    method: 'POST'
  })
}

/**
 * 获取分享
 * data_id type
 */
export function getWXSSCode(data) {
  return fetch({
    url: '/wxapp/system/v3/getWXSSCode',
    data: data || {},
    method: 'GET'
  })
}