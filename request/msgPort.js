const { fetch } = require('../axios/fetch')

/**
 * 消息方法调用
 * */
// 获得未读消息列表
export function getMessageList(data) { //token
  return fetch({
    url: '/wxapp/msg/v3/getMessageList',
    data: data || {},
    method: 'GET'
  })
}

// 设置消息阅读标志
export function setMessage(data) { //token messageID
  return fetch({
    url: '/wxapp/msg/v3/setMessage',
    data: data || {},
    method: 'POST'
  })
}
