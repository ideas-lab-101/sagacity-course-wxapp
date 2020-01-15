import baseBehavior from '../../wu/helpers/baseBehavior'
import mergeOptionsToData from '../../wu/helpers/mergeOptionsToData'
import { $wuBackdrop } from '../../wu/index'
import { GetWXSSCode } from '../../../request/systemPort'

const defaults = {
  coverUrl: '',
  type: '',
  id: ''
}

Component({
    behaviors: [baseBehavior],
    externalClasses: ['wu-class'],
    data: mergeOptionsToData(defaults),
    properties: {},
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
        GetWXSSCode({
          dataID: this.data.id,
          type: this.data.type
        }).then((res) => {
          wx.previewImage({
            current: res.qr_code,
            urls: [res.qr_code]
          })
        })
      }

    }
})