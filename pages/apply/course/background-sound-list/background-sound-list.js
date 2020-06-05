import { getMusicList } from '../../../../request/recordPort'
import { getEnumDetail } from '../../../../request/systemPort'
const App = getApp()
const InnerAudioPlayBehavior = require('../../../../utils/behaviors/InnerAudioPlayBehavior')

Page({
    behaviors: [InnerAudioPlayBehavior],
    data: {
        nav: {
          title: "选择背景音",
          backgroundColor: '#e3d6d4',
          navTitle: ''
        },
        tabData: [],
        tabIndex: 0,
        listData: [],
        listCheckedId: null
    },

    onLoad: function (options) {
      /**
       * 初始化被选中的背景音
       **/
        this.eventChannel = this.getOpenerEventChannel()
        this.eventChannel.on('acceptDataSetBackgroundSound', data => {
            if (data.item){
                this.setData({
                    listCheckedId: data.item.music_id
                })
            }
        })

        this.__init()

        this.__initInnerAudioManager()
    },

    onHide: function () {
        if (this.innerAudioContext) {
            this.innerAudioContext.destroy()
        }
    },

    onUnload: function () {
        if (this.innerAudioContext) {
            this.innerAudioContext.destroy()
        }
    },

    /**
     * 获取数据事件
     **/
    __init: function () {
        getEnumDetail({
            masterId: 10
        })
            .then((res) => {
                this.setData({
                    tabData: res.data.list
                })
                this._initBackSoundListData(res.data.list[0].detail_id)
            })
    },

    _initBackSoundListData: function (styleID) {
        getMusicList({
            styleId: styleID
        })
            .then((ret) => {
                this.setData({
                    listData: ret.data
                })
            })
    },

    /**
     * 顶部TAB切换
     * @param e
     */
    tabChangeEvent: function (e) {
      const index = e.currentTarget.dataset.index
        this.setData({
            tabIndex: index
        })
        this._initBackSoundListData(this.data.tabData[index].detail_id)
    },

    /**
     * 耽搁选中背景音
     * @param e
     */
    checkEvent: function (e) {
        const index = e.currentTarget.dataset.index
        const id = this.data.listData[index].music_id
        let temp = id
        let item = this.data.listData[index]
        if (id === this.data.listCheckedId) {
            temp = null
            item = null
        }
        this.setData({
            listCheckedId: temp,
            'nav.title': item?item.title:'选择背景音',
            'nav.navTitle': item?'确定':''
        })

        this.eventChannel.emit('acceptDataSetBackgroundSound', {item: item})
    }
})