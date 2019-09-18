const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('') + [hour, minute, second].map(formatNumber).join('')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formartFileSize = bytes => {
    if (bytes > 1024) {
          if (bytes > 1024 * 1024) {
              // 以MB为单位
              return (bytes / 1024 / 1024).toFixed(2) + 'MB'
          } else {
              // 以KB为单位
              return (bytes / 1024).toFixed(2) + 'KB'
          }

      } else {
          return bytes + 'B'
      }
}

const convertTime = time => {
    const d = new Date(time.replace(/-/g, '/'))
    const now = Date.now()
    const diff = (now - d) / 1000

    if (diff < 30) {
        return '刚刚'
    } else if (diff < 3600) {
        return Math.ceil(diff / 60) + '分钟前'
    } else if (diff < 3600 * 24) {
        return Math.ceil(diff / 3600) + '小时前'
    } else if (diff < 3600 * 24 * 2) {
        return '1天前'
    }

    return Number(d.getMonth() + 1) + '月' + Number(d.getDate()) + '日 ' + Number(d.getHours()) + '时' + Number(d.getMinutes()) + '分'
}

// 分页调用方法
const setPageMore = (pageModel, pageData) => {
    if (pageData.totalRow <= 0) {
        pageModel.setData({
            noData: true,
            noMore: false,
            hasMore: false,
        })
    }
    if (pageData.lastPage || pageData.totalRow == 0) {
        pageModel.setData({
            noMore: true,
            hasMore: false,
            moreDataText: "没有更多了"
        })
    } else {
        pageModel.setData({
            hasMore: true
        })
    }
    pageModel.setData({
        isLoading: false
    })
}

const isEqual = function( x, y ) { // 判断2个对象是否相等
    if ( x === y ) {
        return true
    }
    if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) {
        return false
    }
    if ( x.constructor !== y.constructor ) {
        return false
    }
    for ( var p in x ) {
        if ( x.hasOwnProperty( p ) ) {
            if ( ! y.hasOwnProperty( p ) ) {
                return false
            }
            if ( x[ p ] === y[ p ] ) {
                continue
            }
            if ( typeof( x[ p ] ) !== "object" ) {
                return false
            }
            if ( ! Object.equals( x[ p ], y[ p ] ) ) {
                return false
            }
        }
    }
    for ( p in y ) {
        if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) {
            return false
        }
    }
    return true
}

const formatSystem = str => {
    var regIos = RegExp(/iOS/)
    var regAndroid = RegExp(/Android/)
    if(str.match(regIos)){
        return 'ios'
    }
    if(str.match(regAndroid)){
        return 'android'
    }
    return null
}

module.exports = {
  formatTime: formatTime,
  formartFileSize: formartFileSize,
  convertTime: convertTime,
  setPageMore: setPageMore,
  isEqual: isEqual,
  formatSystem: formatSystem
}
