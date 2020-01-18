'use strict';
class EnrollController {
    constructor() {
        this.$$enroll = []
        this.init()
    }

    init() {
        console.log('被加入课程存储控制器初始化')
    }

    add(courseID) {
        if (!this.has(courseID)) {
            this.$$enroll.push(Number(courseID))
        }
    }

    has(courseID) {
        return this.$$enroll.includes(Number(courseID))
    }

    delete(courseID) {
        const index = this.$$enroll.indexOf(Number(courseID))
        this.$$enroll.splice(index, 1)
    }

    clear() {
        this.$$enroll = []
    }

}

module.exports = EnrollController