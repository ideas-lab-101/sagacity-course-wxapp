Component({

    behaviors: [],

    properties: {
        bottom: {
            type: String,
            value: '20px'
        },
        right: {
            type: String,
            value: '20px'
        },
        zIndex: {
            type: Number,
            value: 999
        }
    },
    data: {
        show: false
    },

    attached: function () {
        var query = wx.createSelectorQuery()
        query.selectViewport().boundingClientRect((res) => {
            this.directionTop = res.height
        })
        query.exec()
    },

    methods: {
        /*
        * 在page页面   调用方法
        */
        scroll: function (val) {
            if (val >= this.directionTop && !this.data.show) {
                this.setData({
                    show: true
                })
            } else if (this.data.show && val < this.directionTop) {
                this.setData({
                    show: false
                })
            }
        },
        /*
        * 内部方法
        */
        _stickEvent: function(){
            wx.pageScrollTo({
                scrollTop: 0,
                duration: 300
            })
        }
    }

})