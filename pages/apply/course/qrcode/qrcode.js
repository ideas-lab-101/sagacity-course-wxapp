const App = getApp()
import Poster from 'wxa-plugin-canvas';

Page({

  data: {
    statusBarHeight: App.globalData.equipment.statusBarHeight,
    nav: {
      title: '',
      model: 'fold',
      transparent: false,
    },

    posterConfig: null,
    posterUrl: ''
  },

  onLoad (options) {
    this.data.url = options.url
    this.data.name = decodeURIComponent(options.name)
    this.data.desc = decodeURIComponent(options.desc)
    this.data.qrcode = options.qrcode

    this.__init()
  },

  __init() {
    /**
     * 生成封面图
     */
    this.initPoster()
  },

  initPoster() {
    const equipment = App.globalData.equipment
    const { url } = this.data
    
    const images = [
      {
        width: 100,
        height: 100,
        x: 150,
        y: 120,
        zIndex: 100,
        url: url,
      }
    ]
  
    const { name, desc } = this.data
    const posterConfig = {
      width: equipment.screenWidth*2,
      height: Math.ceil(equipment.screenWidth*2*700/640) + 320,
      backgroundColor: '#fff',
      hideLoading: false,
      debug: false,
      pixelRatio: 1,
      blocks: [],
      texts: [
        {
          x: 380,
          y: 70,
          baseLine: 'middle',
          text: String(name),
          fontSize: 24,
          color: '#ffffff',
          zIndex: 200,
          width: equipment.screenWidth*2,
          textAlign: 'center'
        },
        {
          x: 270,
          y: 130,
          baseLine: 'top',
          text: String(desc),
          fontSize: 30,
          color: '#57b3ff',
          zIndex: 200,
          width: equipment.screenWidth*2
        }
      ],
      images: images
    }

    this.setData({ posterConfig })

    this.onCreatePoster()
  },

  /**
   * 生成二维码回调函数
   * @param e
   */
  onPosterSuccess(e) {
    const { detail } = e;
    this.setData({
      posterUrl: detail
    })
    wx.hideLoading()
  },
  onPosterFail(err) {
    console.error(err);
    wx.hideLoading()
  },

  /**
   * 异步生成海报
   */
  onCreatePoster() {
    const { posterConfig } = this.data
    wx.showLoading({
      title: `海报生成中...`,
      mask: true
    })
    this.setData({ posterConfig }, () => {
      Poster.create(true);    // 入参：true为抹掉重新生成
    });
  }

})
