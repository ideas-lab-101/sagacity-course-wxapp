import { addUserHistory } from "../../request/userPort";
const Video = require('../../controller/Video')
module.exports = Behavior({
    methods: {
        __initVideoContext: function(params) {
            this.videoContextTask = new Video('video-player')
        },

        /**
         *视频组件 监听事件
         **/
        __videoPlayEvent: function (e) {
            this.videoEnd = false
            this.videoContextTask.create()
        },

        __videoEndEvent: function (e) {
            console.log(e)
            this.addHistory()

            const id = this.data.info.next_data_id
            if (id !== 0) {
                this.__init({data_id: id, isNext: true})  // 重新请求数据  顺序播放
            }else {
                this.videoEnd = true
            }
        },

        __videoPauseEvent: function (e) {
            console.log(e)
            this.addHistory(this.videoCurrentTime)
        },

        __videoTimeUpdateEvent: function (e) {
            this.videoCurrentTime = parseInt(e.detail.currentTime * 1000)
        },

        __videoWaitingEvent: function(e) {

        },

        __videoErrEvent: function (e) {
            console.error(e)
        },

        /**
         * 这里请求新的地址  就给一条记录
         * @param id
         * @param frame
         */
        addHistory: function (frame) {
            const { data_id } = this.data.info.lesson_data

            addUserHistory({
                data_id: Number(data_id),
                frame: frame || 0
            })
                .then((res) => {
                    console.log('添加到历史记录')
                })
        }
    }
})