import { fetch } from '../axios/fetch'

export function getTopicInfo(data) { // topicID token(可选)
  return fetch({
    url: '/wxapp/topic/v3/getTopicInfo',
    data: data || {},
    method: 'GET'
  })
}
