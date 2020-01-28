import AudioManager from "../../../../controller/AudioManager";
const { $wuPlayWidget, $wuNavigation, $wuBackdrop } = require('../../../../components/wu/index')
const { $share } = require('../../../../components/pages/index')
const App = getApp()
const { GetCourseInfo, GetCourseContent } = require('../../../../request/coursePort')
const { getAlbumInfo } = require('../../../../request/recordPort')
const { userLike, userFavor, addUserPoint } = require('../../../../request/userPort')
const WxParse = require('../../../../components/wxParse/wxParse')
const Toast = require('../../../../viewMethod/toast')

Page({
    data: {
        nav: {
            title: "",
            model: 'fold',
            transparent: true,
            animation: {
                duration: 1000,
                timingFunction: "linear"
            }
        },
      statusBarHeight: App.globalData.deviceStatusBarHeight,
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
        this.initAlbumData() // 初始化数据
    },

    onShow: function () {
      /**
       * 登录重新加载数据
       */
      if(App.accreditLogin) {
            App.accreditLogin = false
            this.initAlbumData()
        }
        /*if (!this.isLoadPass) {
            if (!this.data.info.is_enroll && App.enroll.has(this.data.info.courseInfo.CourseID) && App.user.ckLogin()){
                this.setData({ 'info.is_enroll': true })
            }
        }*/

      /**
       * * 停止背景音播放
       **/
      if ( App.globalData.audio) {
        App.globalData.audio.pause()
      }

      this.innerAudioContext = new AudioManager({  //初始换播放插件
        play: this._audioManagerPlay,
        pause: this._audioManagerPause,
        stop: this._audioManagerStop,
        end: this._audioManagerEnd,
        error: this._audioManagerError,
        destroy: this._audioManagerDestroy
      })
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
        /**
       * 顶部图片滚动消失
       * */
        /*if(e.scrollTop > 80 && !this.coverMove) {
          this.coverMove = true
          this.coverMoving = true

          clearTimeout(this.coverFn)
          this.coverFn = setTimeout(() => {
            this.setData({coverShow: true})
          }, 50)
        }else if(e.scrollTop < 80 && this.coverMove) {
          this.coverMove = false
          this.coverMoving = true

          clearTimeout(this.coverFn)
          this.coverFn = setTimeout(() => {
            this.setData({coverShow: false})
          }, 50)
        }*/
    },

    onShareAppMessage: function () {
      return {
        imageUrl: `${this.data.info.albumInfo.CoverURL}?imageView2/5/h/300`,
        title: this.data.info.albumInfo.AlbumName,
        path: `/pages/apply/course/album/album?id=${this.optionsId}`,
        success: (ret) => {
          addUserPoint({ pointCode: '001'})
        }
      }
    },
    /**
    * 加载数据事件
    * */
    initAlbumData() {
      getAlbumInfo({albumID: this.optionsId}).then((res) => {
        this.setData({
          info: res
        })
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
      $share().show({coverUrl: this.data.info.albumInfo.CoverURL, type: 'a', id: this.data.info.albumInfo.AlbumID})
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
                this.setData({
                    'info.is_favor': res.is_favor
                })
                Toast.text({ text: res.msg})
            })
    },
    likeEvent(e) {
      const index = e.currentTarget.dataset.index
      const item = this.data.info.recordList[index]
      const id = item.RecordID
      userLike({
          data_id: id,
          type: 'record'
      })
          .then((res) => {
            item.likeCount++
            const obj = `info.recordList[${index}].likeCount`
            this.setData({
              [obj]: item.likeCount
            })
              Toast.text({ text: res.msg})
          })
          .catch(ret => {
              Toast.text({ text: ret.msg})
          })
    },
  /**
   * 留言事件
   */
    discussEvent: function () {
      wx.navigateTo({
        url: `/pages/common/comment/comment?type=course&id=${this.optionsId}`
      })
    },
  /**
   * 列表点击事件
   * @param e
   * @returns {boolean}
   */
    skipPlayerEvent: function (e) {
      const index = e.currentTarget.dataset.index
      const url = this.data.info.recordList[index].FileURL
      const id = this.data.info.recordList[index].RecordID
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
      this._audioManagerRelease()
    },
    _audioManagerEnd: function () {
      this._audioEnd()
      //this._audioManagerRelease()
    },
    _audioManagerError: function () {
      this._audioManagerRelease()
    },
    _audioManagerDestroy: function () {
      this.innerAudioContext = null
      this._audioManagerRelease()
    },
    _audioManagerRelease: function () {
      this.setData({
        'tryParams.isPlay': false,
        'tryParams.id': ''
      })
    },

    _audioEnd() {
      let index = this.data.info.recordList.findIndex(item => this.data.tryParams.id === item.RecordID)
      if(index === -1 || index === this.data.info.recordList.length - 1) {
        this._audioManagerRelease()
        return false
      }
      index ++
      const currentID = this.data.info.recordList[index].RecordID
      const url = this.data.info.recordList[index].FileURL
      this.setData({
        'tryParams.isPlay': true,
        'tryParams.id': currentID
      })
      this.innerAudioContext.play(url)
    }

})
