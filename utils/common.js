/**
 * 文件描述：公共工具类
 * 创建人：赵志银
 * 创建时间：2019-08-15
 */
const md_app = getApp()
/**
	转换时间
	@param {Date} date 日期
	@return {String} 新时间
*/
const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
/**
	转换格式
	@param {String} n 原格式
	@return {String} 新格式
*/
const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

/**
    去除字符串左右空格
    @param {String}str 原字符串
    @return {String} 去除左右空格后的字符串
*/
const trimStr = function(str) {
    if (str === undefined || str === 'undefined') {
        return ''
    }
    if (typeof(str) == 'number') {
        str = str.toString()
    }
    return str.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '')
}
/**
    是否为空
    @param {String}a 变量
    @return {Boolean} 是否为空
*/
const isEmpty = function(a) {
    if (a === undefined || a === 'undefined' || a === null || a === 'null' || a === '' ||
        JSON.stringify(a) === '{}' || JSON.stringify(a) === '[]') {
        return true
    }
    return false
}
/**
	价格分转元
	@param {String}price 分
	@return {String} 元
*/
const priceTransition = (price) => {
    if (isEmpty(price)) {
        return ''
    }
    return parseInt(price) / 100
}
/**
	日期格式化
	@param {Date}time 时间
	@param {String}format 时间格式
	@return {String} 新格式日期
*/
const dateFormat = function(time, format) {
    if (isEmpty(time)) {
        return ''
    }
    const t = new Date(time)
    const tf = function(i) {
        return (i < 10 ? '0' : '') + i
    }
    return format.replace(/YYYY|MM|DD|hh|mm|ss/g, function(a) {
        switch (a) {
            case 'YYYY':
                return tf(t.getFullYear())
                break
            case 'MM':
                return tf(t.getMonth() + 1)
                break
            case 'DD':
                return tf(t.getDate())
                break
            case 'hh':
                return tf(t.getHours())
                break
            case 'mm':
                return tf(t.getMinutes())
                break
            case 'ss':
                return tf(t.getSeconds())
                break
        }
    })
}
/**
	日期反格式化
	@param {String}dateStr 日期
	@param {String}separator 分隔符
	@return {Date} 新格式日期
*/
const parseDate = function(dateStr, separator) {
    if (!separator) {
        separator = '-'
    }
    const dateArr = dateStr.split(separator)
    const year = parseInt(dateArr[0])
    let month
    if (dateArr[1].indexOf('0') == 0) {
        month = parseInt(dateArr[1].substring(1))
    } else {
        month = parseInt(dateArr[1])
    }
    const day = parseInt(dateArr[2])
    return new Date(year, month - 1, day)
}

/**
	图片压缩
	@param {Number}width 宽
    @param {Number}height 高
	@return {String} 压缩链接
*/
const compressImg = (width, height) => {
    return '?x-oss-process=image/auto-orient,0/resize,m_lfit,h_' + height + ',w_' + width
}
/**
	头像压缩
	@param
	@return {String} 压缩链接
*/
const compressAvatar = () => {
    return '?x-oss-process=image/auto-orient,0/resize,m_lfit,h_200,w_200'
}
/**
    转换头像
    @param {String} avatar 原头像
    @return {String} 新头像
*/
const convertAvatar = (avatar) => {
    if (isEmpty(avatar)) {
        return 'https://rightinhome.oss-cn-hangzhou.aliyuncs.com/sns/avatar.png' + compressImg(50, 50)
    }
    if (avatar.indexOf('http:') == -1 && avatar.indexOf('https:') == -1) {
        avatar = 'https://rightinhome.oss-cn-hangzhou.aliyuncs.com/' + avatar
    }
    return avatar + compressImg(50, 50)
}

/**
	获取上一页
	@param
	@return {Object} 上一页
*/
const getPrePage = () => {
    const pages = getCurrentPages()
    return pages[pages.length - 2]
}
/**
	刷新上一页
	@param
	@return
*/
const refreshPrePage = () => {
    const prePage = getPrePage()
    prePage.onLoad(prePage.options)
}
/**
	获取当前页
	@param
	@return {Object} 当前页
*/
const getCurrPage = () => {
    const pages = getCurrentPages()
    return pages[pages.length - 1]
}

/**
	编码链接参数
	@param {String} param 原参数
	@return {String} 新参数
*/
const encodeParamMark = (param) => {
    if (isEmpty(param)) {
        return ''
    }
    param = param.replace(/\?/g, '%99')
    param = param.replace(/\&/g, '%77')
    return param
}
/**
	解码链接参数
	@param {String} param 原参数
	@return {String} 新参数
*/
const decodeParamMark = (param) => {
    if (isEmpty(param)) {
        return ''
    }
    param = param.replace(/%99/g, '?')
    param = param.replace(/%77/g, '&')
    return param
}

/**
    过滤字符串
    @param {String} str 需要过滤的字符串
    @param {Number} contNum 连续字符串数量
    @return {String} 符合要求的字符串
*/
const filterString = function (str, contNum) {
    let filterStr = str.replace(/[^\w/]/ig, '')
    let num = Math.floor((filterStr.length - 1) / contNum)
    if (num <= 0) {
        return filterStr
    } else {
        let airStr = ''
        for (let i = 0; i < num; i++) {
            airStr = `${airStr}${filterStr.substr(contNum * i, contNum)} `
        }
        airStr = `${airStr}${filterStr.substr(contNum * num)}`
        return airStr
    }
}

/**
	数组去重
	@param {Array} param 原参数
	@return {String} 新参数
*/
const uniqueArr = (arr, key) => {
    let newArr = []
    for (let i = 0; i < arr.length; i++) {
        if (!isInArr(newArr, key, arr[i][key])) {
            newArr.push(arr[i])
        }
    }
    return newArr
}
/**
	数组是否包含元素
	@param {Array} arr 原参数
    @param {String} key 键
    @param {String} value 值
	@return {String} 是否包含
*/
const isInArr = (arr, key, value) => {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][key] == value) {
            return true
        }
    }
    return false
}

/**
	按钮点击限制(自主设置可点击--函数节流)
	@param {Fun} callback 回调函数
*/
const btnlimit = function (callback) {
    var isClick
    return function (...arg) {
        if(!isClick){
            isClick = true
            callback(this, arg[0], function(){
                isClick = false
            })
        }
    }
}
/**
	按钮点击限制(设置时间--函数节流)
    @param {Fun} callback 回调函数
    @param {Number} time 间隔时间
*/
const btnlimit_time = function (callback, time) {
    var startTime
    return function (...arg) {
        if(!startTime){
            startTime = new Date().getTime()
            callback(this, arg[0])
        }
        if(new Date().getTime() - startTime > time){
            startTime = new Date().getTime()
            callback(this, arg[0])
        }
    }
}
/**
	按钮点击限制(全局变量形式)
	@param {Fun} callback 回调函数
*/
const btnlimit_var = function (callback) {
    if(md_app.globalData.isClick){
        return
    }
    callback()
}
/**
	解除按钮点击限制
	@param
*/
const removebtnlimit = function() {
    md_app.globalData.isClick = false
}

/**
	节流
	@param {Function} callback 回调函数
	@return {Function} 节流函数
 */
const limit = callback => {
    let isPass = true
    return function() {
        if (isPass) {
            isPass = false
            callback.call(this, function() {
                isPass = true
            }, ...arguments)
        }
    }
}

//模块化导出
module.exports = {
    formatTime: formatTime,
    trimStr: trimStr,
    isEmpty: isEmpty,
    priceTransition: priceTransition,
    dateFormat: dateFormat,
    parseDate: parseDate,
    compressImg: compressImg,
    compressAvatar: compressAvatar,
    convertAvatar: convertAvatar,
    getPrePage: getPrePage,
    refreshPrePage: refreshPrePage,
    getCurrPage: getCurrPage,
    encodeParamMark: encodeParamMark,
    decodeParamMark: decodeParamMark,
    filterString: filterString,
    uniqueArr: uniqueArr,
    isInArr: isInArr,
    btnlimit: btnlimit,
    btnlimit_time: btnlimit_time,
    btnlimit_var: btnlimit_var,
    removebtnlimit: removebtnlimit,
    limit: limit
}