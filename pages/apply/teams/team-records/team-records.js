const App = getApp()
import { getTeamRecordList, removeTeamRecord } from '../../../../request/teamPort'
import { $wuxActionSheet } from 'wux-weapp'
const PageReachBottomBehavior = require('../../../../utils/behaviors/PageReachBottomBehavior')

Page({
    behaviors: [PageReachBottomBehavior],
    data: {
      nav: {
        title: '全部作品',
        model: 'extrude',
        transparent: false,
        animation: {
          duration: 1000,
          timingFunction: "linear"
        }
      },
      userID: '',

      /**
       * 数据参数
       */
      creatorID: null,
      /**
       * 计算滚动的参数
       */
      clientArray: [],  // 所有的列表demo存储
      clientDateArray: [],  // 所有的日期demo 存储
      navigationRect: 0,   // 顶部置顶的位置
      scrollCurrentTime: '',
      scrollDirection: 'down'
    },

    onLoad: function (options) {
      this.optionsId = options.id
      this.setData({
        creatorID: App.teamActive?App.teamActive.userInfo.UserID : '',
        optionsUserId: options.userid || '',
        userID: App.user.userInfo.user_id ,
        'nav.title': options.title?decodeURI(options.title):'全部作品'
      })

      this.optionsShowMark = 0  // 0-全部 1-星标；2-组所有者；3-用户自己

    },

    onShow: function () {
      /**
       * * 如果有背景音,停止背景音播放
       **/
      if ( App.globalData.audio) {
        App.globalData.audio.pause()
      }

      this.__init(this.optionsId)
    },

    onPageScroll: function (e) {
      this.scrollEvent(e.scrollTop)
    },

    onReachBottom: function () {
      this.__ReachBottom()
    },

    // 自定义事件
  /**
   * 获取单条数据的demo
   * @param e
   * @returns {boolean}
   */
    scrollEvent: function(scrollTop) {
      const { list } = this.data.content
      if(list.length<=0) {
        return false
      }
      let dateIndex = 0
      if(scrollTop >= 0) {
        const index = this.findClientIndex(scrollTop)
        dateIndex = this.findDateLastIndex(index, this.data.clientDateArray)
        this.data.scrollDirection = 'down'
      }else {
        dateIndex = 0
        this.data.scrollDirection = 'up'
      }
      this.setData({scrollCurrentTime: list[dateIndex].add_time, scrollDirection: this.data.scrollDirection})
    },

    getSingleClientRect: function (e) {
      const { list, pageNumber } = this.data.content

      if(list.length<=0) {
        this.setData({scrollCurrentTime: null})
        return false
      }
      const query = wx.createSelectorQuery()
      query.select('#wu-navigation').boundingClientRect()
      query.selectAll('.data-single').boundingClientRect()
      query.selectAll('.data-single-date').boundingClientRect()
      query.exec((ret) => {
        this.data.clientArray  = ret[1]
        this.data.clientDateArray  = this.findDateArrayId(ret[2])
        this.setData({
          navigationRect: ret[0].height  // 顶部navation高度
        })
        if(pageNumber === 1 && list.length > 0) {
          this.setData({scrollCurrentTime: list[0].add_time})
        }
      })
    },

    findClientIndex: function (scrollTop) {
      let cumsum = this.data.navigationRect
      return this.data.clientArray.findIndex(item => {
        cumsum += item.height
        return cumsum >= scrollTop
      })
    },
    findDateArrayId: function (Arr) {
      let temp = []
      const str = 'data-nodes'
      Arr.forEach(item => {
        const id = item.id.split(str)[1]
        temp.push(id)
      })
      return temp
    },
    findDateLastIndex: function (scrollIndex, dateArray) {
      let temp = 0
      dateArray.forEach(item => {
        if(Number(item) <= scrollIndex) {
          temp = Number(item)
        }
      })
      return temp
    },
    /**
    * 触发事件
    * @param e
    */
    delEvent: function (e) {
      const index = e.currentTarget.dataset.index
      const SubmitID = e.currentTarget.dataset.id
      if(!SubmitID) {
        return false
      }
      const self = this
      wx.showModal({
        title: '提示',
        content: '确定把我的作品移除此小组?',
        confirmText: '移除',
        success(res) {
          if(res.confirm) {
            self._removeTeamRecord(SubmitID).then(() => {
              self.data.record.list.splice(index, 1)
              self.data.record.totalRow --
              self.setData({'record.list': self.data.record.list, 'record.totalRow': self.data.record.totalRow})
              self.voicePauseEvent()
            })
          }
        }
      })
    },

    filterRecordEvent: function (e) {
      $wuxActionSheet().showSheet({
        titleText: '请选择筛选模式',
        theme: 'wx',
        buttons: [
          {
            text: '显示全部作品'
          },
          {
            text: '仅显示星标作品'
          },
          {
            text: '组所有者作品'
          },
          {
            text: '仅显示自己作品'
          }
        ],
        buttonClicked: (index, item) => {
          let text = '全部作品'
          if(index === 0) {
            this.optionsShowMark = 0
            this.data.optionsUserId = ''
            text = '全部作品'
          }
          if(index === 1) {
            this.optionsShowMark = 1
            this.data.optionsUserId = ''
            text = '星标作品'
          }
          if(index === 2) {
            this.optionsShowMark = 0
            this.data.optionsUserId = this.data.creatorID
            text = '组所有者作品'
          }
          if(index === 3) {
            this.optionsShowMark = 0
            this.data.optionsUserId = App.user.userInfo.UserID
            text = '自己作品'
          }
          this.data.record = {
            list: [],
            pageNumber: 1,
            lastPage: true,
            totalRow: 0
          }
          this.setData({'nav.title': text})
          this.__init(this.optionsId)
          return true
        },
        cancelText: '取消',
        cancel() {}
      })
    },
    /**
     *  链接事件
     * */
    goRecordPageEvent: function (e) {
      const index = e.currentTarget.dataset.index
      const RecordID = this.data.content.list[index].record_id
      wx.navigateTo({
        url: `/pages/apply/teams/team-play/team-play?recordid=${RecordID}&teamid=${this.optionsId}`
      })
    },
    /**
     *  获取数据
     * */
    __init: function (teamID) {

      this.__getTurnPageDataList({
        isPageShow: true,
        interfaceFn: getTeamRecordList,
        params: {
          team_id: teamID,
          user_id: this.data.optionsUserId,
          data_type: this.optionsShowMark
        }
      })
          .then(() => {
            this.getSingleClientRect() // 获取demo计算
          })
    },

    _removeTeamRecord: function (submitID) {
      return removeTeamRecord({submitID: submitID}).then((res) => {
        return res
      })
    }

})
