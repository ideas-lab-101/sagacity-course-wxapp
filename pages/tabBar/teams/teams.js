const App = getApp()
import { getTeamList, getTeamInfo } from '../../../request/teamPort'

Page({
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
      /**
       * 存储的数据参数
       */
      teamList: [],

      one: {
        members: [],
        courseList: [],
        teamInfo: '',
        userInfo: ''
      },
      two: {
        members: [],
        courseList: [],
        teamInfo: '',
        userInfo: ''
      },
      three: {
        members: [],
        courseList: [],
        teamInfo: '',
        userInfo: ''
      },

      /**
       * 选定的小组
       */
      teamCurrent: null,   // swiper 改变的时候 当前的下标
      teamCurrentID: null,  // 当前加载的teamID  并一定指当前选中的TEAM  的ID
      userID: '',
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
      /**
       * * 如果小组内删除了作品操作，反向更新
       **/
      /*if (App.requestLoadManager.consume('removeTeamRecord') || App.requestLoadManager.consume('setTeamLabel')) {
        if(this.data.teamCurrent === null) {
          return false
        }
        const teamID = this.data.teamList[this.data.teamCurrent].TeamID
        this._getTeamInfo(teamID, this.data.teamCurrent)
      }*/

      /**
       * * 如果退出小组，反向更新
       **/
      /*if (App.requestLoadManager.consume('exitTeam')) {
        this.__init()
      }*/
    },

    onReady: function () {
      try {
        var res = wx.getSystemInfoSync()
        var screenHeight = res.windowHeight
      } catch (e) {}
      var query = wx.createSelectorQuery()
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
      this._getCurrentInfoAll(teamID) // 设置全局变量  存储当前进入的小组信息
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
      const teamID = this.data.teamList[index].team_id
      if(!teamID){
        return false
      }
      this._getCurrentInfoAll(teamID) // 设置全局变量  存储当前进入的小组信息
      wx.navigateTo({
        url: `/pages/apply/teams/team-records/team-records?id=${teamID}`
      })
    },

    goTeamSetEvent: function (e) {
      const index = e.currentTarget.dataset.index
      const { teamList, userID } = this.data
      const teamID = teamList[index].team_id
      const teamName = teamList[index].team_name
      const blnAuth = teamList[index].bln_auth

      if(!teamID){
        return false
      }
      this._getCurrentInfoAll(teamID) // 设置全局变量  存储当前进入的小组信息
      let isCreator = false
      if(userID === App.teamActive.userInfo.user_id) {
        isCreator = true
      }

      const self = this
      wx.navigateTo({
        url: `/pages/apply/teams/team-set/team-set?id=${teamID}&title=${encodeURI(teamName)}&isCreator=${isCreator}&blnAuth=${blnAuth}`,
        events: {
          acceptDataTeamSet: function(data) {
              const i = teamList.findIndex(item => item.team_id === Number(data.teamID))
              if (i !== -1) {
                  teamList.splice(index, 1)
                  self.setData({teamList})
              }
          }
        },
        success: function(res) {
          res.eventChannel.emit('acceptDataTeamSet', { teamID: teamID })
        }
      })
    },

    _getCurrentInfoAll: function (teamID) {
      let _ti = null
      let _ui = null
      if(teamID === this.data.one.teamInfo.team_id) {
        _ti = this.data.one.teamInfo
        _ui = this.data.one.userInfo
      }else if(teamID === this.data.two.teamInfo.team_id) {
        _ti = this.data.two.teamInfo
        _ui = this.data.two.userInfo
      }else if(teamID === this.data.three.teamInfo.team_id) {
        _ti = this.data.three.teamInfo
        _ui = this.data.three.userInfo
      }
      App.teamActive = {
        teamInfo: _ti,
        userInfo: _ui
      }
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
      if(id === null || id === 'undefined' || teamList.length<=0 ) {
        return -1
      }
      return teamList.findIndex(item => {
          return Number(item.team_id) === Number(id)
      })
    },

    _getTeamInfo: function (teamID, index) {
      return getTeamInfo({
        team_id: teamID
      })
          .then((res) => {
            if(index%3 === 0) {
              setTimeout(() => {
                this.setData({
                  'one.members': res.data.members,
                  'one.courseList': res.data.courses,
                  'one.teamInfo': res.data.team_info,
                  'one.userInfo': res.data.owner
                })
              }, 100)
            }else if(index%3 === 1) {
              setTimeout(() => {
                this.setData({
                  'two.members': res.data.members,
                  'two.courseList': res.data.courses,
                  'two.teamInfo': res.data.team_info,
                  'two.userInfo': res.data.owner
                })
              }, 100)
            }else if(index%3 === 2) {
              setTimeout(() => {
                this.setData({
                  'three.members': res.data.members,
                  'three.courseList': res.data.courses,
                  'three.teamInfo': res.data.team_info,
                  'three.userInfo': res.data.owner
                })
              }, 100)
            }else {
              return null
            }
            return res
          })
    }

})
