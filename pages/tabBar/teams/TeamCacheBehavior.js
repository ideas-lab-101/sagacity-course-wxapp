
module.exports = Behavior({
    data: {
        teamsCache: []
    },
    methods: {
        __add({ index, teamInfo }) {
            let { teamsCache, teamList } = this.data
            if (teamsCache.length <= 0) {
                teamsCache = teamList.map(item => undefined)
            }

            if (teamsCache[index] === undefined) {
                teamsCache[index] = {...teamInfo}
                this.setData({ teamsCache })
            }
        },

        __has(index) {
            return this.data.teamsCache[index] !== undefined
        },

        __delete(index) {
            let { teamsCache } = this.data
            delete teamsCache[index]
            this.setData({ teamsCache })
        },

        __clear() {
            this.data.teamsCache = {}
        }
    }
})