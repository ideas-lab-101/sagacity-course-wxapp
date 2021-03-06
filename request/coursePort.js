import { fetch } from '../axios/fetch'


/**
 * 获得分类或指定用户的课程
 * page type_id(不传或传0则取所有分类) user_id(获取指定用户的课程)
 */
export function getCourseList(data) {
  return fetch({
    url: '/wxapp/course/v3/getCourseList',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 获得课程详情
 * token course_id
 */
export function getCourseInfo(data) {
  return fetch({
    url: '/wxapp/course/v3/getCourseInfo',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 获得课时列表
 * course_id order_type(排序模式，默认正序)
 */
export function getLessonList(data) {
  return fetch({
    url: '/wxapp/course/v3/getLessonList',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 获得课程资源信息(录制时用)
 * data_id
 */
export function getLessonData(data) {
  return fetch({
    url: '/wxapp/course/v3/getLessonData',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 课程资源信息
 * data_id token
 */
export function lessonDataInfo(data) {
  return fetch({
    url: '/wxapp/course/v3/lessonDataInfo',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 指定资源的录制列表
 * data_id
 */
export function getDataRecordList(data) {
  return fetch({
    url: '/wxapp/course/v3/getDataRecordList',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 获得课程内容介绍
 * course_id
 */
export function getCourseContent(data) {
  return fetch({
    url: '/wxapp/course/v3/getCourseContent',
    data: data || {},
    method: 'GET'
  })
}


