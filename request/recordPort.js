import { fetch } from '../axios/fetch'
const { host } = require('../sever.config')

/**
 * 录制方法调用
 * */
// 获得作品推荐背景音，此接口调整为跟读模式下的指定背景音
export function getRecommendMusic(data) { //dataID
  return fetch({
    url: '/wxapp/record/getRecommendMusic',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 获得指定类别的背景音列表
 * style_id key(支持按歌曲名搜索)
 */
export function getMusicList(data) {
  return fetch({
    url: '/wxapp/record/v3/getMusicList',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 录制的音频信息
 * token record_id
 */
export function getRecordInfo(data) {
  return fetch({
    url: '/wxapp/record/v3/getRecordInfo',
    data: data || {},
    method: 'GET'
  })
}

/**
 * 上传录音
 * music_id(0则未选择背景音) recordFile(文件)
 */
export function uploadRecordFile(options, progress, complete) {
  return new Promise( (resolve, reject) => {
    const uploadTask = wx.uploadFile({
      url: host + '/wxapp/record/v3/uploadRecordFile',
      filePath: options.path,
      name: 'recordFile',
      formData:  {
        music_id: options.musicID,
        duration: options.duration,
      },
      success: function (res) {
        resolve(res)
      },
      fail: function (error) {
        reject(error)
      },
      complete: function () {
        uploadTask.abort()
        complete && complete()
      }
    })

    uploadTask.onProgressUpdate((res) => {
      progress && progress(res)
    })
  })
}

// 获取是否混音完成状态
export function queryTaskState(data) { // taskID
  return fetch({
    url: '/wxapp/record/v2/queryTaskState',
    data: data || {},
    method: 'GET'
  })
}


// 修改录音描述
export function updateRecordSign(data) { //recordID desc
  return fetch({
    url: '/wxapp/record/updateRecordSign',
    data: data || {},
    method: 'POST'
  })
}

/**
 * 撤销混音任务
 * task_id file_url(混音后的文件) record_url(原音)
 */
export function recordCancel(data) {
  return fetch({
    url: '/wxapp/record/v3/recordCancel',
    data: data || {},
    method: 'POST'
  })
}

/**
 * 提交录制任务
 * token data_id(课程资源id) music_id mode(背诵、朗诵) task_id file_url(混音后的文件) record_url(原音)
 */
export function submitRecordFile(data) {
  return fetch({
    url: '/wxapp/record/v3/submitRecordFile',
    data: data || {},
    method: 'POST'
  }, { title: '正在提交，请等候...'})
}

/**
 * 设置作品公开
 * record_id bln_public
 */
export function setPublic(data) {
  return fetch({
    url: '/wxapp/record/v3/setPublic',
    data: data || {},
    method: 'POST'
  })
}

/**
 * 删除作品
 * token record_id
 */
export function delRecord(data) {
  return fetch({
    url: '/wxapp/record/v3/delRecord',
    data: data || {},
    method: 'POST'
  })
}

// 专辑作品
export function getAlbumInfo(data) { // albumID token
  return fetch({
    url: '/wxapp/record/v2/getAlbumInfo',
    data: data || {},
    method: 'GET'
  })
}



