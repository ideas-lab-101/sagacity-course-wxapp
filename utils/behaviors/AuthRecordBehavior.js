import RecordManager from '../../controller/RecordManager'
const Toast = require('../../viewMethod/toast')

module.exports = Behavior({
    data: {
        recordStart: false,
        recordEnd: false,
        isPause: false,
        recordTime: 0 // 录音时间
    },
    methods: {

        __initRecorder() {
            /**
             * 建立录音管理器
             * @type {RecordManager}
             */
            this.Recorder = new RecordManager({
                onStart: this._startBack,
                onStop: this._stopBack,
                onResume: this._resumeBack,
                onError: this._errorBack,
                onInterruptionBegin: this._interruptionBeginBack,
                onInterruptionEnd: this._interruptionEndBack
            })
        },

        /**
         * 录音事件
         * @param e
         */
        startRecordExecute: function () {
            this.cancelRecordParams = false
            this.Recorder.start()
        },

        endRecord: function (e) {
            this.startRecordAction = false
            this.Recorder.stop()
        },

        freeRecord: function () {
            this.Recorder.free()
        },

        pauseRecord: function () {
            this.Recorder.pause()
            this.setData({ isPause: true })
        },

        resumeRecord: function () {
            this.Recorder.resume()
            this.setData({ isPause: false })
        },

        cancelRecord: function (e) {
            this.startRecordAction = false
            this.cancelRecordParams = true
            this.setData({
                recordStart: false,
                isPause: false,
                recordTime: 0
            })
            this.Recorder.stop()
        },

        /**
         * 监听回调事件
         **/
        _startBack: function () {
            this.setData({ recordStart: true })
            this.resetTime() // 获取录制时间
        },

        _stopBack: function (res) {
            /**
             * 是否是取消录制
             */
            if (this.cancelRecordParams) {
                return false
            }
            clearTimeout(this.recordTimeFn)
            if (this.data.recordTime < 15 && !this.cancelRecordParams) {
                Toast.text({ text: '录制时间不得低于15秒' })
                this.setData({
                    recordTime: 0,
                    recordStart: false,
                    isPause: false
                })
                return false
            }
            this.setData({
                recordTime: 0,
                recordStart: false,
                isPause: false
            })
            /**
             * 上传到服务器  获取音频合成的接口
             */
            this.getMixtureRecord(res.tempFilePath, Math.ceil(res.duration))
        },

        _resumeBack: function () {
            this.resetTime() // 获取录制时间
        },

        _errorBack: function (err) {
            console.error(err)
        },

        _interruptionBeginBack: function () {
            this.setData({ isPause: true })
        },

        _interruptionEndBack: function () {
            this.setData({ isPause: false })
            this.resetTime() // 获取录制时间
        },

        /**
         * 计算器   计算出录音录制时间
         */
        resetTime: function () {
            let { recordStart, isPause, recordTime } = this.data
            this.recordTimeFn = setTimeout(() => {
                clearTimeout(this.recordTimeFn)
                if (!recordStart || (recordStart && isPause)) {
                    return false
                }
                /**
                 * 如果时间长于590 就停止录制
                 */
                if (recordTime >= 598) {
                    this.endRecord()
                    return false
                }
                recordTime++
                this.setData({
                    recordTime: recordTime,
                    timeHand: this.countTimePosition(recordTime)
                })
                this.resetTime()
            }, 1000)
        },

        countTimePosition(time) {
            const { windowWidth } = this.data
            let result = windowWidth * time / 600
            if (windowWidth <= result + 35) {
                result = windowWidth - 35
            }
            return result
        }

    }
})