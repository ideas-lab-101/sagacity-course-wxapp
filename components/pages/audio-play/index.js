import baseBehavior from '../../wu/helpers/baseBehavior'
import mergeOptionsToData from '../../wu/helpers/mergeOptionsToData'
import AudioManager from '../../../controller/InnerAudioManager'
const App = getApp()


const defaults = {
  tryParams: {
    isPlay: false,
    id: ''
  },
  slider: {
    current: '00:00',
    duration: '00:00',
    disabled: true,
    value: 0
  }
}

Component({
    behaviors: [baseBehavior],
    externalClasses: ['wu-class'],
    data: mergeOptionsToData(defaults),
    properties: {
      audioBack: {
        type: Object,
        value: {}
      }
    },
    lifetimes: {
      created() {
        /**
         * * 停止背景音播放
         **/
        if ( App.globalData.audio) {
          App.globalData.audio.pause()
        }
        /**
         * * 初始换播放插件
         **/
        this.innerAudioContext = new AudioManager({
          canPlay: () => {this._audioManagerCanPlay()},
          play: () => {this._audioManagerPlay() },
          pause: () => {this._audioManagerPause() },
          timeUpdate: (params) => {this._audioManagerTimeUpdate(params) },
          stop: () => {this._audioManagerStop() },
          end: () => {this._audioManagerEnd() },
          destroy: () => {this._audioManagerDestroy() },
          error: () => {this._audioManagerError(err) }
        })
      },
      attached() {},
      detached() {
        if (this.innerAudioContext) {
          this.innerAudioContext.destroy()
        }
      },
    },
    pageLifetimes: {
      show() {},
      hide() {
        if (this.innerAudioContext) {
          this.innerAudioContext.pause()
        }
      },
      resize(size) {}
    },
    methods: {
      /**
       * 内部事件
       **/
      playInit: function (url, id) {
        this.data.tryParams.id = id
        this.innerAudioContext.play(url)
      },
      resetPlayEvent: function () {
        if (this.data.tryParams.isPlay) {
          this.innerAudioContext.pause()
          return false
        }
        this.innerAudioContext.play()
      },
      sliderChangeEvent: function (e) {
        this.innerAudioContext.seek(e.detail.value / 100)
      },

      /**
       * audio播放回调方法
       **/
      _audioManagerCanPlay: function () {
      },
      _audioManagerPlay: function () {
        this.data.tryParams.isPlay = true
        this.setData({'slider.disabled': false })
        this.triggerEvent('audioEventPlay', {})
      },
      _audioManagerPause: function () {
        this.data.tryParams.isPlay = false
        this.triggerEvent('audioEventPause', {})
      },
      _audioManagerTimeUpdate: function (params) {
        const sliderVal =  params.currentTime*100 / params.duration
        this.setData({
          'slider.current': params.currentTimeFormat,
          'slider.duration': params.durationFormat,
          'slider.value': sliderVal
        })
        this.triggerEvent('audioEventTimeUpdate', {params})
      },
      _audioManagerStop: function () {
        this.data.tryParams.isPlay = false
        this.triggerEvent('audioEventStop', {})
      },
      _audioManagerEnd: function () {
        this.data.tryParams.isPlay = false
        this.triggerEvent('audioEventEnd', {})
      },
      _audioManagerDestroy: function () {
        this.data.tryParams.isPlay = false
        this.triggerEvent('audioEventDestroy', {})
      },
      _audioManagerError: function (err) {
        this.data.tryParams.isPlay = false
        this.triggerEvent('audioEventError', {err})
      }

    }
})