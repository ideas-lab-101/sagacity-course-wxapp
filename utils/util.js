const formatTime = (date, symbol) => {
  if (!symbol) {
      symbol = '-'
  }
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join(symbol) + ' ' + [hour, minute, second].map(formatNumber).join(symbol)
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formatFileSize = bytes => {
    if (bytes > 1024) {
          if (bytes > 1024 * 1024) {  // 以MB为单位
              return (bytes / 1024 / 1024).toFixed(2) + 'MB'
        } else {                      // 以KB为单位
              return (bytes / 1024).toFixed(2) + 'KB'
          }
      } else {
          return bytes + 'B'
      }
}

const convertTime = time => {
    if (!time) {
        return ''
    }
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

    if (now.getFullYear() > d.getFullYear()) {
        return Number(d.getFullYear()) + '年' + Number(d.getMonth() + 1) + '月' + Number(d.getDate()) + '日 ' + Number(d.getHours()) + '时' + Number(d.getMinutes()) + '分'
    }
    return Number(d.getMonth() + 1) + '月' + Number(d.getDate()) + '日 ' + Number(d.getHours()) + '时' + Number(d.getMinutes()) + '分'
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

const isTabPage = route => {
    return route.includes('tabBar')
}

module.exports = {
  formatTime,
  formatFileSize,
  convertTime,
  isEqual,
  isTabPage
}
