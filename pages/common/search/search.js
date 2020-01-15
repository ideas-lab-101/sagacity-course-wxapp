const app = getApp()
const ArrayList = require("../../../utils/arrayList")
const { Search, HotSearch } = require("../../request/systemPort")

Page({

    data: {
      course_list: [],
      teacher_list: [],
      data_list: [],
      is_search: false,
      key: null,
      hot_tag: {},
      my_search: {},
      my_search_arr: {}
    },

    onLoad: function (options) {
        //获取搜索记录
        let my_search = wx.getStorageSync("my_search")
        if (my_search === '') {
          my_search = { arr: [] }
        }
        let list = new ArrayList(my_search.arr)
        this.setData({
          my_search: list,
          my_search_arr: list.toArray()
        })

        HotSearch().then((res) => {
            this.setData({
                hot_tag: res.list
            })
        })
    },
    goLesson(e) {
      const index = e.currentTarget.dataset.index
      const id = this.data.data_list[index].ID
      const type = this.data.data_list[index].Type
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
      Search({key: this.data.key}).then((res) => {
            this.setData({
                course_list: res.courseList,
                teacher_list: res.teacherList,
                data_list: res.dataList,
                is_search: true
            })

            let key = this.data.key

            //更新搜索记录
            if (this.data.my_search.contains(key)) {//如果存在就先删除
                this.data.my_search.remove(key)
            }
            this.data.my_search.add(key)
            wx.setStorageSync("my_search", this.data.my_search)
        })
    },
    clear_my_search(event) {
        let key = event.currentTarget.dataset.name
        //更新搜索记录
        if (this.data.my_search.contains(key)) { // 如果存在就先删除
            this.data.my_search.remove(key)
        }
        wx.setStorageSync("my_search", this.data.my_search)
        this.setData({
            my_search_arr: this.data.my_search.toArray()
        })
    },

    search(e) {
        let key = e.detail.value
        if (key.trim() === '') {
            return false;
        }
        this.setData({
            key: key
        })
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
            wx.navigateBack()
        }
    },

    tag_search(event) {
        const name = event.currentTarget.dataset.name
        this.setData({
            key: name
        })
        this.get_data()
    }

})