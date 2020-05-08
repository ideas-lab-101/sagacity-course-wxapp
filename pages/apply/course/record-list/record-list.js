import { getDataRecordList } from '../../../../request/coursePort'
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
        this.__init(options.id)
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
    __init: function (id) {
        getDataRecordList({
            data_id: Number(id)
        })
            .then((res) => {
                this.setData({
                    recordList: res.data.list
                })
            })
    }

})