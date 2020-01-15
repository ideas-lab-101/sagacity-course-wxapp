const Video = require('../../../../controller/video')
const App = getApp()
const { LessonDataInfo, GetLessonList } = require('../../../../request/coursePort')
const { userFavor, addUserHistory } = require('../../../../request/userPort')
const WxParse = require('../../../../components/wxParse/wxParse')
const { $wuNavigation, $wuToast, $wuBackdrop } = require('../../../../components/wu/index')

Page({
    data: {
        info: {},
        resource: {},
        videoShowCenterPlayBtn: false,
        videoControls: true,
        videoAutoplay: false,
        scrollHeight: '100%',
        lesson: {
            pageNumber: 1,
            lastPage: true,
            list: []
        }
    },

    onLoad: function (options) {
        try {
            App.globalData.audio.stop()
        }catch (err) {}
        this.optionsId = options.id
        this.initVideoRequest(this.optionsId)
        this.isLoadPass = true
    },

    onShow: function () {
        if (!this.isLoadPass) {
            if (!this.data.info.is_enroll && App.enroll.has(this.data.info.data.CourseID) && App.user.ckLogin()){
                this.initVideoRequest(this.optionsId)
            }
        }
    },

    onReady: function () {
        try {
            var res = wx.getSystemInfoSync()
            var screenHeight = res.windowHeight
        } catch (e) {}
        var query = wx.createSelectorQuery()
        query.select('#wu-navigation').boundingClientRect()
        query.select('#play-video').boundingClientRect()
        query.exec((ret) => {
            let h = 0
            ret.forEach((item) => {
                h += item.height
            })
            this.setData({
                scrollHeight: `${screenHeight - h}px`
            })
        })
        /***
         *视频组件控制初始化
         **/
        this.thisVideo = new Video()
    },

    onHide: function () {
        /***
         *视频组件控制清除
         **/
        this.thisVideo.clear()
        this.videoEnd = true
        this.isLoadPass = false
    },

    onUnload: function () {
        this.thisVideo = null
        this.isLoadPass = false
    },

    onPageScroll: function (e) {
      //$wuNavigation().scrollTop(e.scrollTop)
    },

    onShareAppMessage: function () {
        return {
            title: this.data.info.data.DataName,
            path: "/pages/apply/course/lesson-videoPlay/lesson-videoPlay?id=" + this.data.info.data.DataID
        }
    },

    // 自定义事件

    /*
    **  media video
    */
    turnBackPageEvent: function () {
        if (this.thisVideo) {
            this.thisVideo.videoContext.stop()
        }
        wx.navigateTo({
            url: `/pages/apply/course/lesson-page/lesson-page?id=${this.data.info.data.CourseID}`
        })
    },

    changeVideoEvent: function (e) {
        const openState = e.currentTarget.dataset.openstate
        const id = e.currentTarget.dataset.id
        if (this.data.info.is_enroll || (!this.data.info.is_enroll && openState === 1)) {
            if (id === this.data.info.data.DataID) {
                if (this.videoEnd) {
                    this.thisVideo.play()
                    return false
                }
                return false
            }
            this.initVideoRequest(id) // 重新请求新的视频链接
        }else {
            wx.showModal({
                title: '',
                content: '尚未加入，不能查看',
                showCancel: true,
                confirmText: '去加入',
                cancelText: '算了',
                success: (res) => {
                    if (res.confirm) {
                        if (this.thisVideo) {
                            this.thisVideo.videoContext.stop()
                        }
                        wx.navigateTo({
                            url: `/pages/apply/course/lesson-page/lesson-page?id=${this.data.info.data.CourseID}`
                        })
                    }
                }
            })
        }
    },

    collectEvent: function (e) {
      userFavor({dataID: Number(this.data.info.data.DataID), type: 'ld'}).then((res) => {
            this.setData({
                'info.is_favor': res.is_favor
            })
          $wuToast().show({
                type: 'text',
                duration: 1000,
                text: res.msg
            })
        })
    },

    openDraftEvent: function (e) {
      $wuBackdrop().retain()
        this.setData({
            in: true
        })
    },

    closeDraftEvent: function (e) {
      $wuBackdrop().release()
        this.setData({
            in: false
        })
    },

    tipEvent: function (e) {
        wx.showModal({
            title: '',
            content: '尚未加入，不能查看。',
            showCancel: true,
            cancelText: '算了',
            confirmText: '去加入',
            success: (res) => {
                if (res.confirm) {
                    wx.navigateTo({
                        url: `/pages/apply/course/lesson-page/lesson-page?id=${this.data.info.data.CourseID}`
                    })
                }
            }
        })
    },

    /**
     *视频组件 监听事件
     **/
    videoPlayEvent: function (e) {
        this.thisVideo.create() // 视频组件控制调用
        this.videoEnd = false
    },

    videoEndEvent: function (e) {
        const id = this.data.info.nextDataID
        if (id !== 0) {
            this.initVideoRequest(id)  // 重新请求数据  顺序播放
        }else {
            this.videoEnd = true
        }
    },

    videoErrEvent: function (e) {},

    /**
    **  media video init event
    **/
    initVideoRequest: function (id) {
      LessonDataInfo({dataID: id}).then((res) => {
          console.log(res)
            this.setData({
                info: res
            })
            WxParse.wxParse('detail', 'html', res.data.Content || '<p style="font-size: 14px;">暂无介绍</p>', this, 5) // 添加文稿
            if(this.data.lesson.list.length<=0) {
              this.getLessonList()
            }
        }).then(() => {
            if (this.data.info.data.DataType === 'video') {
                this.initVideo(this.data.info.data.DataID)
            } else {
                console.error('文件和文件类型不匹配')
            }
        })
    },

    lessonScollTolowerEvent() {
        if(this.data.lesson.lastPage || this.isLoading) {
          return false
        }
        this.data.lesson.pageNumber++
        this.getLessonList()
    },

    getLessonList() {
      this.isLoading = true
      GetLessonList({
          courseID: this.data.info.data.CourseID,
          page: this.data.lesson.pageNumber
        }).then(res => {
            console.log(res)
            this.isLoading = false
            this.setData({
              'lesson.list': this.data.lesson.list.concat(res.list),
              'lesson.lastPage': res.lastPage
            })
        })
    },

    initVideo: function (id) {
        if (this.data.info.is_enroll || this.data.info.data.openState === 1) { // 判断进入的时候的 id 是否在播放列表中, 给出结果 是否被中断, 如果中断说明传入ID 不在播放列表中
          this.setData({
            videoControls: true,
            videoAutoplay: true
          })
        }else {
          this.setData({
            videoControls: false,
            videoAutoplay: false
          })
          return false
        }

        this.setData({
            resource: this.data.info.data
        })
        addUserHistory( // 这里请求新的地址  就给一条记录
            {dataID: Number(this.data.info.data.DataID)}
        ).then((res) => {
            console.log('添加到历史记录')
        })
    }

})