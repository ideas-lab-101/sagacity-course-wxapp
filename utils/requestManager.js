class requestManager {

    constructor(options) {
        this.$$request = []
        this.$$fixRequest = ['updatePersonTypeAndSchId', 'unbind']  // 此数组的值 这些固定请求不能被清除
        /**
         *
                expire: new Date().getTime() + 60*60*1000,
                url: '/',
                type: data.hasOwnProperty('type') ? data.type : '',
                execute: ['/']
         */
    }

    init() {
    }

    /**
     * 向存储里面添加请求接口
     * @param url
     */
    add(obj) {
        if (Array.isArray(this.$$request)) {
            this.$$request.push(obj)
        }
    }

    /**
     * 判断是否存在
     * @param str
     * @returns {boolean}
     */
    has(port, type) {
        return this.$$request.filter(item => {
            if (type) {
                return (item.url.includes(port)) && item.type === type
            }
           return item.url.includes(port)
        })
    }

    /**
     * 查询此接口是否已经验证过来  如果没验证返回 true  验证了返回false
     * @param port
     * @param route
     * @returns {boolean}
     */
    execute(port, route, type) {
        const items = this.has(port, type)
        if (items.length <= 0) {
            return false
        }
        let temp = false
        const itemsLast = items[items.length - 1]

        if (!itemsLast.hasOwnProperty('execute') || (itemsLast.hasOwnProperty('execute') && !itemsLast.execute.includes(route))) {
            temp = itemsLast.expire
        }

        return temp
    }


    update(port, route, type) {
        const expire = this.execute(port, route, type)
        if (expire) {
            const index = this.$$request.findIndex(item => item.expire === expire)
            const _i = this.$$request[index]

            if(!_i.hasOwnProperty('execute')) {
                this.$$request[index].execute = [route]
            }else {
                this.$$request[index].execute.push(route)
            }
            return true
        }
        return  false
    }

    /**
     * 确认是否删除当前接口
     * @param str
     * @returns {boolean}
     */
    consume(str) {
        if (this.has(str).length > 0) {
            const index = this.$$request.indexOf(str)
            this.$$request.splice(index, 1)
            return true
        }
        return false
    }

    /**
     * 清除全部存储
     * 发起的请求在数组this.$$fixRequest内存在的不能清除
     */
    clear() {
        this.$$request = this.$$request.filter(item => {
            return this.$$fixRequest.filter(i => {
                return i.url === item.user
            })
              .length > 0
        })
    }

}

module.exports = requestManager
