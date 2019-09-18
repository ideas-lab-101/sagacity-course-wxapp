class commentManager {

  constructor(options) {
    this.dataID = null
    this.referID = null
    this.addResult = null // 只做单一数据处理
    this._addResultIndex = -1
  }

  add(options, result) {
    this.dataID = options.dataID
    this.referID = options.referID !== null? options.referID : 'root'
    if(!result.child) {
      result.child = []
    }
    this.addResult = result
  }

  listen(dataList, callBack) {
    if(!this.dataID) {
      return false
    }
    this._add(dataList)
    if(this.referID === 'root' || (this.referID !== 'root' && this._addResultIndex !== -1)) {
      typeof callBack === "function" && callBack(dataList)
      this._destroy()
    }
  }

  _iteration(dataList) {
    dataList.forEach( (item, index) => {
      if(Number(item.CommentID) === Number(this.referID)) {
        this._addResultIndex = index
        this._goIteration = true
        return false
      }
    })
  }

  _add(dataList) {
    this._goIteration = false // 间断迭代是否中断
    this._iteration(dataList)

    if(this.referID === 'root') {
        dataList.unshift(this.addResult)
    }else {
      if(this._goIteration) {
        dataList[this._addResultIndex].child.unshift(this.addResult)
      }
    }
  }

  _destroy() {
    this.dataID = null
    this.referID = null
    this.addResult = null
    this._addResultIndex = -1
  }

  get result() {
    return this.addResult
  }

}

module.exports = commentManager