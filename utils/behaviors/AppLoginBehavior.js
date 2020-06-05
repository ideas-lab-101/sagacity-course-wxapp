import { $wuLogin } from '../../components/pages/index'
const App = getApp()

module.exports = Behavior({
  methods: {

    __validateLoginEvent(backFn) {
      if (!App.user.ckLogin()) {
          $wuLogin().show({
              userPhoneInheritFn: () => {

                if (backFn && typeof backFn === 'function') {
                  backFn()
                }

              }
          })
          return false
      }
      return true
    }

  }
})