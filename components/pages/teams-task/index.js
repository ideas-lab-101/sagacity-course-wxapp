import { getTeamList, addTeamRecord, getTeamTask } from '../../../request/teamPort'
import { $wuBackdrop } from '../../wu/index'
const computedBehavior = require('miniprogram-computed')
import baseBehavior from '../../wu/helpers/baseBehavior'
const Toast = require('../../../viewMethod/toast')
const Dialog = require('../../../viewMethod/dialog')

const defaults = {
  taskList: [],
  current: 0,
  teamCurrent: null,
  isTaskCurrent: false
}

Component({
    behaviors: [baseBehavior, computedBehavior],
    properties: {},
    options: {
      styleIsolation: 'apply-shared'
    },
    data: defaults,
    computed: {
    },
    lifetimes: {
      created() {
        this.$wuBackdrop = $wuBackdrop('#wu-backdrop', this)
      },
      attached() {
      },
      ready() {
      }
    },
    pageLifetimes: {
      show: function () {},
      hide: function () { },
      resize: function () { },
    },
    methods: {
      /**
       * 展示
       * @param opts
       */
        show(opts = {}) {

          this._getTeamList(opts.recordID)
              .then(() => {
                  const options = this.$$mergeOptionsAndBindMethods(Object.assign({}, defaults, opts))
                  this.$$setData({ teamsIn: true, ...options })
                  this.$wuBackdrop.retain()
              })

        },
      /**
       * 关闭层
       */
        hide() {
          this.$$setData({ teamsIn: false})
          this.$wuBackdrop.release()
        },

        taskChange(e) {
          if(e.type === 'change') {
            this.setData({ current: e.detail.current})
          }
        },
        /**
        * 内部方法
        **/
        transitionendEvent(e) {
            this.data.transitionend = true
        },
      /**
       * 请求小组列表
       * @param recordID
       * @returns {*}
       * @private
       */
      _getTeamList: function (recordID) {
        return getTeamList({
              record_id: recordID
            })
            .then((res) => {
                this.setData({
                    teamsList: res.data.list
                })
            })
      },
      /**
       * 获取小组 下的  已确认任务列表
       * @param teamID
       * @private
       */
      _getTeamTask: function (teamID) {

        getTeamTask({
          team_id: teamID,
          state: 1
        })
            .then(res => {
                  res.data.list.map(item => item.valid_time = this._timeToDay(item.valid_time))
                  this.setData({ taskList: res.data.list})
                  return res
            })
            .then( res => {

              this.setData({ isTaskCurrent: true})
              wx.nextTick(() => {
                this.setData({ current: 1 })
              })
            })
      },
      /**
       * 加入到小组 或者 小组任务
       * @param e
       */
      joinTeamEvent: function (e) {
        const { id, index, name} = e.currentTarget.dataset
        const blnAuth = Number(e.currentTarget.dataset.auth)

        this.setData({ teamCurrent: index})
        if (blnAuth === 1) {
          this._getTeamTask(id)
          return false
        }

        this.setData({ isTaskCurrent: false})

        Dialog.confirm({
          title: '加入提示',
          content: `是否把作品提交到${name}?`,
          onConfirm: () => {
            this._join(id, 0)
          }
        })
      },
      /**
       * 加入到任务
       * @param e
       */
      joinTaskEvent(e) {
        const { teamCurrent, teamsList } = this.data
        const { id, time, name} = e.currentTarget.dataset

        if(time === '已截止') {
          Toast.text({ text: `作业已截止，不能提交了!` })
          return false
        }
        Dialog.confirm({
          title: '加入提示',
          content: `确认是否提交?`,
          onConfirm: () => {
            this._join(teamsList[teamCurrent].team_id, id)
          }
        })
      },

      _join(teamID, taskID) {
        addTeamRecord({
          team_id: teamID,
          record_id: this.data.recordID,
          task_id: taskID
        })
            .then((res) => {

              Toast.text({ text:  res.msg })
              this.hide()
            })
            .catch((ret) => {
              if(ret.code === 2) {
                Toast.text({ text:  ret.msg })
              }
            })
      },
      /**
       * 工具  判断剩余多少天
       * @param time
       * @private
       */
      _timeToDay(time) {
        if(!time) {
          return ''
        }
        const exp = new RegExp('-', 'g')
        const tempTime = time.replace(exp, '/')

        const now = new Date()
        const d = new Date(tempTime)
        const restSec = d.getTime() - now.getTime()

        const day = parseInt(restSec / (60*60*24*1000))
        const hour = parseInt(restSec / (60*60*1000)%24)
        const minute = parseInt(restSec / (60*1000)%60)

        if(day > 0) {
          return `${day}天后截止`
        }else if(day === 0) {
          if(hour > 0) {
            return `${hour}小时后截止`
          }else if (hour === 0 && minute > 0) {
            return `${minute}分钟后截止`
          }else {
            return `已截止`
          }
        }else {
          return `已截止`
        }
      }

    }

})
