Component({

    behaviors: [],

    properties: {
        current: {
            type: Number,
            value: 0
        },
        dotsData: {
            type: Array,
            value: []
        },
        activeColor: {
            type: String,
            value: '#000'
        }
    },
    data: {
        show: false
    },

    created: function () {
        this._initData()
    },

    methods: {
        /*
        * 内部方法
        */
        _initData: function(){

        }
    }

})