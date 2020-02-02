const App = getApp()
import { getCommentList, addComment, delComment } from '../../../request/commentPort'
import { $wuNavigation } from '../../../components/wu/index'
import { $wuxActionSheet } from 'wux-weapp/index'
const PageReachBottomBehavior = require('../../../utils/behaviors/PageReachBottomBehavior')

Page({
    behaviors: [PageReachBottomBehavior],
    data: {
        nav: {
            title: "留言",
            model: 'extrude',
            transparent: false,
            animation: {
              duration: 500,
              timingFunction: "linear"
            }
        },
        isTaFocused: false,
        isCommentFocus: false,
        taPlaceholder: '留言',
        taContent: '',
        userInfo: {},
        keyboard: 0
    },

    onLoad: function (options) {
        this.optionsId = options.id
        this.optionsType = options.type
        this.setData({userInfo: App.user.userInfo })

        this.__init()
    },

    onPageScroll: function (e) {
      $wuNavigation().scrollTop(e.scrollTop)
    },

    onReachBottom: function (e) {
        this.__ReachBottom()
    },
      /**
       * 链接
       */
     goReplay(referID, caption) {
        wx.navigateTo({
          url: `/pages/common/comment-replay/comment-replay?id=${this.optionsId}&referid=${referID}&type=${this.optionsType}&caption=${caption}`
        })
    },
    /**
     * 内部调用事件
     * @param e
     * @returns {boolean}
     */
    operationEvent: function (e) {
        const self = this
        const commentID = e.currentTarget.dataset.commentid
        const myself = e.currentTarget.dataset.myself
        if (!myself) {
            return false
        }
        $wuxActionSheet().showSheet({
            titleText: '操作确认？',
            cancelText: '取消',
            cancel() {},
            destructiveText: '撤销我的留言',
            destructiveButtonClicked() {
                return !!self._delComment(commentID)
                  .then(() => {
                    self._deleteData(commentID) // 删除数据
                  })
            },
        })
    },
  /**
   * 总评论
   */
    commentFocusEvent: function () {
        this.referID = 'root'
        this.goReplay(this.referID)
    },
  /**
   * 点击回复TA
   * @param e
   */
    commentSingleFocusEvent: function (e) {
        this.referID = e.currentTarget.dataset.commentid
        const caption = e.currentTarget.dataset.name
        this.goReplay(this.referID, caption)
    },

    /**
     *
     * 内部 处理事件
     * ***/
    _delComment(commentID) {
      return delComment({commentID: commentID}).then((res) => {})
    },
    _deleteData: function (CommentID) {
        const exactIndex = {
            listIndex: null,
            childIndex: null
        }
        this.data.info.list.forEach((item, index) => {
            if (Number(item.CommentID) === Number(CommentID)) {
                exactIndex.listIndex = index
                return false
            }
            const  childIndex = item.child.findIndex((c) => {
                return Number(c.CommentID) === Number(CommentID)
            })
            if (childIndex !== -1) {
                exactIndex.listIndex = index
                exactIndex.childIndex = childIndex
                return false
            }
        })
        if (exactIndex.listIndex === null) {
            console.error('在数据列表中未找到要删除的数据ID')
            return false
        }

        let h = [].concat(this.data.info.list)
        if (!exactIndex.childIndex) {
            h.splice(exactIndex.listIndex, 1)
        }else {
            h[exactIndex.listIndex].child.splice(exactIndex.childIndex, 1)
        }
        this.setData({ 'info.list': h })
    },
    /**
     *
     * 内部数据获取事件
     * ***/
    __init: function () {
        this.__getTurnPageDataList({
            isPageShow: true,
            interfaceFn: getCommentList,
            params: {
                data_id: this.optionsId,
                type: this.optionsType
            }
        })
    }
})