import baseBehavior from '../helpers/baseBehavior'

const defaults = {
  title: '数据加载中',
  mask: false
}

Component({
  /**
   * 组件的初始数据
   */
  data: defaults,
  behaviors: [baseBehavior],
  properties: {
    src: {
      type: String,
      value: ''
    }
  },
  lifetimes: {
    created: function () {
    },

    attached: function () {
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
      const options = this.$$mergeOptionsAndBindMethods(Object.assign({}, this.data, opts))
      this.setData({ ...options, in: true })
    },
    /**
     * 关闭
     * @returns {boolean}
     */
    hide(){
      this.setData({ in: false })
    }
  }
})
