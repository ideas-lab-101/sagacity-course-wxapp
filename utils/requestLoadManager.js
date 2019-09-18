class requestLoadManager {

    constructor(options) {
        this.$$request = []
        this.$$store = ['userFavor', 'userEnroll', 'submitRecordFile', 'addUserPoint', 'setMessage', 'bindUser', 'setPublic', 'delRecord', 'removeTeamRecord', 'exitTeam', 'setTeamLabel']
    }

    init() {

    }

    add(url) {
        const arr = url.split('/')
        const temp = arr[arr.length-1]
        if (this.hasStore(temp) && !this.has(temp)) {
            this.$$request.push(temp)
        }
    }

    hasStore(str) {
        return this.$$store.includes(str)
    }


    has(str) {
        return this.$$request.includes(str)
    }

    consume(str) {
        if (this.has(str)) {
            const index = this.$$request.indexOf(str)
            this.$$request.splice(index, 1)
            return true
        }else {
            return false
        }
    }

    clear() {
        this.$$request = []
    }


}

module.exports = requestLoadManager