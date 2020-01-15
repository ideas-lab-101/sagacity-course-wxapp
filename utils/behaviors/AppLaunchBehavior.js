module.exports = Behavior({
    methods: {
        __initAppLaunch: function() {
            return new Promise(resolve => {
                if (!getApp().identityCallback) {
                    getApp().identityCallback = () => {
                        this.__init()
                        resolve()
                    }
                }else {
                    this.__init()
                }
            })
        }
    }
})