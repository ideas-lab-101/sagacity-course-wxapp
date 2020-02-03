const App = getApp()
const { $wuNavigation } = require('../../../../components/wu/index')
import { getMessageList, setMessage } from '../../../../request/msgPort'
const PageReachBottomBehavior = require('../../../../utils/behaviors/PageReachBottomBehavior')

Page({
    behaviors: [PageReachBottomBehavior],
    data: {
    },

    onLoad: function () {
        this.__init()
    },

    onPageScroll: function (e) {
      $wuNavigation().scrollTop(e.scrollTop)
    },

    onReachBottom: function () {
        this.__ReachBottom()
    },

    /**
     * 点击消除事件
     * @param e
     */
    cancelReadEvent: function (e) {
        const { index } = e.currentTarget.dataset
        const { list } = this.data.content
        const id = list[index].message_id
        const dataID = list[index].data_id

        setMessage({
            message_id: id
        })
            .then((res) => {

                list.splice(index, 1)
                this.setData({ 'content.list': list })

                const linkFn = setTimeout(() => {
                    clearTimeout(linkFn)
                    wx.navigateTo({
                        url: `/pages/apply/mine/record-play/record-play?id=${dataID}`
                    })
                }, 100)
            })
    },

    __init: function () {
        this.__getTurnPageDataList({
            isPageShow: true,
            interfaceFn: getMessageList,
            params: {}
        })
    }

})
