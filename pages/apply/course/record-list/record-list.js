const { getRecordList } = require('../../../../request/coursePort')
const App = getApp()

Page({

    data: {
        nav: {
          title: "精选作品",
          transparent: false,
          backgroundColor: '#e3d6d4',
          animation: {
            duration: 1000,
            timingFunction: "linear"
          }
        },
        recordList: []
    },

    onLoad: function (options) {
        this._initLessonRecordData(options.id)
    },

    /**
     * 内部事件
     **/
    linktoEvent: function (e) {
        const index = e.currentTarget.dataset.index
        const id = this.data.recordList[index].RecordID
        wx.navigateTo({
            url: `/pages/apply/mine/record-play/record-play?id=${id}`
        })
    },

    /**
     * 获取数据事件
     **/
    _initLessonRecordData: function (id) {
        getRecordList({dataID: Number(id)}).then((res) => {
            console.log(res)
            this.setData({
                recordList: res.list
            })
        }).catch((ret) => {
        })

    }

})