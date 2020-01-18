module.exports = Behavior({
    methods: {
        __initAppLaunch: function(params) {
            if (!getApp().identityLoaded) {
                getApp().identityCallback = () => {
                    this.__init(params)
                }
                return false
            }
            this.__init(params)
        }
    }
})