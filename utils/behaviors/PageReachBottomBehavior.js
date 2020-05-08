module.exports = Behavior({
    data: {
        content: {
            pageNumber: 1,
            lastPage: true,
            firstPage: true,
            totalRow: 0,
            pageSize: 10,
            list: []
        },
        contentLoad: false,
        contentInterfaceFn: null,
        contentParams: null
    },
    methods: {
        __ReachBottom() {
            let { lastPage, pageNumber } = this.data.content
            const {contentInterfaceFn, contentParams} = this.data

            if(lastPage || contentInterfaceFn === null) {
                return false
            }
            this.data.content.pageNumber++

            this.__getTurnPageDataList({
                isPageShow: false,
                interfaceFn: contentInterfaceFn,
                params: contentParams
            })
                .catch(() => {
                    this.data.content.pageNumber--
                })
        },
        
        __getTurnPageDataList ({isPageShow, interfaceFn, params}) {
            if (!interfaceFn) {
                throw 'The interface is null!'
            }
            params = params || {}

            this.data.contentInterfaceFn = interfaceFn
            this.data.contentParams = params

            let { pageNumber, pageSize, list } = this.data.content
            const { contentLoad } = this.data

            if (isPageShow) {
                pageNumber = 1
            }
            if (contentLoad) {
                return false
            }
            this.data.contentLoad = true

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

                    this.data.content.pageNumber = pageNumber
                    this.setData({
                        'content.list': tempList,
                        'content.lastPage': res.data.lastPage,
                        'content.totalRow': res.data.totalRow,
                    })
                })
                .finally(() => {
                    this.data.contentLoad = false
                })
        }
    }
})