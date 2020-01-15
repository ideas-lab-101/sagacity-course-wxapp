const { fetch } = require('../axios/fetch')

/**
 * 评论方法调用
 * */
// 获得评论列表
export function getCommentList(data) { //dataID type token
  return fetch({
    url: 'wxapp/comment/getCommentList',
    data: data || {},
    method: 'GET'
  }, true)
}

// 新增留言
export function addComment(data) { //token referID dataID dataType content
  if (!getApp().user.ckLogin()) {
    wx.navigateTo({
      url: '/pages/common/accredit/accredit'
    })
    return new Promise((resolve, reject) => {})
  }
  return fetch({
    url: 'wxapp/comment/addComment',
    data: data || {},
    method: 'POST'
  })
}

// 删除留言
export function delComment(data) { //token commentID
  if (!getApp().user.ckLogin()) {
    wx.navigateTo({
      url: '/pages/common/accredit/accredit'
    })
    return new Promise((resolve, reject) => {})
  }
  return fetch({
    url: 'wxapp/comment/delComment',
    data: data || {},
    method: 'POST'
  })
}
