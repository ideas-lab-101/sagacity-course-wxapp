const App = getApp()
const { $wuNavigation, $wuBackdrop, $wuMarkedwords } = require('../../../../components/wu/index')
const { $share, $teamsTask } = require('../../../../components/pages/index')
const { getRecordList } = require('../../../../request/userPort')
const { getTeamList, addTeamRecord, getTeamTask } = require('../../../../request/teamPort')
const { setPublic, delRecord } = require('../../../../request/recordPort')
import AudioManager from '../../../../controller/AudioManager'

Page({
    data: {
      nav: {
        title: '个人作品集',
        backURLType: 'switch',
        backURL: '',
        model: 'extrude',
        transparent: false
      },
      gOpenID: true,
      /**
       * list参数
       */
        record: {
            list: [],
            lastPage: false,
            pageNumber: 1,
            totalRow: 0
        },

        tryParams: {
            isPlay: false,
            id: ''
        },
      /**
       * 学习小组参数
       */
      teamsList: [],
      /**
       * 引导参数
       */
      markedWords: {
            data: [
              {
                show: false,
                urls: [
                  {
                    url:'https://sagacity-course-000019.tcb.qcloud.la/markedWords/2.1.6/myRecord/marker-05.png?sign=956cee75a42e24d7ffc05933ab791761&t=1541163446',
                    width: '250px',
                    top: '220rpx',
                    left: '60rpx'
                  },
                  {
                    query: '#MarkDown01'
                  },
                  {
                    url:'https://sagacity-course-000019.tcb.qcloud.la/markedWords/2.1.6/myRecord/marker-04.png?sign=2554f76d2782f538d36fee18c2f8ba8f&t=1541428568',
                    width: '220rpx',
                    top: '480rpx',
                    left: '260rpx',
                    next: true
                  }
                ]
              },
              {
                show: false,
                urls: [
                  {
                    url:'https://sagacity-course-000019.tcb.qcloud.la/markedWords/2.1.6/myRecord/marker-01.png?sign=552449e47ab1ba50aff488b435f27e33&t=1540981169',
                    width: '440rpx',
                    top: '180rpx',
                    left: '50rpx'
                  },
                  {
                    query: '#MarkDown02'
                  },
                  {
                    url:'https://sagacity-course-000019.tcb.qcloud.la/markedWords/2.1.6/myRecord/marker-03.png?sign=165a03793d52f0880856f32a86bbb9af&t=1541428612',
                    width: '220rpx',
                    top: '580rpx',
                    left: '500rpx',
                    release: true
                  }
                ]
              }
            ],
            version: App.version
        },
    },

    onLoad: function (options) {
      /**
       * skip  为录制界面跳转过来参数  判断页面返回是否返回到录制界面 或者是另有指向
       */
      if(options.skip) {
        this.setData({
          'nav.backURL': '/pages/tabBar/mine/mine'
        })
      }

      this.eventChannel = this.getOpenerEventChannel()

      /**
       * * 初始换播放插件
       **/
      this.innerAudioContext = new AudioManager({
        play: this._audioManagerPlay,
        pause: this._audioManagerPause,
        stop: this._audioManagerStop,
        end: this._audioManagerEnd,
        error: this._audioManagerError,
        destroy: this._audioManagerDestroy
      })

      this._initUserRecordData()

      this._initUserInfo()
    },

    onReady: function () {
        wx.hideShareMenu()
    },

    onShow: function () {
      /**
       * * 停止背景音播放
       **/
      if ( App.globalData.audio) {
        App.globalData.audio.pause()
      }
    },

    onPageScroll: function (e) {
      $wuNavigation().scrollTop(e.scrollTop)
    },

    onReachBottom: function () {
        this._ReachBottom()
    },

    onHide: function () {
        /**
         * * 销毁音频播放组件
         **/
        if (this.innerAudioContext) {
          this.innerAudioContext.stop()
        }
    },

    onUnload: function () {
        /**
         * * 销毁音频播放组件
         **/
        if (this.innerAudioContext) {
            this.innerAudioContext.destroy()
            this.innerAudioContext = null
        }
    },

    onShareAppMessage: function (res) {
        if (this.shareIndex === undefined) {
            return false
        }
        const title = `${App.user.userInfo.Caption} の ${this.data.record.list[this.shareIndex].Name}`
        return {
            title: title,
            imageUrl: `${this.data.record.list[this.shareIndex].CoverURL}?imageView2/5/h/300`,
            path: `/pages/apply/mine/record-play/record-play?id=${this.data.record.list[this.shareIndex].RecordID}`,
            success: (ret) => {
                postAddUserPoint({
                    data: { pointCode: '002'}
                })
            }
        }
    },
  /**
   * 关注公众号
   * @param e
   */
  goKeepWXAccounts(e) {
    const id = 46
    wx.navigateTo({
      url: `/pages/common/documents/documents?id=${id}`
    })
  },
  /**
   * 删除作品
   * @param e
   */
  deleteRecordEvent: function (e) {
        const index = e.currentTarget.dataset.index
        const id = this.data.record.list[index].RecordID
        wx.showModal({
            title: '确认删除',
            content: '您是否想好了要删除此作品？',
            confirmText: '删除',
            cancelText: '算了',
            success: (res) => {
                if (res.confirm) {
                    this._deleteUserRecord(id, index)
                }
            }
        })
    },
  /**
   * 打开学习小组
   * @param e
   */
  addStudyGroupEvent: function (e) {
      const index = e.currentTarget.dataset.index
      const id = this.data.record.list[index].RecordID
      $teamsTask().show({recordID: id})
    },
  /**
   * 打开分享
   * @param e
   */
  singleShareEvent: function (e) {
        const { list } = this.data.record
        const { index } = e.currentTarget.dataset
        const id = list[index].RecordID
        const url = list[index].CoverURL

        this.shareIndex = index // 保存记录  方便分享获取ID
        $share().show({
          coverUrl: url,
          type: 'r',
          id: id
        })
    },
  /**
   * 设置公开
   * @param e
   */
  setPublicSwitchEvent: function (e) {
      const { list } = this.data.record
      const { index } = e.currentTarget.dataset
      const id = list[index].RecordID
      let stus = 0

      if(e.detail.value) {
          stus = 1
      }
      setPublic({
              recordID: id,
              blnPublic: stus
      })
          .then((res) => {
              this.eventChannel.emit('acceptDataMyRecordPublic', {recordID: id })
              const obj = `record.list[${index}].blnPublic`
              this.setData({
                  [obj]: stus
              })
          })
    },

    tryListenEvent: function (e) {
        const { list } = this.data.record
        const { index } = e.currentTarget.dataset
        const url = list[index].FileURL
        const id = list[index].RecordID

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
    *  向导组件回调函数
    * */
    markDownFreeEvent: function (e) {
        const i = e.detail.index
        const release = e.detail.release
        this.data.markedWords.data.forEach( (item, index) => {
          let temp = false
          if (i === index && !release) {
            temp = true
          }
          const obj = `markedWords.data[${index}].show`
          this.setData({
            [obj]: temp
          })
        })
    },
    /**
    *  获取数据
    * */
    _initUserRecordData: function () {
      return getRecordList({page: this.data.record.pageNumber, userID: getApp().user.userInfo.UserID}).then((res) => {
            this.setData({
                'record.list': this.data.record.list.concat(res.list),
                'record.lastPage': res.lastPage,
                'record.totalRow': res.totalRow
            })
           /**
           *  控制向导组件根据数据显示
           * */
           //$wuMarkedwords()._checkMarker()
        })
    },

  /**
   * 如果重新关注公号  重新拉取用户信息
   * @private
   */
  _initUserInfo() {
      getApp().user.retTokenLogin((token, userInfo) => {
        if(!userInfo.gOpenID) {
          this.openAccountLayer()
        }
        this.setData({ gOpenID: userInfo.gOpenID})
      })
    },

    _ReachBottom: function () {
      if (this.data.record.lastPage || this.isLoading) {
        return false
      }
      this.isLoading = true
      this.data.record.pageNumber++
      this._initUserRecordData().then(() => {
        this.isLoading = false
      }).catch(() => {
        this.isLoading = false
        this.data.record.pageNumber--
      })
    },

    _deleteUserRecord: function (recordID, index) {
        delRecord({recordID: recordID})
          .then((res) => {
            if (res.code) {
                this.data.record.list.splice(index, 1)
                this.data.record.totalRow--
                this.setData({
                    'record.list': this.data.record.list,
                    'record.totalRow': this.data.record.totalRow
                })
            }
          })
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
      this._audioManagerRelease()
    },
    _audioManagerError: function () {
      this._audioManagerRelease()
    },
    _audioManagerDestroy: function () {
      this.innerAudioContext = null
    },
    _audioManagerRelease: function () {
      this.setData({
        'tryParams.isPlay': false,
        'tryParams.id': ''
      })
    },

  /**
   * 关注公众号
   */
    closeAccountLayer() {
      this.setData({ AccountsIn: false})
      $wuBackdrop('#account-backdrop', this).release()
    },

    openAccountLayer() {
      this.setData({ AccountsIn: true })
      $wuBackdrop('#account-backdrop', this).retain()
    }

})
