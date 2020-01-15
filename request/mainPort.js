const { fetch } = require('../axios/fetch')

/**
 * 系统方法调用
 * */
// 发现页面获取数据
export function discover(data) {
  return fetch({
    url: '/wxapp/main/discover',
    data: data || {},
    method: 'GET'
  })
}

// 主页页面获取数据
export function index(data) {
  return fetch({
    url: '/wxapp/main/v3/index',
    data: data || {},
    method: 'GET'
  })
}

// 获得更新的课程
export function getCourseUpdate(data) { // day(默认为7)
  return fetch({
    url: '/wxapp/main/v3/getCourseUpdate',
    data: data || {},
    method: 'GET'
  })
}

// 获得最新录制
export function getRecordUpdate(data) { // day(默认为10)
  return fetch({
    url: '/wxapp/main/v3/getRecordUpdate',
    data: data || {},
    method: 'GET'
  })
}

// 获得热门章节
export function getHotLessonData(data) { // count(默认100)
  return fetch({
    url: '/wxapp/main/v3/getHotLessonData',
    data: data || {},
    method: 'GET'
  })
}
