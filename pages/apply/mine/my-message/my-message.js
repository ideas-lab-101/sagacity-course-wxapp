const App = getApp()
const { $wuNavigation } = require('../../../../components/wu/index')
const { getMessageList, setMessage } = require('../../../../request/msgPort')

Page({
    data: {
        msg: {
            pageNumber: 1,
            lastPage: false,
            list: []
        }
    },

    onLoad: function () {
        this._initMessageList()
    },

    onShow: function () {},

    onPageScroll: function (e) {
      $wuNavigation().scrollTop(e.scrollTop)
    },

    onReachBottom: function () {
        if (this.data.msg.lastPage || this.isLoading) {
            return false
        }
      this.data.msg.pageNumber++
        this._initMessageList()
    },

    // 自定义事件
    cancelReadEvent: function (e) {
        const index = e.currentTarget.dataset.index
        const id = this.data.msg.list[index].MessageID
        const dataID = this.data.msg.list[index].DataID
        setMessage({messageID: id}).then((res) => {
            if (res.code) {
                this.data.msg.list.splice(index, 1)
                this.setData({
                    'msg.list': this.data.msg.list
                })
                setTimeout(() => {
                    wx.navigateTo({
                        url: `/pages/apply/mine/record-play/record-play?id=${dataID}`
                    })
                }, 10)
            }
        })
    },

    _initMessageList: function () {
        this.isLoading = true
        getMessageList({page: this.data.msg.pageNumber, pageSize: 20}).then((res) => {
            this.isLoading = false
            this.setData({
                'msg.lastPage': res.lastPage,
                'msg.list': this.data.msg.list.concat(res.list)
            })
        })
    }

})
