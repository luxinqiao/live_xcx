/**
 * 文件描述：正则校验工具类
 * 创建人：赵志银
 * 创建时间：2019-08-15
*/

/**
    校验手机号
    @param {String} phone 手机号
    @return {Boolean} 是否校验通过
*/
const validPhone = function (phone) {
    if (/^(1)[0-9]{10}$/.test(phone)) {
        return true
    }
    return false
}

/**
    校验验证码
    @param {String} code 验证码
    @return {Boolean} 是否校验通过
*/
const validCode = function (code) {
    if (/^\d{6}$/.test(code)) {
        return true
    }
    return false
}

/**
    校验邮箱
    @param {String} email 邮箱
    @return {Boolean} 是否校验通过
*/
const validEmail = function (email) {
    if (new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$").test(email)) {
        return true
    }
    return false
}

/**
    校验身份证号码
    @param {String} card 身份证号
    @return {Boolean} 是否校验通过
*/
const validCard = function (card) {
    if (/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(card)) {
        return true
    }
    return false
}

module.exports = {
    validPhone: validPhone,
    validCode: validCode,
    validEmail: validEmail,
    validCard: validCard
}