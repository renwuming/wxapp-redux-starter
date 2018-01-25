import { domain as cfgDomain, AES_KEY, VALID_TIME as _VALID_TIME } from './config.js';
import deepMerge from '../vendors/deep-merge.js';
import deepClone from '../vendors/clone.js';
import CryptoJS from '../vendors/crypto-js.js';


// 获取API域名，统一配置
export const getAPIDomain = () => {
    return cfgDomain;
}

// AES对称加密、解密
export const Encrypt = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), AES_KEY).toString();
}
export const Decrypt = (data) => {
    return JSON.parse(CryptoJS.AES.decrypt(data, AES_KEY).toString(CryptoJS.enc.Utf8));
}
export const VALID_TIME = _VALID_TIME;

/**
 * 格式化时间
 * @param  {Datetime} source 时间对象
 * @param  {String} format 格式
 * @return {String}        格式化过后的时间
 */
export const formatDate = function(source, format) {
    const o = {
        'M+': source.getMonth() + 1, // 月份
        'd+': source.getDate(), // 日
        'H+': source.getHours(), // 小时
        'm+': source.getMinutes(), // 分
        's+': source.getSeconds(), // 秒
        'q+': Math.floor((source.getMonth() + 3) / 3), // 季度
        'f+': source.getMilliseconds() // 毫秒
    }
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (source.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    for (let k in o) {
        if (new RegExp('(' + k + ')').test(format)) {
            format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
        }
    }
    return format
}

export const smartDate = function(originDate) {
    let nowDate = new Date(),
        isToday = false,
        isYesterday = false,
        isPastYear = false,
        isPreviousYear = false,
        originYear, originMonth, originDay, diffMinute, formatedDate;

    originDate = new Date(originDate * 1000);
    diffMinute = Math.round((nowDate.getTime() - originDate.getTime()) / (1000 * 60));

    originYear = originDate.getFullYear();
    originMonth = originDate.getMonth() + 1;
    originDay = originDate.getDate();

    if (diffMinute <= nowDate.getHours() * 60) {
        isToday = true;
    }
    if (nowDate.getDate() - originDay == 1) {
        isYesterday = true;
    }
    if (nowDate.getFullYear() - originYear == 1) {
        isPreviousYear = true;
    } else if (nowDate.getFullYear() - originYear > 1) {
        isPastYear = true;
    }

    if (diffMinute < 30 && isToday) {
        formatedDate = '刚刚';
    } else if (diffMinute < 60 && isToday) {
        formatedDate = `${diffMinute} 分钟前`;
    } else if (diffMinute < 60 * 24 && isToday) {
        formatedDate = `${Math.floor(diffMinute / 60)} 小时前`;
    } else if (diffMinute < 60 * 24 * 2 && isYesterday) {
        formatedDate = '昨天';
    } else if (isPreviousYear) {
        formatedDate = '去年';
    } else if (isPastYear) {
        formatedDate = `${originYear} 年`;
    } else {
        formatedDate = `${originMonth} 月 ${originDay} 日`;
    }

    return formatedDate;
}

// 计算对象的大小
export const sizeof = function( object ) {
    var objects = [ object ];
    var processed = [];
    var size = 0;

    for ( var index = 0; index < objects.length; ++index ) {
        var _object = objects[ index ];
        switch ( typeof _object ) {
            case 'boolean':
                size += 4;
                break;
            case 'number':
                size += 8;
                break;
            case 'string':
                size += 2 * _object.length;
                break;
            case 'object':
                if ( _object === null ) {
                    size += 4; // assume null is the same size as a boolean
                    break;
                }
                // if it's an array, the keys add no size. if it's an object, keys
                // add size based on their length (keys must be strings according to spec)
                var keySizeFactor = Array.isArray( _object ) ? 0 : 1;

                // coerces even array indices to strings, so we can use key.length safely
                for ( var key in _object ) {
                    size += keySizeFactor * 2 * key.length;
                    if ( processed.indexOf( _object[ key ] ) === -1 ) {
                        objects.push( _object[ key ] );
                        if ( typeof _object[ key ] === 'object' ) {
                            processed.push( _object[ key ] );
                        }
                    }
                }
                break;
        }
    }

    return size;
}

export const isEmptyObject = function(obj) {
    return Object.keys(obj).length == 0 && obj.constructor == Object;
}

export const assign = function(target) {
    // We must check against these specific cases.
    if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }

    var output = Object(target);
    for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
            for (var nextKey in source) {
                if (source.hasOwnProperty(nextKey)) {
                    output[nextKey] = source[nextKey];
                }
            }
        }
    }
    return output;
};

export const merge = (oldObj, newObj, genre = 'override') => {
    let arrayMerge = function(destArr, srcArr) {
        switch (genre) {
            case 'concat':
                return destArr.concat(srcArr);
            default:
                return srcArr;
        }
    };

    return deepMerge(oldObj, newObj, { arrayMerge: arrayMerge });
}

export const clone = (originData) => deepClone(originData);

export const updateObject = (oldObj, newObj) => {
    return merge(oldObj, newObj);
}

export const getDeviceInfo = (wx) => {
    let res = wx.getSystemInfoSync(),
        windowWidth;

    windowWidth = res.windowWidth;
    return { windowWidth };
}

export const updateItemInArray = (array, itemId, updateItemCallback) => {
    const updatedArray = array.map(item => {
        if (item.id !== itemId) {
            return item;
        }

        return updateItemCallback(item);
    });

    return updatedArray;
}

let str = JSON.stringify;

export const equalObject = (o1, o2) => {
    return str(o1) === str(o2);
}

export const ArrayIncludeItem = (arr, o) => {
    return str(arr).indexOf(str(o)) > -1;
}

// 数组乱序
Array.prototype.shuffle = function() {
 for(let t, j, i = this.length; i;) {
   j = Math.floor(Math.random() * i); // 在前i项中随机取一项，与第i项交换
   t = this[--i];
   this[i] = this[j];
   this[j] = t;
 }
}


// pageConfig 方法
export const homeShare = function() {
    return {
      title: '暴走测试',
      desc: '少年，来让叔叔给你测试一下心理~',
      path: '/pages/Home/index'
    };
}


export const ShareFromMe = function() {
  let { detail, sessionid, id } = this.data,
      { title, description: desc, image: imageUrl } = detail;
  this.hidecover && this.hidecover();
  return {
    title,
    desc,
    path: `/pages/Baozou/detail-share/index?id=${id}&from=${sessionid}`
  };
}

export const ShareFromShare = function() {
  let { detail, from, id } = this.data,
      { title, description: desc, image: imageUrl } = detail;
  this.hidecover && this.hidecover();
  return {
    title,
    desc,
    path: `/pages/Baozou/detail-share/index?id=${id}&from=${from}`
  };
}
