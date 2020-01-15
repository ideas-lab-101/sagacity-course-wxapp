const App = getApp()
const { $wuNavigation, $wuToast, $wuBackdrop } = require('../../../../components/wu/index')
const { getTeamMember } = require('../../../request/teamPort')

Page({
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

      member: {
        list: [],
        lastPage: true,
        pageNumber: 1,
        totalRow: 0
      }
    },

    onLoad: function (options) {
      this.optionsId = options.id
      this._getTeamMember()
    },

    onShow: function () {
    },

    onPageScroll: function (e) {
      $wuNavigation().scrollTop(e.scrollTop)
    },
    onReachBottom: function () {
      if (this.data.member.lastPage || this.isLoading) {
        return false
      }
      this.data.member.pageNumber++
      this._getTeamMember()
    },
    // 自定义事件
  /**
   * 链接成员作品
   * @param e
   */
  goTeamRecordEvent: function (e) {
    const index = e.currentTarget.dataset.index
    const UserID = this.data.member.list[index].UserID
    const UserName = this.data.member.list[index].Label || this.data.member.list[index].Caption
    wx.navigateTo({
      url: `/pages/apply/teams/team-records/team-records?id=${this.optionsId}&title=${encodeURI(UserName)}&userid=${UserID}`
    })
  },
  /**
   * 数据请求
   * @private
   */
   _getTeamMember: function () {
      this.isLoading = true
      getTeamMember({teamID: this.optionsId, page: this.data.member.pageNumber, pageSize: 20}).then(res => {
        console.log(res)
        this.isLoading = false
        this.setData({
          'member.list': this.data.member.list.concat(res.list),
          'member.lastPage': res.lastPage,
          'member.totalRow': res.totalRow
        })
      })
    }

})
