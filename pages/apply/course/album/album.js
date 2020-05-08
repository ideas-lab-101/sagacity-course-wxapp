const { $wuNavigation } = require('../../../../components/wu/index')
const { $share } = require('../../../../components/pages/index')
const App = getApp()
const { getAlbumInfo } = require('../../../../request/recordPort')
const { userLike, userFavor, addUserPoint } = require('../../../../request/userPort')
const WxParse = require('../../../../components/wxParse/wxParse')
const Toast = require('../../../../viewMethod/toast')
const InnerAudioPlayBehavior = require('../../../../utils/behaviors/InnerAudioPlayBehavior')
const AppLaunchBehavior = require('../../../../utils/behaviors/AppLaunchBehavior')

Page({
    behaviors: [AppLaunchBehavior, InnerAudioPlayBehavior],
    data: {
        statusBarHeight: App.globalData.equipment.statusBarHeight,
        nav: {
            title: "",
            model: 'fold',
            transparent: true,
            animation: {
                duration: 1000,
                timingFunction: "linear"
            }
        },
      /**
       * 数据
       */
      info: {},
        lessonList: [],
        lesson: {
          pageNumber: 1,
          lastPage: true,
          firstPage: true,
          totalRow: 0,
          list: []
        },
        payBtnTxt: '加入',
        detailLinkText: [{
          name: 'span',
          attrs: {
            style: 'color: block !important; word-break:break-all;'
          },
          children: [{
            type: 'text',
            text: '&nbsp;&nbsp;>>详细介绍'
          }]
        }],
      /**
       * 试听参数
       */
      tryParams: {
        isPlay: false,
        id: ''
      },
      selectorTransition: {
        disk: ''
      }
    },

    onLoad: function (options) {
        this.optionsId = options.id
        /**
         * 扫描进入页面
         **/
        if(options.scene) {
          this.optionsId = options.scene
        }
        this.isLoadPass = true

        this.__initAppLaunch()
        this.__initInnerAudioManager()
    },

    onShow: function () {
      /**
       * * 停止背景音播放
       **/
      if ( App.backgroundAudioManager) {
        App.backgroundAudioManager.pause()
      }
    },

    onReady: function () {
      this.initTransition()
    },

    onHide: function() {
      this.isLoadPass = false
      if (this.innerAudioContext) {
        this.innerAudioContext.destroy()
      }
    },

    onUnload: function () {
      this.isLoadPass = false
      if (this.innerAudioContext) {
        this.innerAudioContext.destroy()
      }
    },

    onPageScroll: function (e) {
        $wuNavigation().scrollTop(e.scrollTop)
    },

    onShareAppMessage: function () {
        const { cover_url, album_name } = this.data.info.album_info
        return {
            imageUrl: `${cover_url}?imageView2/5/h/300`,
            title: album_name,
            path: `/pages/apply/course/album/album?id=${this.optionsId}`,
            success: (ret) => {
                  addUserPoint({ pointCode: '001'})
                }
        }
    },
    /**
    * 加载数据事件
    * */
    __init() {
      getAlbumInfo({
          album_id: this.optionsId
      })
          .then((res) => {
            this.setData({ info: res.data })
              /**
               * 初始播放列表
               */
            this.__initTryParamsList(res.data.record_list, 'record_id', 'file_url')
          })
    },

    /**
   * 滚动条滚动 动画结束事件
   * */
    coverShowEndEvent(e) {
      this.coverMoving = false
    },
    initTransition(e) {
      this.setData({'selectorTransition.disk': 'arrived'})
    },
    /**
     * 内部触发事件
     * */
    userShareEvent(e) { // 分享事件
        const { cover_url, album_id } = this.data.info.album_info
        $share().show({coverUrl: cover_url, type: 'a', id: album_id})
    },
    /**
     * 收藏事件
     */
    collectEvent: function () {
        userFavor({
            data_id: this.optionsId,
            type: 'album'
        })
            .then((res) => {
                this.setData({ 'info.is_favor': res.data.is_favor })
                Toast.text({ text: res.msg})
            })
    },

    likeEvent(e) {
      const index = e.currentTarget.dataset.index
      const item = this.data.info.record_list[index]
      const id = item.record_id

      userLike({
          data_id: id,
          type: 'record'
      })
          .then((res) => {
            item.like_count++
            const obj = `info.record_list[${index}].like_count`
            this.setData({
              [obj]: item.like_count
            })
            Toast.text({ text: res.msg})
          })
    },
  /**
   * 留言事件
   */
    discussEvent: function () {
      wx.navigateTo({
        url: `/pages/common/comment/comment?type=course&id=${this.optionsId}`
      })
    }
})
