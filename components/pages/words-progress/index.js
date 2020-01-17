Component({
    behaviors: [],
    properties: {
        overall: {
            type: Array,
            value: [
              // {time_line: "00:00:10--00:00:16", Content: "天气凉了，树叶黄了。"}
            ],
            observer: function(newVal, oldVal, changedPath) {
              setTimeout(()=> {
                this._reset()
              }, 10)
            }
        },
        frame: {
            type: Number,
            value: 0,
            observer: function(newVal, oldVal, changedPath) {
                this._scrollTo(newVal, oldVal)
            }
        },
        record: {
          type: Boolean,
          value: false
        }
    },
    data: {
        show: false,
        current: -1,
        showLen: 4,
        boxHeight: 400,
        translateY: 0,
        transitionend: true
    },

    created() {
    },

    attached() {
    },

    ready() {
    },

    pageLifetimes: {
      show: function () {},
      hide: function () { },
      resize: function () { },
    },

    methods: {
        _reset() {
          this.stationCurrent = null // 记录当前滚动的数据序列号
          this.setData({
            current: -1,
            translateY: 0,
            transitionend: true
          })

          const query = wx.createSelectorQuery().in(this)
          query.selectAll('.wp-single').fields({size: true}, (res) => {
            let totalHeight = 0
            res.forEach(item => {
              totalHeight += item.height
            })
            this.totalHeight = totalHeight
          })
          query.select('#wp-container').fields({size: true}, (res) => {
            this.data.boxHeight = res.height
          })
          query.exec()
        },

        _getFirstItem() {
          if(this.data.overall === [] || this.data.overall.length<=0) {
            return 0
          }
          const exp = new RegExp('--', 'g')
          let temp = this.data.overall[0].time_line.split(exp)
          return this._fiterTime(temp[0])
        },

        _getLastItem() {
          if(this.data.overall === [] || this.data.overall.length<=0) {
            return 0
          }
          const exp = new RegExp('--', 'g')
          let temp = this.data.overall[this.data.overall.length-1].time_line.split(exp)
          return this._fiterTime(temp[1])
        },

        _scrollTo: function (newVal, oldVal) {
          if(this.data.overall === [] || this.data.overall.length<=0) {
            return false
          }
          let tempCurrent = this._computeCurrent(newVal) // 根据更新的时间  计算出当前在数据中的定位

          if(tempCurrent !== -1 ) {
              this.setData({
                current: tempCurrent
              })
              this._moveY(tempCurrent)
          }else if(tempCurrent === -1 && this._getFirstItem() > newVal){  // 判断反向拖动回到最初位置 置顶
            this.setData({
              current: -1,
              translateY: 0
            })
          }else if(tempCurrent === -1 && this._getLastItem() < newVal){  // 判断拖动最后位置
            this.setData({
              current: -1,
              translateY: this.totalHeight-this.data.boxHeight
            })
          }
        },
        /**
        * 内部方法
        **/
        transitionendEvent(e) {
            this.data.transitionend = true
        },

        _moveY(current) {
            if(!this.data.transitionend || this.stationCurrent === current) {
                return false
            }

            let tempHeight = 0
            const moveQuery = wx.createSelectorQuery().in(this)
            moveQuery.selectAll('.wp-single').fields({size: true},(res) => {

                res.forEach((item, index) => {
                    if(index <= current - 2) {
                        tempHeight += item.height
                    }
                })
                if(current === 0 || current === 1) {
                  tempHeight = 0
                }
                if(current === res.length-1 || current === res.length-2) {
                  tempHeight = this.totalHeight - this.data.boxHeight
                }

                this.data.transitionend = false // 设置动画已经开启
                this.stationCurrent = current // 暂时存储当前数据的序列号
                console.log('重设词向上滚动')
                this.setData({translateY: tempHeight})

                clearTimeout(this.transitionFn)
                this.transitionFn = setTimeout(()=>{
                  this.data.transitionend = true
                },1000)

            }).exec()
        },

        _computeCurrent(time){
            const exp = new RegExp('--', 'g')
            return this.properties.overall.findIndex( item => {
                let temp = item.time_line.split(exp)
                let begin = this._fiterTime(temp[0])
                let end = this._fiterTime(temp[1])
                return this._compareTime(time, begin, end)
            })
        },

        _compareTime(time, quantumBegin, quantumEnd) {
            if(time >= quantumBegin && quantumEnd >= time) {
                return true
            }
            return false
        },

        _formatTime(quantum) {
            const exp = new RegExp(':', 'g')
            const temp = quantum.split(exp)
            return {
                hour: Number(temp[0]),
                min: Number(temp[1]),
                sec: Number(temp[2])
            }
        },

        _fiterTime(time) {
            const temp = this._formatTime(time)
            return temp.hour*360 + temp.min*60 + temp.sec
        }
    }

})
