import { $wuLogin } from '../components/pages/index'
import { fetch } from '../axios/fetch'

/**
 * 获得用户创建和加入的学习组
 * token
 */
export function getTeamList(data) {
  return fetch({
    url: '/wxapp/team/v3/getTeamList',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 获取学习小组 单个小组的信息
 * team_id token
 */
export function getTeamInfo(data) {
  return fetch({
    url: '/wxapp/team/v3/getTeamInfo',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 加入小组
 * token team_id label(组内昵称) profile_id(对应档案)
 */
export function joinTeam(data) {
  if (!getApp().user.ckLogin()) {
    $wuLogin().show()
    return Promise.reject()
  }
  return fetch({
    url: '/wxapp/team/v3/joinTeam',
    data: data || {},
    method: 'POST'
  })
}


/**
 * 获得小组任务列表
 * team_id state(可选，0|1)
 */
export function getTeamTask(data) {
  return fetch({
    url: '/wxapp/team/v3/getTeamTask',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 提交作品到任务
 * team_id task_id(小组任务，没有则为0) record_id
 */
export function addTeamRecord(data) {
  return fetch({
    url: '/wxapp/team/v3/addTeamRecord',
    data: data || {},
    method: 'POST'
  })
}

// 从组中移除作品
export function removeTeamRecord(data) {  // token submitID
  return fetch({
    url: '/wxapp/team/v3/removeTeamRecord',
    data: data || {},
    method: 'POST'
  })
}

/**
 * 获取组中的作品列表
 * token team_id user_id(可选) data_type(1:星标 2:组创建者 3:当前用户) page
 */
export function getTeamRecordList(data) {
  return fetch({
    url: '/wxapp/team/v3/getTeamRecordList',
    data: data || {},
    method: 'GET'
  })
}


/**
 * 获得组中作品详情
 * token record_id team_id
 */
export function getTeamRecordInfo(data) {
  return fetch({
    url: '/wxapp/team/v3/getTeamRecordInfo',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 设置小组人物昵称
 * token team_id label
 */
export function setTeamLabel(data) {
  return fetch({
    url: '/wxapp/team/v3/setTeamLabel',
    data: data || {},
    method: 'POST'
  })
}

// 获取小组人物昵称
export function getTeamLabel(data) {  // teamID, token
  return fetch({
    url: '/wxapp/team/v3/getTeamLabel',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 获得个人组内昵称+关联档案
 * token team_id
 */
export function getTeamIdentity(data) {
  return fetch({
    url: '/wxapp/team/v3/getTeamIdentity',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 获得组成员
 * team_id page
 */
export function getTeamMember(data) {
  return fetch({
    url: '/wxapp/team/v3/getTeamMember',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 退出小组
 * token team_id
 */
export function exitTeam(data) {
  return fetch({
    url: '/wxapp/team/v3/exitTeam',
    data: data || {},
    method: 'POST'
  })
}


/**
 * 设置作品为星标
 * state(0|1) submit_id
 */
export function markRecord(data) {
  return fetch({
    url: '/wxapp/team/v3/markRecord',
    data: data || {},
    method: 'POST'
  })
}

// 获得小组档案
export function getTeamProfile(data) {  // teamID page
  return fetch({
    url: '/wxapp/team/v3/getTeamProfile',
    data: data || {},
    method: 'GET'
  })
}



