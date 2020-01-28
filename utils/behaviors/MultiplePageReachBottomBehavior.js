module.exports = Behavior({
    data: {
        contentMultiple: {
            pageNumber: 1,
            lastPage: true,
            firstPage: true,
            totalRow: 0,
            pageSize: 10,
            list: []
        },
        contentMultipleArrayOptions: null,
        contentMultipleLoad: false,
        contentMultipleCurrent: 0,
        contentMultipleCacheData: [
            /*{
                key: 1,
                data: null
            }*/
        ]
    },
    methods: {
        __ReachBottomMultiple: function() {
            let { lastPage, pageNumber } = this.data.contentMultiple
            this.__changeTurnPageOptions()

            const { contentMultipleArrayOptions } = this.data

            if(lastPage) {
                return false
            }
            this.data.contentMultiple.pageNumber++

            this.__getTurnPageDataListMultiple(contentMultipleArrayOptions)
                .catch(() => {
                    this.data.contentMultiple.pageNumber--
                })
        },

        __turnPageTabChangeMultiple(e) {
            const { index } = e.currentTarget.dataset
            const { contentMultipleArrayOptions } = this.data

            this.setData({ contentMultipleCurrent: Number(index)}, () => {

                const data = this.__changeTurnPageCacheData(Number(index))
                if (!data) {
                    this.__getTurnPageDataListMultiple(contentMultipleArrayOptions)
                }else {
                    this.setData({
                        contentMultiple: data
                    })
                }

            })
        },

        /**
         * {isPageShow, interfaceFn, params}
         * @param options
         * @returns {Promise<any|never>|Promise<any>|boolean}
         * @private
         */
        __getTurnPageDataListMultiple: function (ArrayOptions) {

            let {isPageShow, interfaceFn, params} = this.__formatTurnPageOptions(ArrayOptions)

            let { pageNumber, pageSize, list } = this.data.contentMultiple
            const { contentMultipleLoad } = this.data

            if (isPageShow) {
                pageNumber = 1
            }
            if (contentMultipleLoad) {
                return false
            }
            this.data.contentMultipleLoad = true

            params = Object.assign({}, {
                page: pageNumber,
                pageSize
            }, params)


            return interfaceFn(params)
                .then(res => {
                    let tempList = [...res.data.list]
                    if (!isPageShow) {
                        tempList = list.concat(tempList)
                    }

                    this.data.contentMultiple.pageNumber = pageNumber
                    this.setData({
                        'contentMultiple.list': tempList,
                        'contentMultiple.lastPage': res.data.lastPage,
                        'contentMultiple.totalRow': res.data.totalRow,
                    })

                    /**
                     * 缓存数据
                     */
                    this.__addTurnPageCacheData(this.data.contentMultipleCurrent, this.data.contentMultiple)
                })
                .finally(() => {
                    this.data.contentMultipleLoad = false
                })
        },

        __formatTurnPageOptions(ArrayOptions) {
            const { contentMultipleCurrent, contentMultipleArrayOptions } = this.data

            if (!contentMultipleArrayOptions) {
                this.data.contentMultipleArrayOptions = [...ArrayOptions]
            }

            let isPageShow = ArrayOptions[contentMultipleCurrent].isPageShow
            let interfaceFn = ArrayOptions[contentMultipleCurrent].interfaceFn
            let params = ArrayOptions[contentMultipleCurrent].params

            if (!interfaceFn) {
                throw 'The interface is null!'
            }
            params = params || {}

            return {
                isPageShow,
                interfaceFn,
                params
            }
        },

        __changeTurnPageOptions() {
            let { contentMultipleCurrent, contentMultipleArrayOptions } = this.data

            contentMultipleArrayOptions[contentMultipleCurrent].isPageShow = false

            this.data.contentMultipleArrayOptions = [...contentMultipleArrayOptions]
        },

        /**
         * 缓存数据类的方法
         * @param key
         * @param data
         * @private
         */
        __addTurnPageCacheData(key, data) {
            const index = this.__hasTurnPageCacheData(key)
            if (index !== -1) {
                this.data.contentMultipleCacheData[index].data = {...data}
            }else {
                const objTemp = {}
                Object.defineProperties(objTemp, {
                    key: {
                        value: key,
                        writable: true
                    },
                    data: {
                        value: {...data},
                        writable: true
                    }
                })
                this.data.contentMultipleCacheData.push(objTemp)
            }
        },

        __hasTurnPageCacheData(key) {
            return this.data.contentMultipleCacheData.findIndex(item => item.key === key)
        },

        __changeTurnPageCacheData(key) {
            const index = this.__hasTurnPageCacheData(key)
            if (index !== -1) {
                return this.data.contentMultipleCacheData[index].data
            }
            return false
        }
    }
})