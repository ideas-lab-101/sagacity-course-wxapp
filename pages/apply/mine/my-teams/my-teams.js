const App = getApp()
const { $wuNavigation, $wuToast } = require('../../../../components/wu/index')
const { getTeamList, getTeamInfo } = require('../../../../request/teamPort')

Page({
    data: {
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
      this.setData({userID: App.user.userInfo.UserID})
      /**
       * 初始化数据
       */
      this._initGetTeamData()
    },

    onShow: function () {
      /**
       * * 如果小组内删除了作品操作，反向更新
       **/
      if (App.requestLoadManager.consume('removeTeamRecord') || App.requestLoadManager.consume('setTeamLabel')) {
        if(this.data.teamCurrent === null) {
          return false
        }
        const teamID = this.data.teamList[this.data.teamCurrent].TeamID
        this._getTeamInfo(teamID, this.data.teamCurrent)
      }

      /**
       * * 如果退出小组，反向更新
       **/
      if (App.requestLoadManager.consume('exitTeam')) {
        this._initGetTeamData()
      }
    },

    onReady: function () {
      try {
        var res = wx.getSystemInfoSync()
        var screenHeight = res.windowHeight
      } catch (e) {}
      var query = wx.createSelectorQuery()
      query.select('#wu-navigation').boundingClientRect()
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
      const teamID = this.data.teamList[index].TeamID
      const teamName = this.data.teamList[index].TeamName

      let caption = ''
      if(index%3 === 0) {
        caption = this.data.one.userInfo.Label || this.data.one.userInfo.Caption
      }else if(index%3 === 1) {
        caption = this.data.two.userInfo.Label || this.data.two.userInfo.Caption
      }else if(index%3 === 2) {
        caption = this.data.three.userInfo.Label || this.data.three.userInfo.Caption
      }
      return {
        title: `${caption}创建了（${teamName}）`,
        path: `/pages/apply/teams/user-team/user-team?id=${teamID}&title=${encodeURI(teamName)}`,
        success: (ret) => {}
      }
    },

    // 自定义事件
  /**
   * 链接事件
   * @param e
   */
    goMembersEvent: function (e) {
      const index = e.currentTarget.dataset.index
      const teamID = this.data.teamList[index].TeamID
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
      const teamID = this.data.teamList[index].TeamID
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
      const teamID = this.data.teamList[index].TeamID
      const teamName = this.data.teamList[index].TeamName
      const blnAuth = this.data.teamList[index].blnAuth
      if(!teamID){
        return false
      }
      this._getCurrentInfoAll(teamID) // 设置全局变量  存储当前进入的小组信息
      let isCreator = false
      if(this.data.userID === App.teamActive.userInfo.UserID) {
        isCreator = true
      }
      wx.navigateTo({
        url: `/pages/apply/teams/team-set/team-set?id=${teamID}&title=${encodeURI(teamName)}&isCreator=${isCreator}&blnAuth=${blnAuth}`
      })
    },
    _getCurrentInfoAll: function (teamID) {
      let _ti = null
      let _ui = null
      if(teamID === this.data.one.teamInfo.TeamID) {
        _ti = this.data.one.teamInfo
        _ui = this.data.one.userInfo
      }else if(teamID === this.data.two.teamInfo.TeamID) {
        _ti = this.data.two.teamInfo
        _ui = this.data.two.userInfo
      }else if(teamID === this.data.three.teamInfo.TeamID) {
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

      this.data.teamCurrentID = teamList[loadIndex].TeamID
      this._getTeamInfo(this.data.teamCurrentID, loadIndex).then(() => {
        this.setData({ teamCurrent: index })
      })
    },

    teamSwiperAnimationfinish(e) {
      const { current } = e.detail
      console.log(current)
    },

    /**
     *  获取数据
     * */
    _initGetTeamData: function () {
      getTeamList().then((res) => {
        /**
         *  加载当前加入进入页面  的小组 数据下标
         */
        let index = this._filterTeamCurrent(res.list, this.optionsId)
        if(index === -1) {
          index = 0
        }
        /**
         *  加载当前页的数据
         */
        this._getTeamInfo(res.list[index].TeamID, index)
        /**
         *  加载下一条数据
         */
        if(index+1 < res.list.length) {
          this._getTeamInfo(res.list[index+1].TeamID, index+1)
        }
        /**
         *  加载上一条数据
         */
        if(index-1 >= 0) {
          this._getTeamInfo(res.list[index-1].TeamID, index-1)
        }
        /**
         *  初始化下标  和 当前的加载的teamId
         */
        this.data.teamCurrent = index
        this.data.teamCurrentID = res.list[index].TeamID
        this.setData({
          teamCurrent: this.data.teamCurrent,
          teamList: res.list,
          'nav.title': res.list.length
        })

      })
    },

    _filterTeamCurrent: function (teamList, id) {
      if(id === null || id === 'undefined' || teamList.length<=0) {
        return -1
      }
      return teamList.findIndex(item => {
          return Number(item.TeamID) === Number(id)
      })
    },

    _getTeamInfo: function (teamID, index) {
      return getTeamInfo({teamID: teamID}).then((res) => {
        if(index%3 === 0) {
          setTimeout(() => {
            this.setData({
              'one.members': res.members,
              'one.courseList': res.courseList,
              'one.teamInfo': res.teamInfo,
              'one.userInfo': res.userInfo
            })
          }, 100)
        }else if(index%3 === 1) {
          setTimeout(() => {
            this.setData({
              'two.members': res.members,
              'two.courseList': res.courseList,
              'two.teamInfo': res.teamInfo,
              'two.userInfo': res.userInfo
            })
          }, 100)
        }else if(index%3 === 2) {
          setTimeout(() => {
            this.setData({
              'three.members': res.members,
              'three.courseList': res.courseList,
              'three.teamInfo': res.teamInfo,
              'three.userInfo': res.userInfo
            })
          }, 100)
        }else {
          return null
        }
        return res
      })
    }

})
