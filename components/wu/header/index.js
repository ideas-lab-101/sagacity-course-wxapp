
const defaults = {
  wrapStyle: '',
  wrapText: ''
}

Component({
  /**
   * 组件的初始数据
   */
  data: defaults,
  properties: {
    src: {
      type: String,
      value: ''
    },
    text: {
      type: String,
      value: '名字',
      observer: function(newVal, oldVal, changedPath) {
        this.__getText(newVal)
      }
    },
    size: {
      type: Number,
      value: 80,
      observer: function(newVal, oldVal, changedPath) {
        this.__setStyle(newVal)
      }
    },
    hidden: {
      type: Boolean,
      value: false
    },
    clip: {
      type: Boolean,
      value: true
    }
  },
  lifetimes: {
    created: function () {
    },

    attached: function () {
      this.__setStyle()
    },

    detached: function(){
    }
  },
  methods: {

    __setStyle (val) {
      const { size } = this.data
      if(!val) {
        val = size
      }

      this.setData({
       wrapStyle: `width: ${val}rpx; height: ${val}rpx;`
      })
    },

    __getText(val) {
      if(val.toString().length > 2) {
        val = val.slice(-2)
      }
      this.setData({
        wrapText: val
      })
    },

    __imageError() {
      this.setData({
        src: ''
      })
    }
  }
})
