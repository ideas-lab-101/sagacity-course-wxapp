const { fetch } = require('../axios/fetch')

export function getTopicInfo(data) { // topicID token(可选)
  return fetch({
    url: 'wxapp/topic/getTopicInfo',
    data: data || {},
    method: 'GET'
  })
}
