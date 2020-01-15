
import { isPresetColor } from '../utils/colors'

let Dialog = {
  /**
   * 带 ‘确定’ 和 ‘取消’ 按钮，右上角显示关闭图标
   * @param dialogTitle
   * @param dialogContent
   * @param onConfirmFunction
   */
  confirm: function (options = {}) {
    wx.showModal({
      title: options.title || '',
      content: options.content,
      confirmColor: isPresetColor('calm'),
      confirmText: options.confirmText || '确定',
      success: res => {
        if (res.confirm) {
          typeof options.onConfirm === 'function' && options.onConfirm()
        } else if (res.cancel) {
          typeof options.onCancel === 'function' && options.onCancel()
        }
      }
    })
  },

  /**
   * 只带一个 ‘确定’ 按钮（警告型）
   * @param dialogTitle
   * @param dialogContent
   * @param onAlertFunction
   */
  alert: function (options = {}) {
    wx.showModal({
      title: options.title || '',
      content: options.content,
      showCancel: false,
      confirmColor: isPresetColor('calm'),
      confirmText: options.confirmText || '确定',
      success: res => {
        if (res.confirm) {
          typeof options.onConfirm === 'function' && options.onConfirm()
        }
      }
    })

  }
};

module.exports = Dialog;
