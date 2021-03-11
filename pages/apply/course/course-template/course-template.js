var App = getApp()
import { getRecommendTemplateList } from '../../../../request/recordPort'
const MultiplePageReachBottomBehavior = require('../../../../utils/behaviors/MultiplePageReachBottomBehavior')
const PageReachBottomBehavior = require('../../../../utils/behaviors/PageReachBottomBehavior')

Page({
    behaviors: [MultiplePageReachBottomBehavior, PageReachBottomBehavior],
    data: {
        nav: {
            title: "选择资源",
            backgroundColor: '#e3d6d4',
            navTitle: ''
          },
        searchValue: '',
        statusBarHeight: App.globalData.equipment.statusBarHeight,
        tabs: [
            {
                name: '章节',
                type: '1'
            },
            {
                name: '推荐',
                type: '2'
            },
            {
                name: '收藏',
                type: '3'
            }
        ],
        isSearching: false,
        checkedId: null
    },

    onLoad: function(options) {
        this.optionsId = options.id === 'undefined' || !options.id ?'0':options.id

        this.eventChannel = this.getOpenerEventChannel()
        this.__init()
    },

    onReachBottom: function () {
        const { isSearching } = this.data
        if (isSearching) {
            this.__ReachBottom()
        }else {
            this.__ReachBottomMultiple()
        }
    },

    __init() {
        const { tabs } = this.data
        const params = [...tabs].map(item => {
            return {
                isPageShow: true,
                interfaceFn: getRecommendTemplateList,
                params: {
                    dataId: this.optionsId,
                    type: item.type,
                    pageSize: 20
                }
            }
        })

        this.__getTurnPageDataListMultiple(params)
    },

    choiceTemplate(e) {
        const { index } = e.currentTarget.dataset;
        const { list } = this.data.contentMultiple
        let item = list[index]
        let temp = item.data_id

        if (temp === this.data.checkedId) {
            temp = null
            item = null
        }
        this.setData({
            'nav.title': item?item.name:'选择课程',
            'nav.navTitle': item?'确定':'',
            checkedId: temp
        })
        
        this.eventChannel.emit('acceptDataSetCourseTemplate', {id: temp})
    },

    changeSearch(e) {
        this.setData({
            searchValue: String(e.detail.value)
        })
    },
    confirmSearch() {
        const { searchValue, contentMultipleCurrent, tabs } = this.data
        const type = tabs[contentMultipleCurrent].type

        this.__getTurnPageDataList({
            isPageShow: true,
            interfaceFn: getRecommendTemplateList,
            params: {
                    dataId: this.optionsId,
                    type: type,
                    pageSize: 20,
                    key: searchValue
               }
            })
            .then(() => {
                this.setData({
                    isSearching: true
                })
            })
    },
    freeSearch() {
        this.setData({
            searchValue: '',
            isSearching: false
        })
    },

    inheritTabsChange() {
        this.setData({
            searchValue: '',
            isSearching: false
        })
    }
})
