import { fetch } from '../axios/fetch'
import { $wuLogin } from '../components/pages/index'

/**
 * 获得评论列表
 * data_id type token
 */
export function getCommentList(data) {
  return fetch({
    url: '/wxapp/comment/v3/getCommentList',
    data: data || {},
    method: 'GET'
  }, true)
}

// 新增留言
export function addComment(data) { //token referID dataID dataType content
  if (!getApp().user.ckLogin()) {
    $wuLogin().show()
    return Promise.reject()
  }
  return fetch({
    url: '/wxapp/comment/v3/addComment',
    data: data || {},
    method: 'POST'
  })
}

/**
 * 删除留言
 * token comment_id
 */
export function delComment(data) {
  if (!getApp().user.ckLogin()) {
    $wuLogin().show()
    return Promise.reject()
  }
  return fetch({
    url: '/wxapp/comment/v3/delComment',
    data: data || {},
    method: 'POST'
  })
}
