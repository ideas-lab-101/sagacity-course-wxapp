const { $wuBackdrop, $wuNavigation, $wuActionSheet } = require('../../../components/wu/index')
const App = getApp()
const { getCommentList, addComment, delComment } = require('../../../request/commentPort')

Page({
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
        info: {
            lastPage: true,
            pageNumber: 1,
            list: []
        },
        isTaFocused: false,
        isCommentFocus: false,
        taPlaceholder: '留言',
        taContent: '',
        userInfo: {},
        keyboard: 0
    },

    onLoad: function (options) {
        // 加载数据
        this.optionsId = options.id
        this.optionsType = options.type
        console.log(options)

        this.setData({userInfo: App.user.userInfo })
        this._initData(this.optionsId, this.optionsType)
    },

    onShow: function () {
      /**
       * 监听评论的是否添加
       */
      App.commentManager.listen(this.data.info.list, (data)=> {
        //this.data.info.cCount++
        this.setData({'info.list': data})
      })
    },

    onReady: function () {
    },

    onPageScroll: function (e) {
      $wuNavigation().scrollTop(e.scrollTop)
    },

    onReachBottom: function (e) {
      this._reachBottomLoad() // 下拉加载数据
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
     *
     * 内部调用事件
     * ***/
    operationEvent: function (e) {
        const self = this
        const commentID = e.currentTarget.dataset.commentid
        const myself = e.currentTarget.dataset.myself
        if (!myself) {
            return false
        }
        $wuActionSheet().showSheet({
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
    _initData: function (id, type) {
        getCommentList({
                dataID: id,
                type: type,
                page: this.data.info.pageNumber
        }).then((res) => {
            console.log(res)
            this.setData({
                'info.lastPage': res.lastPage,
                'info.pageNumber': res.pageNumber,
                'info.list': this.data.info.list.concat(res.list)
            })
        })
    },
    _reachBottomLoad() {
        if(this.data.info.lastPage || this.isLoading) {
          return false
        }
        this.isLoading = true
        this.data.info.pageNumber++
        this._initData(this.optionsId, this.optionsType)
          .then(() => {
            this.isLoading = false
          })
          .catch(() => {
            this.isLoading = false
            this.data.info.pageNumber--
          })
      }

})