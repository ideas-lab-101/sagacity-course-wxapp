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
export const getWxaInfo = function (data) {
  return fetch({
    url: '/wxapp/system/v3/getWxaInfo',
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


































/*
/!**
 * 系统方法调用
 * *!/
// 获得平台中的管理对象
export function getObjectType(data) {
  return fetch({
    url: 'wxapp/system/getObjectType',
    data: data || {},
    method: 'GET'
  })
}

// 获得指定的码表值
export function GetEnumDetail(data) {
  return fetch({
    url: 'wxapp/system/GetEnumDetail',
    data: data || {},
    method: 'GET'
  })
}

// 检查session接口
export function ValidLogin(data) {  // token
  return fetch({
    url: 'wxapp/system/ValidLogin',
    data: data || {},
    method: 'POST'
  })
}

// 自动登录接口(更新session)
export function WXSSLogin(data) {  // code
  return fetch({
    url: 'wxapp/system/WXSSLogin',
    data: data || {},
    method: 'POST'
  })
}

// 注册接口
export function WXSSMain(data) {  // code userInfo
  return fetch({
    url: 'wxapp/system/WXSSMain',
    data: data || {},
    method: 'POST'
  })
}

// 获得微绑定电话号码
export function getWXPhoneNumber(data) {  // encryptedData session_key iv
  return fetch({
    url: 'wxapp/system/getWXPhoneNumber',
    data: data || {},
    method: 'GET'
  })
}

// 获得验证码 支持电话或邮件
export function getIdentityCode(data) {  // account accountType（1-电话|2-邮件）
  return fetch({
    url: 'wxapp/system/getIdentityCode',
    data: data || {},
    method: 'GET'
  })
}

// 验证验证码
export function checkIdentityCode(data) {  // account identityCode
  return fetch({
    url: 'wxapp/system/checkIdentityCode',
    data: data || {},
    method: 'POST'
  })
}

// 搜索
export function Search(data) {  // key
  return fetch({
    url: 'wxapp/system/v2/Search',
    data: data || {},
    method: 'POST'
  })
}

// 热搜词列表
export function HotSearch(data) {
  return fetch({
    url: 'wxapp/system/HotSearch',
    data: data || {},
    method: 'GET'
  })
}

// 扫码登录
export function ScanLogin(data) { // key
  return fetch({
    url: 'wxapp/system/ScanLogin',
    data: data || {},
    method: 'POST'
  })
}

// 获取电话号码
export function getPhoneNumber(data) { // key
  return fetch({
    url: 'wxapp/system/getPhoneNumber',
    data: data || {},
    method: 'POST'
  })
}

// 获取分享
export function GetWXSSCode(data) { // dataID type
  return fetch({
    url: 'wxapp/system/v2/GetWXSSCode',
    data: data || {},
    method: 'GET'
  })
}*/


