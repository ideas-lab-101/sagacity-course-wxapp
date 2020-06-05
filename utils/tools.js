/**
 * 去除html标签
 * @param {*} s 
 */
export const removeHtmltag = (str) => {
  return str.replace(/<[^>]+>/g, '')
}
/**
 * 获取url参数
 * @param {*} s 
 */
export const getQueryString = (name) => {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  const search = window.location.search.split('?')[1] || '';
  const r = search.match(reg) || [];
  return r[2];
}
/**
 * 动态引入js
 * @param {*} s 
 */
export const injectScript = (src) => {
  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.async = true;
  s.src = src;
  const t = document.getElementsByTagName('script')[0];
  t.parentNode.insertBefore(s, t);
}
/**
 * 根据url地址下载
 * @param {*} s 
 */
export const download = (url) => {
  var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  var isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;
  if (isChrome || isSafari) {
      var link = document.createElement('a');
      link.href = url;
      if (link.download !== undefined) {
          var fileName = url.substring(url.lastIndexOf('/') + 1, url.length);
          link.download = fileName;
      }
      if (document.createEvent) {
          var e = document.createEvent('MouseEvents');
          e.initEvent('click', true, true);
          link.dispatchEvent(e);
          return true;
      }
  }
  if (url.indexOf('?') === -1) {
      url += '?download';
  }
  window.open(url, '_self');
  return true;
}
/**
 * el是否包含某个class
 * @param {*} s 
 */
export const hasClass = (el, className) => {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}
/**
 * el添加某个class
 * @param {*} s 
 */
export const addClass = (el, className) => {
  if (hasClass(el, className)) {
      return
  }
  let newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}
/**
 * el去除某个class
 * @param {*} s 
 */
export const removeClass = (el, className) => {
  if (!hasClass(el, className)) {
      return
  }
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)', 'g')
  el.className = el.className.replace(reg, ' ')
}
/**
 * 获取滚动的坐标
 * @param {*} s 
 */
export const getScrollPosition = (el = window) => ({
  x: el.pageXOffset !== undefined ? el.pageXOffset : el.scrollLeft,
  y: el.pageYOffset !== undefined ? el.pageYOffset : el.scrollTop
});
/**
 * 滚动到顶部
 * @param {*} s 
 */
export const scrollToTop = () => {
  const c = document.documentElement.scrollTop || document.body.scrollTop;
  if (c > 0) {
      window.requestAnimationFrame(scrollToTop);
      window.scrollTo(0, c - c / 8);
  }
}
/**
 * el是否在视口范围内
 * @param {*} s 
 */
export const elementIsVisibleInViewport = (el, partiallyVisible = false) => {
  const { top, left, bottom, right } = el.getBoundingClientRect();
  const { innerHeight, innerWidth } = window;
  return partiallyVisible
      ? ((top > 0 && top < innerHeight) || (bottom > 0 && bottom < innerHeight)) &&
      ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
      : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
}
/**
 * 洗牌算法随机
 * @param {*} s 
 */
export const shuffle = (arr) => {
  var result = [],
      random;
  while (arr.length > 0) {
      random = Math.floor(Math.random() * arr.length);
      result.push(arr[random])
      arr.splice(random, 1)
  }
  return result;
}
/**
 * 拦截粘贴板
 * @param {*} s 
 */
export const copyTextToClipboard = (value) => {
  var textArea = document.createElement("textarea");
  textArea.style.background = 'transparent';
  textArea.value = value;
  document.body.appendChild(textArea);
  textArea.select();
  try {
      var successful = document.execCommand('copy');
  } catch (err) {
      console.log('Oops, unable to copy');
  }
  document.body.removeChild(textArea);
}
/**
 * 随机数范围
 * @param {*} s 
 */
export const random = (min, max) => {
  if (arguments.length === 2) {
      return Math.floor(min + Math.random() * ((max + 1) - min))
  } else {
      return null;
  }
}
/**
 * 将阿拉伯数字翻译成中文的大写数字
 * @param {*} s 
 */
export const numberToChinese = (num) => {
  var AA = new Array("零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十");
  var BB = new Array("", "十", "百", "仟", "萬", "億", "点", "");
  var a = ("" + num).replace(/(^0*)/g, "").split("."),
      k = 0,
      re = "";
  for (var i = a[0].length - 1; i >= 0; i--) {
      switch (k) {
          case 0:
              re = BB[7] + re;
              break;
          case 4:
              if (!new RegExp("0{4}//d{" + (a[0].length - i - 1) + "}$")
                  .test(a[0]))
                  re = BB[4] + re;
              break;
          case 8:
              re = BB[5] + re;
              BB[7] = BB[5];
              k = 0;
              break;
      }
      if (k % 4 == 2 && a[0].charAt(i + 2) != 0 && a[0].charAt(i + 1) == 0)
          re = AA[0] + re;
      if (a[0].charAt(i) != 0)
          re = AA[a[0].charAt(i)] + BB[k % 4] + re;
      k++;
  }

  if (a.length > 1) // 加上小数部分(如果有小数部分)
  {
      re += BB[6];
      for (var i = 0; i < a[1].length; i++)
          re += AA[a[1].charAt(i)];
  }
  if (re == '一十')
      re = "十";
  if (re.match(/^一/) && re.length == 3)
      re = re.replace("一", "");
  return re;
}
/**
 * 将数字转换为大写金额
 * @param {*} s 
 */
export const changeToChinese = (Num) => {
  //判断如果传递进来的不是字符的话转换为字符
  if (typeof Num == "number") {
      Num = new String(Num);
  };
  Num = Num.replace(/,/g, "") //替换tomoney()中的“,”
  Num = Num.replace(/ /g, "") //替换tomoney()中的空格
  Num = Num.replace(/￥/g, "") //替换掉可能出现的￥字符
  if (isNaN(Num)) { //验证输入的字符是否为数字
      //alert("请检查小写金额是否正确");
      return "";
  };
  //字符处理完毕后开始转换，采用前后两部分分别转换
  var part = String(Num).split(".");
  var newchar = "";
  //小数点前进行转化
  for (var i = part[0].length - 1; i >= 0; i--) {
      if (part[0].length > 10) {
          return "";
          //若数量超过拾亿单位，提示
      }
      var tmpnewchar = ""
      var perchar = part[0].charAt(i);
      switch (perchar) {
          case "0":
              tmpnewchar = "零" + tmpnewchar;
              break;
          case "1":
              tmpnewchar = "壹" + tmpnewchar;
              break;
          case "2":
              tmpnewchar = "贰" + tmpnewchar;
              break;
          case "3":
              tmpnewchar = "叁" + tmpnewchar;
              break;
          case "4":
              tmpnewchar = "肆" + tmpnewchar;
              break;
          case "5":
              tmpnewchar = "伍" + tmpnewchar;
              break;
          case "6":
              tmpnewchar = "陆" + tmpnewchar;
              break;
          case "7":
              tmpnewchar = "柒" + tmpnewchar;
              break;
          case "8":
              tmpnewchar = "捌" + tmpnewchar;
              break;
          case "9":
              tmpnewchar = "玖" + tmpnewchar;
              break;
      }
      switch (part[0].length - i - 1) {
          case 0:
              tmpnewchar = tmpnewchar + "元";
              break;
          case 1:
              if (perchar != 0) tmpnewchar = tmpnewchar + "拾";
              break;
          case 2:
              if (perchar != 0) tmpnewchar = tmpnewchar + "佰";
              break;
          case 3:
              if (perchar != 0) tmpnewchar = tmpnewchar + "仟";
              break;
          case 4:
              tmpnewchar = tmpnewchar + "万";
              break;
          case 5:
              if (perchar != 0) tmpnewchar = tmpnewchar + "拾";
              break;
          case 6:
              if (perchar != 0) tmpnewchar = tmpnewchar + "佰";
              break;
          case 7:
              if (perchar != 0) tmpnewchar = tmpnewchar + "仟";
              break;
          case 8:
              tmpnewchar = tmpnewchar + "亿";
              break;
          case 9:
              tmpnewchar = tmpnewchar + "拾";
              break;
      }
      var newchar = tmpnewchar + newchar;
  }
  //小数点之后进行转化
  if (Num.indexOf(".") != -1) {
      if (part[1].length > 2) {
          // alert("小数点之后只能保留两位,系统将自动截断");
          part[1] = part[1].substr(0, 2)
      }
      for (i = 0; i < part[1].length; i++) {
          tmpnewchar = ""
          perchar = part[1].charAt(i)
          switch (perchar) {
              case "0":
                  tmpnewchar = "零" + tmpnewchar;
                  break;
              case "1":
                  tmpnewchar = "壹" + tmpnewchar;
                  break;
              case "2":
                  tmpnewchar = "贰" + tmpnewchar;
                  break;
              case "3":
                  tmpnewchar = "叁" + tmpnewchar;
                  break;
              case "4":
                  tmpnewchar = "肆" + tmpnewchar;
                  break;
              case "5":
                  tmpnewchar = "伍" + tmpnewchar;
                  break;
              case "6":
                  tmpnewchar = "陆" + tmpnewchar;
                  break;
              case "7":
                  tmpnewchar = "柒" + tmpnewchar;
                  break;
              case "8":
                  tmpnewchar = "捌" + tmpnewchar;
                  break;
              case "9":
                  tmpnewchar = "玖" + tmpnewchar;
                  break;
          }
          if (i == 0) tmpnewchar = tmpnewchar + "角";
          if (i == 1) tmpnewchar = tmpnewchar + "分";
          newchar = newchar + tmpnewchar;
      }
  }
  //替换所有无用汉字
  while (newchar.search("零零") != -1)
      newchar = newchar.replace("零零", "零");
  newchar = newchar.replace("零亿", "亿");
  newchar = newchar.replace("亿万", "亿");
  newchar = newchar.replace("零万", "万");
  newchar = newchar.replace("零元", "元");
  newchar = newchar.replace("零角", "");
  newchar = newchar.replace("零分", "");
  if (newchar.charAt(newchar.length - 1) == "元") {
      newchar = newchar + "整"
  }
  return newchar;
}
/**
 * 判断一个元素是否在数组中
 * @param {*} s 
 */
export const contains = (arr, val) => {
  return arr.indexOf(val) != -1 ? true : false;
}
/**
 * 数组排序，{type} 1：从小到大 2：从大到小 3：随机
 * @param {*} s 
 */
export const sort = (arr, type = 1) => {
  return arr.sort((a, b) => {
      switch (type) {
          case 1:
              return a - b;
          case 2:
              return b - a;
          case 3:
              return Math.random() - 0.5;
          default:
              return arr;
      }
  })
}
/**
 * 去重
 * @param {*} s 
 */
export const unique = (arr) => {
  if (Array.hasOwnProperty('from')) {
      return Array.from(new Set(arr));
  } else {
      var n = {}, r = [];
      for (var i = 0; i < arr.length; i++) {
          if (!n[arr[i]]) {
              n[arr[i]] = true;
              r.push(arr[i]);
          }
      }
      return r;
  }
}
/**
 * 求两个集合的并集
 * @param {*} s 
 */
export const union = (a, b) => {
  var newArr = a.concat(b);
  return this.unique(newArr);
}
/**
 * 求两个集合的交集
 * @param {*} s 
 */
export const intersect = (a, b) => {
  var _this = this;
  a = this.unique(a);
  return this.map(a, function (o) {
      return _this.contains(b, o) ? o : null;
  });
}
/**
 * 删除其中一个元素
 * @param {*} s 
 */
export const remove = (arr, ele) => {
  var index = arr.indexOf(ele);
  if (index > -1) {
      arr.splice(index, 1);
  }
  return arr;
}
/**
 * 将类数组转换为数组
 * @param {*} s 
 */
export const formArray = (ary) => {
  var arr = [];
  if (Array.isArray(ary)) {
      arr = ary;
  } else {
      arr = Array.prototype.slice.call(ary);
  };
  return arr;
}
/**
 * 最大值
 * @param {*} s 
 */
export const max = (arr) => {
  return Math.max.apply(null, arr);
}
/**
 * 最小值
 * @param {*} s 
 */
export const min = (arr) => {
  return Math.min.apply(null, arr);
}
/**
 * 求和
 * @param {*} s 
 */
export const sum = (arr) => {
  return arr.reduce((pre, cur) => {
      return pre + cur
  })
}
/**
 * 平均值
 * @param {*} s 
 */
export const average = (arr) => {
  return this.sum(arr) / arr.length
}
/**
 * 去除空格,type: 1-所有空格 2-前后空格 3-前空格 4-后空格
 * @param {*} s 
 */
export const trim = (str, type) => {
  type = type || 1
  switch (type) {
      case 1:
          return str.replace(/\s+/g, "");
      case 2:
          return str.replace(/(^\s*)|(\s*$)/g, "");
      case 3:
          return str.replace(/(^\s*)/g, "");
      case 4:
          return str.replace(/(\s*$)/g, "");
      default:
          return str;
  }
}
/**
 * 字符转换，type: 1:首字母大写 2：首字母小写 3：大小写转换 4：全部大写 5：全部小写
 * @param {*} s 
 */
export const changeCase = (str, type) => {
  type = type || 4
  switch (type) {
      case 1:
          return str.replace(/\b\w+\b/g, function (word) {
              return word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase();

          });
      case 2:
          return str.replace(/\b\w+\b/g, function (word) {
              return word.substring(0, 1).toLowerCase() + word.substring(1).toUpperCase();
          });
      case 3:
          return str.split('').map(function (word) {
              if (/[a-z]/.test(word)) {
                  return word.toUpperCase();
              } else {
                  return word.toLowerCase()
              }
          }).join('')
      case 4:
          return str.toUpperCase();
      case 5:
          return str.toLowerCase();
      default:
          return str;
  }
}
/**
 * 函数节流器
 * @param {*} s 
 */
export const debouncer = (fn, time, interval = 200) => {
  if (time - (window.debounceTimestamp || 0) > interval) {
      fn && fn();
      window.debounceTimestamp = time;
  }
}
/**
 * 在字符串中插入新字符串
 */
export const insertStr = (soure, index, newStr) => {
  var str = soure.slice(0, index) + newStr + soure.slice(index);
  return str;
}
/**
 * 判断两个对象是否键值相同
 * @param {*} s 
 */
export const isObjectEqual = (a, b) => {
  var aProps = Object.getOwnPropertyNames(a);
  var bProps = Object.getOwnPropertyNames(b);

  if (aProps.length !== bProps.length) {
      return false;
  }

  for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];

      if (a[propName] !== b[propName]) {
          return false;
      }
  }
  return true;
}
/**
 * 16进制颜色转RGBRGBA字符串
 * @param {*} s 
 */
export const colorToRGB = (val, opa) => {

  var pattern = /^(#?)[a-fA-F0-9]{6}$/; //16进制颜色值校验规则
  var isOpa = typeof opa == 'number'; //判断是否有设置不透明度

  if (!pattern.test(val)) { //如果值不符合规则返回空字符
      return '';
  }

  var v = val.replace(/#/, ''); //如果有#号先去除#号
  var rgbArr = [];
  var rgbStr = '';

  for (var i = 0; i < 3; i++) {
      var item = v.substring(i * 2, i * 2 + 2);
      var num = parseInt(item, 16);
      rgbArr.push(num);
  }

  rgbStr = rgbArr.join();
  rgbStr = 'rgb' + (isOpa ? 'a' : '') + '(' + rgbStr + (isOpa ? ',' + opa : '') + ')';
  return rgbStr;
}
 /**
 * 追加url参数
 * @param {*} s 
 */
export const appendQuery = (url, key, value) => {
  var options = key;
  if (typeof options == 'string') {
      options = {};
      options[key] = value;
  }
  options = $.param(options);
  if (url.includes('?')) {
      url += '&' + options
  } else {
      url += '?' + options
  }
  return url;
}