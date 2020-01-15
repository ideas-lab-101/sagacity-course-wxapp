
const Toast = {
    /**
     * 带 “成功” 图标
     * @param text
     * @param successFunction
     * @constructor
     */
    success: function (options = {}) {
      wx.showToast({
        title: options.text,
        icon: 'success',
        duration: 1000,
        success: typeof options.success === 'function' && options.success()
      })
    },

    /**
     * 带 “失败” 图标
     * @param text
     * @param successFunction
     * @constructor
     */
    fail: function (options = {}) {
      wx.showToast({
        title: options.text,
        image: '',
        icon: 'none',
        duration: 1000,
        success: typeof options.success === 'function' && options.success()
      })
    },

    /**
     * 带 “禁止” 图标
     * @param text
     * @param forbiddenFunction
     * @constructor
     */
    forbidden: function (options = {}) {
      $wuxToast(options.id || '#wux-toast', options.page || this.page()).show({
        type: 'forbidden',
        duration: 1000,
        color: '#fff',
        text: options.text,
        success: typeof options.success === 'function' && options.success()
      })
    },

    /**
     * 带 “自定义” 图标
     * @param text
     * @param defaultFunction
     * @constructor
     */
    text: function (options = {}) {
        wx.showToast({
          title: options.text,
          icon: 'none',
          duration: options.duration || 2000,
          success: typeof options.success === 'function' && options.success()
        })
    }

}

module.exports = Toast;
