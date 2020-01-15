const { LessonDataInfo, GetLessonList } = require('../request/coursePort')
const { addUserHistory } = require('../request/userPort')
const { $wuPlayWidget } = require('../components/wu/index')

const audioRequest = function (dataID, loopState, frame, audioBack, successBack) {

    return new Promise( (resolve, reject) => {
        LessonDataInfo({dataID: Number(dataID)}).then((res) => {
            const player = getApp().globalData.audio.getPlayer()
            let isSameID = true
            if (Number(dataID) !== Number(player.id) || player.id === '') {
                isSameID = false
            }

            getApp().globalData.audio.create(isSameID, res, loopState, frame, audioBack) // 创建新的播放信息

            successBack && successBack(res, isSameID, dataID) // 页面回调setData渲染方法
            resolve(res)
        }).catch((ret) => {
            reject(ret)
            console.error('请求音乐播放源出错')
        })
    })
}

const getLessonList = function (params) {
    return GetLessonList(params).then(res => {
        return res
    }).catch((ret) => {
        return ret
    })
}

const postHistoryEvent = function (dataID, frame, total) {
    // 这里请求新的地址  就给一条记录
    addUserHistory({dataID: Number(dataID), frame: Number(frame), total: Number(total)}).then((res) => {
        console.log('添加到历史记录')
    }).catch(() => {
        console.error('添加历史失败')
    })
}

const audioEndClearPlayWidget = function () {
    // 重置palyWidget 组件中的数据
    const player = getApp().globalData.audio.getPlayer()
    $wuPlayWidget().upData(player)
}

module.exports = {
    audioRequest: audioRequest,
    postHistoryEvent: postHistoryEvent,
    audioEndClearPlayWidget: audioEndClearPlayWidget,
    getLessonList: getLessonList
}