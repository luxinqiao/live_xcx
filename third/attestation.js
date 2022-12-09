/**
 * 文件描述：验签
 * 创建人：卢信桥
 * 创建时间：2019-07-02
 */

/**
	初始化验签
    @param {Object} dataObj 原参数
	@return {Object} 验签后参数
*/
const init = function (dataObj) {
    dataObj.timestamp = new Date().getTime()
    dataObj.nonce = getNonce()
    let checkData = JSON.parse(JSON.stringify(dataObj))
    for (let key in checkData) {
        if (typeof (checkData[key]) == 'undefined' || typeof (checkData[key]) == 'object') {
            delete checkData[key]
        }
    }
    const rv_md5 = require('md5.js')
    dataObj.sign = rv_md5.initMd5(objArgs(sort_ASCII(checkData))).toUpperCase()
    return dataObj
}

/**
	获取32位随机字符串
    @param
	@return {String} 32位随机字符串
*/
function getNonce() {
    const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    let nums = ''
    for (let i = 0; i < 32; i++) {
        nums += chars[parseInt(Math.random() * 61)]
    }
    return nums
}

/**
	ASCII码排序
    @param {Object} obj 原参数
	@return {String} ASCII码排序后参数
*/
function sort_ASCII(obj) {
    let arr = [], num = 0
    for (let i in obj) {
        arr[num] = i
        num++
    }
    const sortArr = arr.sort()
    let sortObj = {}
    for (let i in sortArr) {
        sortObj[sortArr[i]] = obj[sortArr[i]]
    }
    return sortObj
}

/**
	U对象转字符串链接
    @param {Object} obj 原参数
	@return {String} 字符串链接
*/
function objArgs(obj) {
    let url = ''
    for (let name in obj) {
        url += name + '=' + obj[name] + '&' //转码并进行赋值
    }
    url += "secret=BCy94HkqITdAJDCPhw9Sjd6TwLoV8igR"
    return url
}

module.exports = {
    init: init
}