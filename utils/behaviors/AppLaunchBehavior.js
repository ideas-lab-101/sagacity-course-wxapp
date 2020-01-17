module.exports = Behavior({
    methods: {
        __initAppLaunch: function() {
            if (!getApp().identityCallback) {
                getApp().identityCallback = () => Promise.resolve()
                
                return Promise.resolve()
            }
            return Promise.resolve()
        }
    }
})