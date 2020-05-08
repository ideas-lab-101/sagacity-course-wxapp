const App = getApp()
import { addComment } from '../../../request/commentPort'
const Toast = require('../../../viewMethod/toast')

Page({
    data: {
      nav: {
        title: "写评论",
        model: 'extrude',
        transparent: false,
        animation: {
          duration: 500,
          timingFunction: "linear"
        }
      },
      userID: '',
      /**
       * 写评论
       */
      text: {
        focus: false,
        canSubmit: false,
        content: '',
        placeholder: '说说我的看法'
      }
    },

    onLoad: function (options) {
      this.optionsId = options.id
      this.optionsType = options.type
      this.optionsReferID = options.referid

      if(options.caption !== 'undefined') {
        this.setData({'text.placeholder': `@${options.caption}`})
      }
      this.data.userID = App.user.userInfo? App.user.userInfo.user_id : ''

      this.eventChannel = this.getOpenerEventChannel()
    },
    onReady: function() {
      setTimeout(() => {
        this.setData({'text.focus': true})
      }, 10)
    },
  /**
   * 书写评论
   **/
  textInputEvent(e) {
    const val = e.detail.value
    let canSubmit = false
    if(val.trim()) {
      canSubmit = true
    }
    this.setData({'text.canSubmit': canSubmit})
  },

  submitCommentEvent(e) {
    const content = e.detail.value.content.trim()
    if(!content) {
      return false
    }

    this._addComment(content)
      .then(res => {
          this.eventChannel.emit('acceptDataCommentReplay', {dataID: this.optionsId, referID: this.optionsReferID, data: res.data.data});
          const BackFn = setTimeout(() => {
            clearTimeout(BackFn)
            wx.navigateBack({ delta: 1 })
          }, 500)

      })
  },

  /**
     *
     * 获取数据
     * ***/
  _addComment(content) {
    return addComment({
      refer_id: this.optionsReferID !== 'root'? this.optionsReferID:'',
      data_id: this.optionsId,
      type: this.optionsType,
      content: content
    })
        .then( res => {
          this.setData({'text.content': ''})
          return res
        })
  }
})