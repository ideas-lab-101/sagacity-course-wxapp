import baseBehavior from '../../wu/helpers/baseBehavior'
import { $wuBackdrop } from '../../../components/wu/index'
const App = getApp()
const { checkIOS } = require('../../../utils/equipment')
const { isTabPage } = require('../../../utils/util')

const defaults = {
  title: '数据加载中',
  mask: false,
  transitionName: 'wux-animate--fadeInRight'
}

Component({
  data: defaults,
  behaviors: [baseBehavior],
  properties: {},
  lifetimes: {
    created: function () {
      this.$wuBackdrop = $wuBackdrop('#wu-backdrop', this)
    },
    attached: function () {
      this.page = getCurrentPages()[getCurrentPages().length - 1]
    },
    detached: function(){
    }
  },
  methods: {
    /**
     * 显示
     * @param options
     */
    show (opts = {}) {
      if(isTabPage(this.page.route)) {
        this.__hideTabBar(opts, this.__checkSystemEnter.bind(this))
        return false
      }
      this.__checkSystemEnter(opts)
    },

    __enter(opts) {
      const options = this.$$mergeOptionsAndBindMethods(Object.assign({}, this.data, opts))
      this.setData({ ...options, in: true })
      this.$wuBackdrop.retain()
    },

    /**
     * 判断是否是IOS
     * @param opts
     * @returns {boolean}
     * @private
     */
    __checkSystemEnter(opts) {
      if(checkIOS()) {
        this.__enter(opts)
        return false
      }

      const EnterFn = setTimeout(() => {

        this.__enter(opts)
        clearTimeout(EnterFn)

      }, 300)
    },

    __hideTabBar(opts, backFn) {
      wx.hideTabBar({
        animation: true,
        success: () => {
          typeof backFn === "function" && backFn(opts)
        }
      })
    },
    /**
     * 关闭
     * @returns {boolean}
     */
    hide(){
      this.setData({ in: false })
      this.$wuBackdrop.release()

      if(isTabPage(this.page.route)) {
        wx.showTabBar({
          animation: true
        })
      }
    },

    onCancel() {
    },

    /**
     * 微信授权
     * @param e
     */
    getUserInfo(e) {
      if (e.detail.errMsg === "getUserInfo:ok") {
        const userInfoInheritFn = this.fns.userInfoInheritFn

        App.user.goLogin({...e.detail.userInfo})
                  .then(res => {

                      if (userInfoInheritFn && typeof userInfoInheritFn === 'function') {
                        userInfoInheritFn()
                      }
                  })
      }
    },

    /**
     * 电话授权
     * @param e
     */
    getUserPhone(e) {
      if (e.detail.errMsg === "getPhoneNumber:ok") {

        wx.checkSession({
          success: () => {

            this.fetchPhone({
              encryptedData: e.detail.encryptedData,
              iv: e.detail.iv
            })
          },
          fail: () => {
            // 重新执行登录
            App.user.goLogin({
              encryptedData: e.detail.encryptedData,
              iv: e.detail.iv
            })
                .then(token => {
                  
                  this.fetchPhone({
                    encryptedData: e.detail.encryptedData,
                    iv: e.detail.iv
                  })
                })
          }
        })

        
      }
    },

    fetchPhone(options) {
      App.user.getPhoneNumber({...options})
          .then(token => {

              const userPhoneInheritFn = this.fns.userPhoneInheritFn
              if (userPhoneInheritFn && typeof userPhoneInheritFn === 'function') {
                userPhoneInheritFn()
              }
              this.hide()
          })
    }
  }
})
