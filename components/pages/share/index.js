import baseBehavior from '../../wu/helpers/baseBehavior'
import mergeOptionsToData from '../../wu/helpers/mergeOptionsToData'
import { $wuBackdrop } from '../../wu/index'
import { getWxaCode } from '../../../request/systemPort'
const App = getApp()

const defaults = {
  coverUrl: '',
  type: '',
  id: '',
  name: '',
  desc: '',
  posterConfig: null
}

Component({
    behaviors: [baseBehavior],
    externalClasses: ['wu-class'],
    data: mergeOptionsToData(defaults),
    properties: {

    },
    created() {
      this.$wuBackdrop = $wuBackdrop('#wu-backdrop', this)
    },
    attached() {},
    methods: {
      /**
       * 组件打开
       */
      show(opts = {}) {
        const options = this.$$mergeOptionsAndBindMethods(Object.assign({}, defaults, opts))
        this.$$setData({ in: true, ...options })
        this.$wuBackdrop.retain()
      },

      _closeShareLayerEvent() {
        this.$$setData({ in: false })
        this.$wuBackdrop.release()
      },

      _getShareCodeEvent() {
        const { coverUrl, name, desc, id, type } = this.data

        getWxaCode({
          dataId: id,
          type: type
        })
            .then((res) => {
              wx.navigateTo({
                  url: `/pages/apply/course/qrcode/qrcode?url=${coverUrl}&name=${encodeURIComponent(name)}&desc=${encodeURIComponent(desc)}&qrcode=${res.data.qr_code}`
              })
            })
      },

    }
})