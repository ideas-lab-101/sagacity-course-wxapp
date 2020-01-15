Page({
    data: {
        src:''
    },

    onLoad: function (options) {
        this.setData({
            src: decodeURIComponent(options.src)
        })
    },

    onShareAppMessage: function () {
        let src = this.data.src
        return {
            path: '/pages/common/web/web?src=' + encodeURIComponent(src)
        }
    }
})
