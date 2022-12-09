/**
    文件描述：登录授权
    创建人：卢信桥
    创建时间：2020-10-19
    授权说明：
    1.微信一键登录需要：unionid、userInfo.nickName、userInfo.avatarUrl
    2.手机号验证码登录不需要授权数据
    3.订单支付需要：openid
    4.若干页面需要：token
    5.意见反馈需要：uuid
    获取方法：
    1.getUserProfile和<button open-type='getUserInfo'>获取userInfo
    2.wx.login返回code获取unionid、openid（调用getUnionid）
    3.微信一键登录/手机号验证码登录获取token、uuid
 */

/**
    文件描述：登录插件
    创建人：赵志银
    创建时间：2019-08-15
 */
const md_request = require('./request.js')
const md_common = require('./common.js')
const md_app = getApp()

/**
    获取unionid&openid（使用原则：需要获取unionid/openid的页面，1.onLoad调用，2.下一步操作前调用）
    @param {function} callback 回调函数
    @return 
 */
function getUnionid(callback) {
    if (md_app.globalData.unionid && md_app.globalData.openid) {
        typeof(callback) == 'function' ? callback() : ''
        return
    }
    wx.login({
        success: res => {
            md_request.api({
                path: md_request.config.lesson + '/wechat/unionid',
                data: {
                    code: res.code
                },
                callback: (err, res) => {
                    if (res.data.code == '200') {
                        md_app.globalData.unionid = res.data.data.unionid
                        md_app.globalData.openid = res.data.data.openid
                        wx.setStorageSync('unionid', res.data.data.unionid)
                        wx.setStorageSync('openid',  res.data.data.openid)
                        typeof(callback) == 'function' ? callback() : ''
                    }
                }
            })
        }
    })
}

/**
    校验登录
    @param {function} success 成功回调
    @return
 */
function checkLogin(success) {
    if (md_common.isEmpty(md_app.globalData.token)) {
        wx.navigateTo({
            url: '/pages/main/sys/login/index/index'
        })
    } else {
        md_request.api({
            path: md_request.config.liveCommon + '/token/check',
            data: {
                token: md_app.globalData.token
            },
            isTourist: true,
            callback: (err, res) => {
                if (res.data.code != '200') {
                    if (md_app.globalData.isGoLogin) {
                        md_app.globalData.isGoLogin = false
                        wx.showToast({
                            title: '登录已失效，请重新登录',
                            icon: 'none',
                            duration: 2000,
                            mask: true
                        })
                        setTimeout(() => {
                            wx.navigateTo({
                                url: '/pages/main/sys/login/index/index'
                            })
                        }, 2000)
                    }
                }
            }
        })
        typeof(success) == 'function' ? success() : ''
    }
}

/**
    微信授权-获取你微信绑定的手机号
    @param {Object} param 授权参数
    @return
 */
function getPhoneNumber({code, encryptedData, iv, success, error}) {
    md_request.api({
        path: md_request.config.lesson + '/wechat/dephone',
        data: {
            code: code,
            encryptedData: encryptedData,
            iv: iv
        },
        callback: (err, res) => {
            if (res.data.code == '200') {
                typeof(success) == 'function' ? success(res.data.data.phoneNumber) : ''
            } else {
                typeof(error) == 'function' ? error('授权失败，请重新点击并授权') : ''
            }
        }
    })
}

/**
    刷新登录相关参数
    @param {String} token token
    @param {String} uuid uuid
    @return
 */
function setToken(token, uuid) {
    md_app.globalData.token = token
    md_app.globalData.uuid = uuid
    wx.setStorageSync('token', token)
    wx.setStorageSync('uuid', uuid)
    wx.setStorageSync('wyimAccid', '')
    wx.setStorageSync('wyimToken', '')
}

module.exports = {
    getUnionid: getUnionid,
    checkLogin: checkLogin,
    getPhoneNumber: getPhoneNumber,
    setToken: setToken
}