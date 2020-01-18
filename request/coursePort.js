import { fetch } from '../axios/fetch'

/**
 * 消息方法调用
 * */
// 获得课程分类
export function getCourseIndex(data) {
  return fetch({
    url: '/wxapp/main/v3/getCourseIndex',
    data: data || {},
    method: 'GET'
  })
}
//获得分类下的课程信息
export function getCourseIndexList(data) {
  return fetch({
    url: '/wxapp/main/v3/getCourseIndexList',
    data: data || {},
    method: 'GET'
  })
}
// 获得分类下的课程列表
export function GetCourseList(data) { //typeID 分页参数
  return fetch({
    url: '/wxapp/course/v3/GetCourseList',
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


