const App = getApp()
import { $wuPlayWidget, $wuNavigation, $wuBackdrop } from '../../../../components/wu/index'
import { $share } from '../../../../components/pages/index'
import { getCourseInfo, getLessonList, getCourseContent } from '../../../../request/coursePort'
import { userEnroll, userFavor, addUserPoint } from '../../../../request/userPort'
const WxParse = require('../../../../components/wxParse/wxParse')
const PageReachBottomBehavior = require('../../../../utils/behaviors/PageReachBottomBehavior')
const Toast = require('../../../../viewMethod/toast')
const Dialog = require('../../../../viewMethod/dialog')

Page({
    behaviors: [PageReachBottomBehavior],
    data: {
        nav: {
            title: "",
            model: 'fold',
            transparent: true,
            animation: {
                duration: 1000,
                timingFunction: "linear"
            }
        },
        info: null,

        payBtnTxt: '加入',
        detailLinkText: [{
          name: 'span',
          attrs: {
            style: 'color: block !important; word-break:break-all;'
          },
          children: [{
            type: 'text',
            text: '&nbsp;&nbsp;>>详细介绍'
          }]
        }]
    },

    onLoad: function (options) {
        this.optionsId = options.id
        /**
         * 扫描进入页面
         **/
        if(options.scene) {
          this.optionsId = options.scene
        }
        this.isLoadPass = true

        this.__init()
    },

    onShow: function () {
        //$wuPlayWidget().show(App.globalData.audio.getPlayer())

        if(App.accreditLogin) { // 重新加载数据
            App.accreditLogin = false
            this.initLessonData()
        }

        if (!this.isLoadPass) {
            if (!this.data.info.is_enroll && App.enroll.has(this.data.info.course_info.CourseID) && App.user.ckLogin()){
                this.setData({ 'info.is_enroll': true })
            }
        }
    },

    onHide: function() {
       // $wuPlayWidget().detached()
        this.isLoadPass = false
    },

    onReachBottom: function () {
      this.__ReachBottom()
    },
    onShareAppMessage: function () {
        return {
            imageUrl: `${this.data.info.course_info.cover_url}?imageView2/5/h/300`,
            title: this.data.info.course_info.course_name,
            path: `/pages/apply/course/lesson-page/lesson-page?id=${this.optionsId}`,
            success: (ret) => {
                addUserPoint({ pointCode: '001'})
            }
        }
    },
    onPageScroll: function (e) {
        $wuNavigation().scrollTop(e.scrollTop)
        /**
       * 顶部图片滚动消失
       * */
        if(e.scrollTop > 80 && !this.coverMove) {
          this.coverMove = true
          this.coverMoving = true

          clearTimeout(this.coverFn)
          this.coverFn = setTimeout(() => {
            this.setData({coverShow: true})
          }, 50)
        }else if(e.scrollTop < 80 && this.coverMove) {
          this.coverMove = false
          this.coverMoving = true

          clearTimeout(this.coverFn)
          this.coverFn = setTimeout(() => {
            this.setData({coverShow: false})
          }, 50)
        }
    },

    __init() {
        this.initLessonData() // 初始化数据

        this.__getTurnPageDataList({
            isPageShow: true,
            interfaceFn: getLessonList,
            params: {
                course_id: this.optionsId
               }
            })
    },
    /**
    * 加载数据事件
    * */
    initLessonData() {

      getCourseInfo({
          course_id: this.optionsId
      })
          .then((res) => {
            this.setData({
              info: res.data
            })

              /**
               * 存储已经被加入的课程
               */
            /*if (res.data.is_enroll) {
              App.enroll.add(this.optionsId)
            }*/
          })
    },
    /**
   * 滚动条滚动 动画结束事件
   * */
    coverShowEndEvent(e) {
      this.coverMoving = false
    },

    /**
     * 内部触发事件
     * */
    userShareEvent(e) { // 分享事件
      $share().show({
          coverUrl: this.data.info.course_info.cover_url,
          type: 'c',
          id: this.data.info.course_info.course_id
      })
    },

    /**
     * 查看详情
     * @param e
     */
    getCourseDetailEvent(e) {

      getCourseContent({
          course_id: this.data.info.course_info.course_id
      })
          .then((res) => {
            this.openParseEvent()
            // 文稿编译
            WxParse.wxParse('detail', 'html', res.data.data || '<p style="font-size: 14px;">暂无介绍</p>', this, 5)
          })
    },

    closeParseEvent: function () { // 关闭课程详情层
      this.setData({ parseIn: false })
      $wuBackdrop("#wu-backdrop-parse", this).release()
    },

    openParseEvent: function () { // 打开课程详情层
      this.setData({ parseIn: true })
      $wuBackdrop("#wu-backdrop-parse", this).retain()
    },

    subscribeEvent: function (e) { // 加入事件
        if (!App.user.ckLogin()) {
            wx.navigateTo({
                url: '/pages/common/accredit/accredit'
            })
        }else {
            $wuBackdrop().retain()
            this.setData({ in: true })
        }
    },

    /**
     * 收藏事件
     */
    collectEvent: function () {

        userFavor({
            dataID: Number(this.optionsId),
            type: 'course'
        })
            .then((res) => {
                this.setData({ 'info.is_favor': res.data.is_favor })
                Toast.text({ text: res.data.msg})
            })
    },

    /**
     * 留言事件
     */
    discussEvent: function () {
        wx.navigateTo({
            url: `/pages/common/comment/comment?type=course&id=${this.optionsId}`
        })
    },

    /**
     * 列表点击事件
     * @param e
     * @returns {boolean}
     */
    skipPlayerEvent: function (e) {
        const { type, id, open } = e.currentTarget.dataset

        if (open) {
            Dialog.alert({ content: '尚未加入，不能查看' })
            return false
        }

        switch (type) {
            case 'audio':
                wx.navigateTo({
                    url: `/pages/apply/course/lesson-play/lesson-play?frame=0&id=${id}`
                })
                break;
            case 'video':
                wx.navigateTo({
                    url: `/pages/apply/course/lesson-videoPlay/lesson-videoPlay?id=${id}`
                })
                break
            default :
        }
    },

    closePayLayerEvent: function () { // 关闭支付层
        $wuBackdrop().release()
        this.setData({ in: false })
    },

    /**
     * 加入课程  支付事件
     * @param e
     * @returns {boolean}
     */
    payEvent: function (e) {
        if (this.data.info.is_enroll) {
            return false
        }
        this.setData({ payBtnTxt: '加入...' })

        userEnroll({
            course_id: this.optionsId
        })
            .then((res) => {

                //App.enroll.add(this.optionsId) // 存储已经被加入的课程

                this.closePayLayerEvent() // 关闭加入层
                this.setData({
                    'info.is_enroll': true,
                    payBtnTxt: '已加入'
                })
            })
            .catch(() => {
                this.closePayLayerEvent() // 关闭加入层
                this.setData({
                    payBtnTxt: '加入'
                })
            })
    }

})