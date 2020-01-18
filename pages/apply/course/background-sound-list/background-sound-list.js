const { getMusicList} = require('../../../../request/recordPort')
const { GetEnumDetail } = require('../../../../request/systemPort')
import AudioManager from '../../../../controller/AudioManager'
const App = getApp()

Page({

    data: {
        nav: {
          title: "选择背景音",
          backgroundColor: '#e3d6d4',
          navTitle: '',
          animation: {
            duration: 500,
            timingFunction: "linear"
          }
        },

        tabData: [],
        tabIndex: 0,
        listData: [],
        listCheckedId: null,
        tryParams: {
            isPlay: '',
            id: ''
        }
    },

    onLoad: function (options) {
      /**
       * 初始化被选中的背景音
       **/
        this.eventChannel = this.getOpenerEventChannel()
        this.eventChannel.on('acceptDataSetBackgroundSound', data => {
            console.log(data)
            if (data){
                this.setData({
                    listCheckedId: data.MusicID
                })
            }
        })

        this._initBackSoundTypeData()
    },

    onShow: function () {
      /**
       * 初始换播放插件
       **/
      this.innerAudioContext = new AudioManager({
        play: this._audioManagerPlay,
        pause: this._audioManagerPause,
        stop: this._audioManagerStop,
        end: this._audioManagerEnd,
        error: this._audioManagerError,
        destroy: this._audioManagerDestroy
      })
    },

    onReady: function () {
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
     * 内部事件
     **/
    tabChangeEvent: function (e) {
      const index = e.currentTarget.dataset.index
        this.setData({
            tabIndex: index
        })
        this._initBackSoundListData(this.data.tabData[index].DetailID)
    },

    checkEvent: function (e) {
        const index = e.currentTarget.dataset.index
        const id = this.data.listData[index].MusicID
        let temp = id
        let item = this.data.listData[index]
        if (id === this.data.listCheckedId) {
            temp = null
            item = null
        }
        this.setData({
            listCheckedId: temp,
            'nav.title': item?item.Title:'选择背景音',
            'nav.navTitle': item?'确定':''
        })

        this.eventChannel.emit('acceptDataSetBackgroundSound', {data: item})
    },

    tryListenEvent: function (e) {
        const index = e.currentTarget.dataset.index
        const url = this.data.listData[index].ResourceURL
        const id = this.data.listData[index].MusicID
        if (this.data.tryParams.isPlay && id === this.data.tryParams.id) {
            this.innerAudioContext.stop()
            return false
        }
        this.setData({
          'tryParams.isPlay': true,
          'tryParams.id': id
        })
        this.innerAudioContext.play(url)
    },

    /**
     * audio播放回调方法
     **/
    _audioManagerPlay: function () {
    },
    _audioManagerPause: function () {
    },
    _audioManagerStop: function () {
        this._audioManagerBackFn()
    },
    _audioManagerEnd: function () {
        this._audioManagerBackFn()
    },
    _audioManagerError: function (res) {
        this._audioManagerBackFn()
    },
    _audioManagerDestroy: function () {
        this.innerAudioContext = null
    },

    _audioManagerBackFn: function () {
        this.setData({
            'tryParams.isPlay': false,
            'tryParams.id': ''
        })
    },

    /**
     * 获取数据事件
     **/
    _initBackSoundTypeData: function () {
      GetEnumDetail({masterID: 10}).then((res) => {
            this.setData({
                tabData: res.list
            })
            this._initBackSoundListData(res.list[0].DetailID)
        })
    },

    _initBackSoundListData: function (styleID) {
        getMusicList({styleID: styleID}).then((ret) => {
            this.setData({
                listData: ret.list
            })
        })
    }
})