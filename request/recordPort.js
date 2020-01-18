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

// 上传录音
export function uploadRecordFile(options, progress, complete) { //musicID recordFile(File)
  return new Promise( (resolve, reject) => {
    const uploadTask = wx.uploadFile({
      url: host + '/wxapp/record/v2/uploadRecordFile',
      filePath: options.path,
      name: 'recordFile',
      formData:  {
        musicID: options.musicID,
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

// 放弃录制
export function recordCancel(data) { //fileURL recordURL
  return fetch({
    url: '/wxapp/record/v2/recordCancel',
    data: data || {},
    method: 'POST'
  })
}

// 提交录制
export function submitRecordFile(data) { //fileURL recordURL  mode  musicID
  return fetch({
    url: '/wxapp/record/v2/submitRecordFile',
    data: data || {},
    method: 'POST'
  }, { title: '正在提交，请等候...'})
}

// 设置作品公开
export function setPublic(data) { //recordID blnPublic
  return fetch({
    url: '/wxapp/record/setPublic',
    data: data || {},
    method: 'POST'
  })
}

// 删除作品
export function delRecord(data) { //recordID
  return fetch({
    url: '/wxapp/record/delRecord',
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



