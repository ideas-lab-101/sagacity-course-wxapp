const { fetch } = require('../axios/fetch')

/**
 * 学习小组方法调用
 * */
// 获取学习小组的列表
export function getTeamList(data) { // token
  return fetch({
    url: 'wxapp/team/getTeamList',
    data: data || {},
    method: 'GET'
  })
}

// 获取学习小组 单个小组的信息
export function getTeamInfo(data) { // teamID
  return fetch({
    url: 'wxapp/team/getTeamInfo',
    data: data || {},
    method: 'GET'
  })
}

// 加入小组
export function joinTeam(data) {  // token teamID label(如果是认证组) profileID
  if (!getApp().user.ckLogin()) {
    wx.navigateTo({
      url: '/pages/common/accredit/accredit'
    })
    return new Promise((resolve, reject) => {})
  }
  return fetch({
    url: 'wxapp/team/joinTeam',
    data: data || {},
    method: 'POST'
  })
}


// 获得小组任务列表
export function getTeamTask(data) {  // token teamID state(可选，0|1)
  return fetch({
    url: 'wxapp/team/getTeamTask',
    data: data || {},
    method: 'GET'
  })
}

// 作品加入到组
export function addTeamRecord(data) {  // token teamID recordID taskID(小组任务，没有则为0)
  return fetch({
    url: 'wxapp/team/addTeamRecord',
    data: data || {},
    method: 'POST'
  })
}

// 从组中移除作品
export function removeTeamRecord(data) {  // token submitID
  return fetch({
    url: 'wxapp/team/removeTeamRecord',
    data: data || {},
    method: 'POST'
  })
}

// 获取组中的作品列表
export function getTeamRecordList(data) {  // teamID, 分页参数
  return fetch({
    url: 'wxapp/team/getTeamRecordList',
    data: data || {},
    method: 'GET'
  })
}


// 获得组中作品详情
export function getTeamRecordInfo(data) {  // teamID, recordID
  return fetch({
    url: 'wxapp/team/getTeamRecordInfo',
    data: data || {},
    method: 'GET'
  })
}

// 设置小组人物昵称
export function setTeamLabel(data) {  // teamID, token, label
  return fetch({
    url: 'wxapp/team/setTeamLabel',
    data: data || {},
    method: 'POST'
  })
}

// 获取小组人物昵称
export function getTeamLabel(data) {  // teamID, token
  return fetch({
    url: 'wxapp/team/getTeamLabel',
    data: data || {},
    method: 'GET'
  })
}
// 获取小组人物昵称
export function getTeamIdentity(data) {  // teamID, token
  return fetch({
    url: 'wxapp/team/v2/getTeamIdentity',
    data: data || {},
    method: 'GET'
  })
}

// 获取小组人物昵称
export function getTeamMember(data) {  // teamID, token
  return fetch({
    url: 'wxapp/team/getTeamMember',
    data: data || {},
    method: 'GET'
  })
}

// 退出小组
export function exitTeam(data) {  // teamID, token
  return fetch({
    url: 'wxapp/team/exitTeam',
    data: data || {},
    method: 'POST'
  })
}


// 组内设置星标
export function markRecord(data) {  // submitID, state(0|1)
  return fetch({
    url: 'wxapp/team/markRecord',
    data: data || {},
    method: 'POST'
  })
}

// 获得小组档案
export function getTeamProfile(data) {  // teamID page
  return fetch({
    url: 'wxapp/team/getTeamProfile',
    data: data || {},
    method: 'GET'
  })
}



