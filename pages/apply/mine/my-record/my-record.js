const App = getApp()
import { $wuNavigation, $wuBackdrop } from '../../../../components/wu/index'
import { $share, $teamsTask } from '../../../../components/pages/index'
import { getRecordList } from '../../../../request/userPort'
import { setPublic, delRecord } from '../../../../request/recordPort'
const InnerAudioPlayBehavior = require('../../../../utils/behaviors/InnerAudioPlayBehavior')
const PageReachBottomBehavior = require('../../../../utils/behaviors/PageReachBottomBehavior')
const Dialog = require('../../../../viewMethod/dialog')

Page({
    behaviors: [PageReachBottomBehavior, InnerAudioPlayBehavior],
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

      this.__init()
      this.__initInnerAudioManager()
    },

    onReady: function () {
        wx.hideShareMenu()
    },

    onShow: function () {
      /**
       * * 停止背景音播放
       **/
      if ( App.backgroundAudioManager) {
        App.backgroundAudioManager.pause()
      }
    },

    onPageScroll: function (e) {
      $wuNavigation().scrollTop(e.scrollTop)
    },

    onReachBottom: function () {
        this.__ReachBottom()
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
        const { list } = this.data.content
        const title = `${App.user.userInfo.caption} の ${list[this.shareIndex].name}`
        return {
            title: title,
            imageUrl: `${list[this.shareIndex].cover_url}?imageView2/5/h/300`,
            path: `/pages/apply/mine/record-play/record-play?id=${list[this.shareIndex].record_id}`,
            success: (ret) => {
                postAddUserPoint({
                    data: { pointCode: '002'}
                })
            }
        }
    },

    __init() {
        this.__getTurnPageDataList({
            isPageShow: true,
            interfaceFn: getRecordList,
            params: {
                user_id: App.user.userInfo.user_id,
                bln_public: 0
            }
        })

        this.initUserAccounts()
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

    goLessonPlay(e) {
        const { id } = e.currentTarget.dataset
        wx.navigateTo({
            url: `/pages/apply/course/lesson-play/lesson-play?id=${id}`
        })
    },
  /**
   * 删除作品
   * @param e
   */
  deleteRecordEvent: function (e) {
      const { index, id } = e.currentTarget.dataset

      Dialog.confirm({
          title: '确认删除',
          content: '您是否想好了要删除此作品？',
          cancelText: '算了',
          confirmText: '删除',
          onConfirm: () => {
              this.deleteUserRecord(id, index)
          }
      })
    },
  /**
   * 打开学习小组
   * @param e
   */
  addStudyGroupEvent: function (e) {
      const { index, id } = e.currentTarget.dataset
      $teamsTask().show({recordID: id})
    },
  /**
   * 打开分享
   * @param e
   */
  singleShareEvent: function (e) {
        const { list } = this.data.content
        const { index } = e.currentTarget.dataset
        const id = list[index].record_id
        const url = list[index].cover_url

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
      const { list } = this.data.content
      const { index } = e.currentTarget.dataset
      const id = list[index].record_id
      let stus = 0

      if(e.detail.value) {
          stus = 1
      }

      setPublic({
              record_id: id,
              bln_public: stus
        })
          .then((res) => {
              this.eventChannel.emit('acceptDataMyRecordPublic', {recordID: id })
              const obj = `content.list[${index}].bln_public`
              this.setData({
                  [obj]: stus
              })
          })
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
   * 如果重新关注公号  重新拉取用户信息
   * @private
   */
  initUserAccounts() {
          // getApp().user.retTokenLogin((token, userInfo) => {
          //   if(!userInfo.gOpenID) {
          //     this.openAccountLayer()
          //   }
          //   this.setData({ gOpenID: userInfo.gOpenID})
          // })
    },

    deleteUserRecord: function (recordID, index) {
      let { list, totalRow } = this.data.content
        delRecord({
            record_id: recordID
            })
              .then((res) => {
                  list.splice(index, 1)
                  totalRow--
                  this.setData({
                      'content.list': list,
                      'content.totalRow': totalRow
                  })
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
