
class enroll {
    constructor() {
        this.$$enroll = []
        this.init()
    }

    init() {
        console.log('被加入课程存储控制器初始化')
    }

    add(course) {
        if (!this.has(course)) {
            this.$$enroll.push(Number(course))
        }
    }

    has(course) {
        return this.$$enroll.includes(Number(course))
    }

    delete(course) {
        const index = this.$$enroll.indexOf(Number(course))
        this.$$enroll.splice(index, 1)
    }

    clear() {
        this.$$enroll = []
    }

}

module.exports = enroll