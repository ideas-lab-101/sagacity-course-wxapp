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
                startBack: this._startBack.bind(this),
                stopBack: this._stopBack.bind(this),
                resumeBack: this._resumeBack.bind(this),
                errorBack: this._errorBack.bind(this),
                interruptionBeginBack: this._interruptionBeginBack.bind(this),
                interruptionEndBack: this._interruptionEndBack.bind(this)
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
            this.setData({
                recordStart: false,
                isPause: false
            })
            this.Recorder.stop()
        },

        freeRecord: function() {
            this.Recorder.free()
        },

        pauseRecord: function () {
            this.Recorder.pause()
            this.setData({isPause: true})
        },

        resumeRecord: function () {
            this.Recorder.resume()
            this.setData({isPause: false})
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
            this.setData({recordStart: true})
            this.resetTime() // 获取录制时间
        },

        _stopBack: function (res) {
            this.setData({
                recordTime: 0
            })

            /**
             * 是否是取消录制
             */
            if (this.cancelRecordParams) {
                return false
            }

            if (this.data.recordTime < 15 && !this.cancelRecordParams) {
                Toast.text({ text: '录制时间不得低于15秒'})
                return false
            }

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
            this.setData({isPause: true})
        },

        _interruptionEndBack: function () {
            this.setData({isPause: false})
            this.resetTime() // 获取录制时间
        },

        /**
         * 计算器   计算出录音录制时间
         */
        resetTime: function () {
            this.recordTimeFn = setTimeout(() => {
                clearTimeout(this.recordTimeFn)
                if (!this.data.recordStart || (this.data.recordStart && this.data.isPause)) {
                    return false
                }
                /**
                 * 如果时间长于590 就停止录制
                 */
                if(this.data.recordTime > 590) {
                    this.endRecord()
                    return false
                }
                this.data.recordTime++
                this.setData({ recordTime:  this.data.recordTime })
                this.resetTime()
            }, 1000)
        }

    }
})