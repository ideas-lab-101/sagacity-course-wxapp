const App = getApp()
import { $wuNavigation } from '../../../../components/wu/index'
import { getFavorList, userFavor } from '../../../../request/userPort'
import { getEnumDetail } from '../../../../request/systemPort'
const MultiplePageReachBottomBehavior = require('../../../../utils/behaviors/MultiplePageReachBottomBehavior')

Page({
    behaviors: [MultiplePageReachBottomBehavior],
    data: {
      favorType: []
    },

    onLoad: function () {

        this.__init()
    },

    onShow: function () {},

    onPageScroll: function (e) {
      $wuNavigation().scrollTop(e.scrollTop)
    },

    onReachBottom: function () {
        this.__ReachBottomMultiple()
    },

    __init() {
        const { current } = this.data

        getEnumDetail({
                masterId: 1
            })
            .then((res) => {

                this.setData({
                    favorType: res.data.list,
                })

                this.initFavorList(res.data.list)
            })
    },

    initFavorList(list) {

        const params = [...list].map(item => {
            return {
                isPageShow: true,
                interfaceFn: getFavorList,
                params: {
                    type: item.code
                }
            }
        })

        this.__getTurnPageDataListMultiple(params)
    },

    /**
     * 自定义事件
     * @param e
     */
    cancelCollectEvent: function (e) {
        const { id, type, index } = e.currentTarget.dataset

        userFavor({
            dataId: id,
            type: type
        })
            .then((res) => {

                this.__deleteTurnPageMultiple(index)
            })
    }
})
