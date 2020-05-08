const App = getApp()
const { $wuNavigation } = require('../../../../components/wu/index')
import {getTeamMember} from '../../../../request/teamPort'
const PageReachBottomBehavior = require('../../../../utils/behaviors/PageReachBottomBehavior')

Page({
    behaviors: [PageReachBottomBehavior],
    data: {
      nav: {
        title: '小组成员',
        model: 'extrude',
        transparent: false,
        animation: {
          duration: 1000,
          timingFunction: "linear"
        }
      },
      content: {
          pageSize: 20
      }
    },

    onLoad: function (options) {
      this.optionsId = options.id
      this.__init()
    },

    onPageScroll: function (e) {
      $wuNavigation().scrollTop(e.scrollTop)
    },
    onReachBottom: function () {
        this.__ReachBottom()
    },
    // 自定义事件
  /**
   * 链接成员作品
   * @param e
   */
  goTeamRecordEvent: function (e) {
    const index = e.currentTarget.dataset.index
    const { list } = this.data.content
    const UserID = list[index].user_id
    const UserName = list[index].label || list[index].caption

    wx.navigateTo({
      url: `/pages/apply/teams/team-records/team-records?id=${this.optionsId}&title=${encodeURI(UserName)}&userid=${UserID}`
    })
  },
  /**
   * 数据请求
   * @private
   */
   __init: function () {
      this.__getTurnPageDataList({
          isPageShow: true,
          interfaceFn: getTeamMember,
          params: {
              team_id: this.optionsId
          }
      })
    }
})
