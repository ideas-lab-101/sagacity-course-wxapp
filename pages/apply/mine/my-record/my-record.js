const App = getApp()
import { $wuNavigation, $wuBackdrop } from '../../../../components/wu/index'
import { $share, $teamsTask } from '../../../../components/pages/index'
import { getRecordList } from '../../../../request/userPort'
import { setPublic, delRecord } from '../../../../request/recordPort'
const InnerAudioPlayBehavior = require('../../../../utils/behaviors/InnerAudioPlayBehavior')
const MultiplePageReachBottomBehavior = require('../../../../utils/behaviors/MultiplePageReachBottomBehavior')
const PageReachBottomBehavior = require('../../../../utils/behaviors/PageReachBottomBehavior')
const Dialog = require('../../../../viewMethod/dialog')

Page({
    behaviors: [MultiplePageReachBottomBehavior, PageReachBottomBehavior, InnerAudioPlayBehavior],
    data: {
      statusBarHeight: App.globalData.equipment.statusBarHeight,
      nav: {
        title: '个人作品集',
        backURLType: 'switch',
        backURL: '',
        model: 'extrude',
        transparent: false
      },
      gOpenID: true,
      tabs: [
        { name: '全部作品', blnPublic: 0}, { name: '公开作品', blnPublic: 1}
      ],
      /**
       * 学习小组参数
       */
      teamsList: [],
      /**
       * 查询
       */
      isSearchData: false
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
      if (this.data.isSearchData) {
        this.__ReachBottom()
      }else {
        this.__ReachBottomMultiple()
      }
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
        const { list } = this.data.contentMultiple
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
        const { tabs } = this.data
        const params = tabs.map(item => {
          return {
            isPageShow: true,
            interfaceFn: getRecordList,
            params: {
                userId: App.user.userInfo.user_id,
                blnPublic: item.blnPublic || ''
            }
          }
        })
        this.__getTurnPageDataListMultiple(params)
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
        const { list } = this.data.contentMultiple
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
      const { list } = this.data.contentMultiple
      const { index } = e.currentTarget.dataset
      const id = list[index].record_id
      let stus = 0

      if(e.detail.value) {
          stus = 1
      }

      setPublic({
              recordId: id,
              blnPublic: stus
        })
          .then((res) => {
              const obj = `contentMultiple.list[${index}].bln_public`
              this.setData({
                  [obj]: stus
              })
              /**清除 更新缓存 */
              const { contentMultipleCurrent, contentMultiple } = this.data
              this.__clearTurnPageCacheData()
              this.__addTurnPageCacheData( contentMultipleCurrent, contentMultiple)
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
    deleteUserRecord: function (recordID, index) {
      let { list, totalRow } = this.data.contentMultiple
        delRecord({
            record_id: recordID
            })
              .then((res) => {
                  list.splice(index, 1)
                  totalRow--
                  this.setData({
                      'contentMultiple.list': list,
                      'contentMultiple.totalRow': totalRow
                  })
              })
    },

    /**
     * 查询相关
     */
    openSearch() {
      this.setData({ isSearch: true}, () => {

        this.animate('#search', [
          { width: 0, ease: 'ease-in-out' },
          { width: App.globalData.equipment.windowWidth -10 +'px !important', ease: 'ease-in-out' },
          ], 260, function () {
            this.setData({ searchFocus: true})
        }.bind(this))
      })
    },
    freeSearch() {
      this.setData({ searchFocus: false}, () => {
        this.animate('#search', [
          { width: App.globalData.equipment.windowWidth -10 +'px !important', ease: 'ease-in-out' },
          { width: 0, ease: 'ease-in-out' },
          ], 260, function () {
            this.setData({ isSearch: false, isSearchData: false})
        }.bind(this))
      })
    },

    doSearch(e) {
      const { contentMultipleCurrent, tabs } = this.data;
      const { key } = e.detail.value
      if (String(key).trim() === '') {
        return false
      }

      this.__getTurnPageDataList({
        isPageShow: true, 
        interfaceFn: getRecordList, 
        params: {
          userId: App.user.userInfo.user_id,
          blnPublic: tabs[contentMultipleCurrent].blnPublic || '',
          key: key
        }
      })
      .then(() => {
        this.setData({ isSearchData: true })
      })
    },
})
