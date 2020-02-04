const App = getApp()
const ArrayList = require("../../../utils/arrayList")
import { search, hotSearch } from "../../../request/systemPort"
const Session = require('../../../utils/session')

Page({
    data: {
      course_list: [],
      teacher_list: [],
      data_list: [],
      is_search: false,
      key: null,
      hot_tag: {},
      my_search_arr: {}
    },
    onLoad: function (options) {
        this.__init()
    },

    __init() {
        //获取搜索记录
        let searchData = Session.getSearchCache()
        if (!searchData || searchData === '') {
            searchData = { arr: [] }
        }

        this.SearchCache = new ArrayList(searchData.arr)
        this.setData({
            my_search_arr: this.SearchCache.toArray()
        })

        hotSearch()
            .then((res) => {
                this.setData({
                    hot_tag: res.data.list
                })
            })
    },

    goLesson(e) {
      const index = e.currentTarget.dataset.index
      const id = this.data.data_list[index].id
      const type = this.data.data_list[index].type

      if(type.includes('audio')) {
        wx.navigateTo({
          url: `/pages/apply/course/lesson-play/lesson-play?id=${id}`
        })
      }else if(type.includes('video')) {
        wx.navigateTo({
          url: `/pages/apply/course/lesson-videoPlay/lesson-videoPlay?id=${id}`
        })
      }
    },

    get_data() {
        const { key } = this.data
        search({
            key
        })
            .then((res) => {
                this.setData({
                    course_list: res.data.course_list,
                    teacher_list: res.data.teacher_list,
                    data_list: res.data.data_list,
                    is_search: true
                })

                let key = this.data.key

                //更新搜索记录
                if (this.SearchCache.contains(key)) {//如果存在就先删除
                    this.SearchCache.remove(key)
                }
                this.SearchCache.add(key)

                Session.setSearchCache(this.SearchCache)
            })
    },

    clear_my_search(event) {
        let key = event.currentTarget.dataset.name
        //更新搜索记录
        if (this.SearchCache.contains(key)) { // 如果存在就先删除
            this.SearchCache.remove(key)
        }

        Session.setSearchCache(this.SearchCache)
        this.setData({
            my_search_arr: this.SearchCache.toArray()
        })
    },

    search(e) {
        let key = e.detail.value
        if (key.trim() === '') {
            return false;
        }
        this.setData({ key })
        this.get_data()
    },

    cancel() {
        if (this.data.key !== null) {
            this.setData({
                course_list: {},
                teacher_list: {},
                is_search: false,
                key: null,
            })
        }else{
            wx.navigateBack({ delta: 1 })
        }
    },

    tag_search(event) {
        const name = event.currentTarget.dataset.name
        this.setData({ key: name })
        this.get_data()
    }
})