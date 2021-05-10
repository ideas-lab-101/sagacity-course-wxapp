const App = getApp()
import { getTeamList, getTeamInfo } from '../../../request/teamPort'
const TeamCacheBehavior = require('./TeamCacheBehavior')
const AppLoginBehavior = require('../../../utils/behaviors/AppLoginBehavior')

Page({
  behaviors: [TeamCacheBehavior, AppLoginBehavior],
  data: {
    statusBarHeight: App.globalData.equipment.statusBarHeight,
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
    userID: null
  },

  onLoad: function (options) {
    if (App.user.ckLogin()) {
      this.optionsId = options.id
      this.setData({ userID: App.user.userInfo.user_id, isLogin: true })
      /**
       * 初始化数据
       */
      this.__init()
    } else {
      this.setData({ isLogin: false })
    }

    this.PageOnLoad = true
  },

  onShow: function () {
    /**
     * * 更新如果想小组添加了作品
     **/
    if (!this.PageOnLoad && (App.requestManager.update('addTeamRecord', this.route))) {
      this.__clear()
      this.__init()
    }
  },
  onHide: function () {
    this.PageOnLoad = false
  },

  onUnload: function () {
    this.PageOnLoad = false
  },
  onShareAppMessage: function (res) {
    const index = this.data.teamCurrent
    const { teamsCache, teamList } = this.data
    const teamID = teamList[index].team_id
    const teamName = teamList[index].team_name
    const caption = teamsCache[index].owner.label || teamsCache[index].owner.caption

    return {
      title: `${caption}创建了（${teamName}）`,
      path: `/pages/apply/teams/user-team/user-team?id=${teamID}&title=${encodeURI(teamName)}`,
      success: (ret) => { }
    }
  },
  /**
   * 链接事件
   * @param e
   */
  goMembersEvent: function (e) {
    const index = e.currentTarget.dataset.index
    const teamID = this.data.teamList[index].team_id
    if (!teamID) {
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
    if (!teamID) {
      return false
    }
    const self = this
    wx.navigateTo({
      url: `/pages/apply/teams/team-records/team-records?id=${teamID}&creatorID=${teamsCache[index].owner.user_id}`,
      events: {
        acceptDataTeamRecordChange: function (data) {
          const i = teamList.findIndex(item => item.team_id === Number(data.teamID))
          let count = self.data.teamsCache[i].team_info.record_count
          const obj = `teamsCache[${i}].team_info.record_count`
          self.setData({ [obj]: count - 1 })
        }
      },
      success: function (res) {
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

    if (!teamID) {
      return false
    }
    let isCreator = false
    if (userID === teamsCache[index].owner.user_id) {
      isCreator = true
    }

    const self = this
    wx.navigateTo({
      url: `/pages/apply/teams/team-set/team-set?id=${teamID}&title=${encodeURI(teamName)}&isCreator=${isCreator}&blnAuth=${blnAuth}`,
      events: {
        acceptDataTeamSet: function (data) {
          const i = teamList.findIndex(item => item.team_id === Number(data.teamID))

          if (i !== -1) {
            teamList.splice(i, 1)
            self.__delete(i)
            self.setData({ teamList })
          }
        }
      },
      success: function (res) {
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
    if (index > teamCurrent && index + 1 <= teamList.length - 1) {
      loadIndex = index + 1
    }
    if (index < teamCurrent && index - 1 >= 0) {
      loadIndex = index - 1
    }
    if (loadIndex === null) {
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
        if (!list.length) {
          return false
        }
        /**
         *  加载当前加入进入页面  的小组 数据下标
         */
        let index = this._filterTeamCurrent(list, this.optionsId)
        if (index === -1) {
          index = 0
        }
        /**
         *  加载当前页的数据
         */
        this._getTeamInfo(list[index].team_id, index)
        /**
         *  加载下一条数据
         */
        if (index + 1 < list.length) {
          this._getTeamInfo(list[index + 1].team_id, index + 1)
        }
        /**
         *  加载上一条数据
         */
        if (index - 1 >= 0) {
          this._getTeamInfo(list[index - 1].team_id, index - 1)
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
    if (id === null || id === undefined || teamList.length <= 0) {
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
      teamId: teamID
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
    if (!this.__validateLoginEvent(this.__init)) {
      return false
    }
  }

})
