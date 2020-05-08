import { fetch } from '../axios/fetch'

/**
 * 获得未读消息列表
 */
export function getMessageList(data) {
  return fetch({
    url: '/wxapp/msg/v3/getMessageList',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 设置消息阅读标志
 * token message_id
 */
export function setMessage(data) {
  return fetch({
    url: '/wxapp/msg/v3/setMessage',
    data: data || {},
    method: 'POST'
  })
}
