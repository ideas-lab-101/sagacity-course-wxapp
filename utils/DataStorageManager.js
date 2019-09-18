class DataStorageManager {

  constructor(options) {
    this.$$store = [
      /*{
        key: '',
        data: ''
      }*/
    ]
  }

  init() {
  }

  add(key, data) {
    const index = this.hasStore(key)
    if (index !== -1) {
      this.$$store[index].data = {...data}
    }else {
      const objTemp = {}
      Object.defineProperties(objTemp, {
        key: {
          value: key,
          writable: true
        },
        data: {
          value: {...data},
          writable: true
        }
      })
      this.$$store.push(objTemp)
    }
  }

  hasStore(key) {
    return this.$$store.findIndex(item => {
      return item.key === key
    })
  }

  change(key) {
    const index = this.hasStore(key)
    if (index !== -1) {
      return this.$$store[index].data
    }
    return false
  }

  clear() {
    this.$$store = []
  }


}

module.exports = DataStorageManager
