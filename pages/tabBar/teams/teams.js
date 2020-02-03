const App = getApp()
import { getTeamList, getTeamInfo } from '../../../request/teamPort'
const TeamCacheBehavior = require('./TeamCacheBehavior')
import { $wuLogin } from '../../../components/pages/index'

Page({
    behaviors: [TeamCacheBehavior],
    data: {
      statusBarHeight: App.globalData.equipment.statusBarHeight,
      nav: {
        title: 0,
        model: 'extrude',
        transparent: false,
        animation: {
          duration: 1000,
          timingFunction: "linear"
        }
      },
      isLogin: true,
      /**
       * 存储的数据参数
       */
      teamList: [],
      /**
       * 选定的小组
       */
      teamCurrent: null,   // swiper 改变的时候 当前的下标
      teamCurrentID: null,  // 当前加载的teamID  并一定指当前选中的TEAM  的ID
      userID: null,
      /**
       * 页面固定参数 swiper 高度计算
       */
      pageContentHeight: 0
    },

    onLoad: function (options) {
      this.optionsId = options.id
      this.setData({userID: App.user.userInfo.user_id})
      /**
       * 初始化数据
       */
      this.__init()
    },

    onShow: function () {
    },

    onReady: function () {
        const screenHeight = App.globalData.equipment.windowHeight
        const query = wx.createSelectorQuery()

        query.select('#teams-nav').boundingClientRect()
        query.exec((ret) => {
            let h = 0
            ret.forEach((item) => {
                h += item.height
            })
            this.setData({
                pageContentHeight: `${screenHeight - h}px`
            })
        })
    },

    onShareAppMessage: function (res) {
      const index = this.data.teamCurrent
      const teamID = this.data.teamList[index].team_id
      const teamName = this.data.teamList[index].team_name

      let caption = ''
      if(index%3 === 0) {
        caption = this.data.one.userInfo.label || this.data.one.userInfo.caption
      }else if(index%3 === 1) {
        caption = this.data.two.userInfo.label || this.data.two.userInfo.caption
      }else if(index%3 === 2) {
        caption = this.data.three.userInfo.label || this.data.three.userInfo.caption
      }
      return {
        title: `${caption}创建了（${teamName}）`,
        path: `/pages/apply/teams/user-team/user-team?id=${teamID}&title=${encodeURI(teamName)}`,
        success: (ret) => {}
      }
    },
      /**
       * 链接事件
       * @param e
       */
    goMembersEvent: function (e) {
      const index = e.currentTarget.dataset.index
      const teamID = this.data.teamList[index].team_id
      if(!teamID){
        return false
      }
      wx.navigateTo({
        url: `/pages/apply/teams/team-members/team-members?id=${teamID}`
      })
    },
    goCourseEvent: function (e) {
      const courseID = e.currentTarget.dataset.id
      wx.navigateTo({
        url: `/pages/apply/course/lesson-page/lesson-page?id=${courseID}`
      })
    },
    goTeamRecordsEvent: function (e) {
      const index = e.currentTarget.dataset.index
      const { teamList, teamsCache } = this.data
      const teamID = teamList[index].team_id
      if(!teamID){
        return false
      }
      const self = this
      wx.navigateTo({
          url: `/pages/apply/teams/team-records/team-records?id=${teamID}&creatorID=${teamsCache[index].owner.user_id}`,
          events: {
              acceptDataTeamRecordChange: function(data) {
                  const i = teamList.findIndex(item => item.team_id === Number(data.teamID))
                  let count = self.data.teamsCache[i].team_info.record_count
                  const obj = `teamsCache[${i}].team_info.record_count`
                  self.setData({[obj]: count - 1})
              }
          },
          success: function(res) {
              res.eventChannel.emit('acceptDataTeamRecordChange', { teamID: teamID })
          }
      })
    },

    goTeamSetEvent: function (e) {
      const index = e.currentTarget.dataset.index
      const { teamList, userID, teamsCache } = this.data
      const teamID = teamList[index].team_id
      const teamName = teamList[index].team_name
      const blnAuth = teamList[index].bln_auth

      if(!teamID){
        return false
      }
      let isCreator = false
      if(userID === teamsCache[index].owner.user_id) {
        isCreator = true
      }

      const self = this
      wx.navigateTo({
        url: `/pages/apply/teams/team-set/team-set?id=${teamID}&title=${encodeURI(teamName)}&isCreator=${isCreator}&blnAuth=${blnAuth}`,
        events: {
          acceptDataTeamSet: function(data) {
              const i = teamList.findIndex(item => item.team_id === Number(data.teamID))

              if (i !== -1) {
                  teamList.splice(i, 1)
                  self.__delete(i)
                  self.setData({teamList})
              }
          }
        },
        success: function(res) {
          res.eventChannel.emit('acceptDataTeamSet', { teamID: teamID })
        }
      })
    },

    /**
    * 触发事件
    * @param e
    */
    teamSwiperChangeEvent: function (e) {
      let index = e.detail.current
      const { teamCurrent, teamList } = this.data

      if (e.detail.source === "touch") {
        if (e.detail.current === 0 && teamCurrent > 1) {
          index = teamCurrent
        }
      }

      let loadIndex = null
      if(index > teamCurrent && index+1 <= teamList.length-1) {
        loadIndex = index+1
      }
      if(index < teamCurrent && index-1 >=0 ) {
        loadIndex = index-1
      }
      if(loadIndex === null) {
        this.setData({ teamCurrent: index })
        return false
      }

      this.data.teamCurrentID = teamList[loadIndex].team_id
      this._getTeamInfo(this.data.teamCurrentID, loadIndex)
          .then(() => {
            this.setData({ teamCurrent: index })
          })
    },

    teamSwiperAnimationfinish(e) {
      const { current } = e.detail
    },

    /**
     *  获取数据
     * */
    __init: function () {
        if (!App.user.ckLogin()) {
            this.setData({ isLogin: false })
            return false
        }

        getTeamList()
          .then((res) => {
              const list = res.data.list
              /**
               *  加载当前加入进入页面  的小组 数据下标
               */
              let index = this._filterTeamCurrent(list, this.optionsId)
              if(index === -1) {
                index = 0
              }
              /**
               *  加载当前页的数据
               */
              this._getTeamInfo(list[index].team_id, index)
              /**
               *  加载下一条数据
               */
              if(index+1 < list.length) {
                this._getTeamInfo(list[index+1].team_id, index+1)
              }
              /**
               *  加载上一条数据
               */
              if(index-1 >= 0) {
                this._getTeamInfo(list[index-1].team_id, index-1)
              }
              /**
               *  初始化下标  和 当前的加载的team_id
               */
              this.data.teamCurrent = index
              this.data.teamCurrentID = list[index].team_id
              this.setData({
                teamCurrent: this.data.teamCurrent,
                teamList: list,
                'nav.title': list.length
              })

          })
    },

    _filterTeamCurrent: function (teamList, id) {
      if(id === null || id === undefined || teamList.length<=0 ) {
        return -1
      }
      return teamList.findIndex(item => Number(item.team_id) === Number(id))
    },

    /**
     * 获取TEAM 信息
     * @param teamID
     * @param index
     * @returns {*}
     * @private
     */
    _getTeamInfo: function (teamID, index) {
        if (this.__has(index)) {
            return Promise.resolve()
        }

        return getTeamInfo({
            team_id: teamID
        })
          .then((res) => {
              this.__add({ index, teamInfo: res.data })
          })
    },
    /**
     * 登录事件
     * @param e
     */
    goLoginEvent(e) {
        $wuLogin().show()
    }

})
