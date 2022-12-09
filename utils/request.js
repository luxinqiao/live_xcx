/**
    文件描述：接口请求工具类
    创建人：赵志银
    创建时间：2019-08-15
 */

const requestType = 'test'
var requestConfig = {
    appKey: '41ca86957ee5c3056d9a407f828a0764',
    oss: 'https://rightinhome.oss-cn-hangzhou.aliyuncs.com'
}
if (requestType == 'test') {
    requestConfig.common = 'https://api-rih.ltjk.info/v1'
    requestConfig.lesson = 'https://api-rih.ltjk.info/v2'
    requestConfig.less = 'https://api-rih.ltjk.info/v1'
    requestConfig.rih = 'https://api-rih.ltjk.info/API/V1'
    requestConfig.sts = 'https://api-rih.ltjk.info/sts-server/sts.php'
    requestConfig.pay = 'https://api-pay.ltjk.info'
    requestConfig.rec = 'https://api-rih.ltjk.info/v1'
    requestConfig.live = 'https://api-rih.ltjk.info/v1'
    requestConfig.liveCommon = 'https://api-rih.ltjk.info/common'
	requestConfig.meet = 'https://api-rih.ltjk.info/v2'
} else if (requestType == 'prod') {
    requestConfig.common = 'https://api-common.wrightin.com/v1'
    requestConfig.lesson = 'https://api-lesson.wrightin.com/v2'
    requestConfig.less = 'https://api-lesson.wrightin.com/v1'
    requestConfig.rih = 'https://api-rih.wrightin.com/API/V1'
    requestConfig.sts = 'https://api-rih.wrightin.com/sts-server/sts.php'
    requestConfig.pay = 'https://api-pay.wrightin.com'
    requestConfig.rec = 'https://api-rec.wrightin.com/v1'
    requestConfig.live = 'https://api-live.wrightin.com/v1'
    requestConfig.liveCommon = 'https://api-live.wrightin.com/common'
	requestConfig.meet = 'https://api-meet.wrightin.com/v2'
}

/**
	请求接口
	@param {Object} {
        {String} path 请求路径,
        {Object} data 请求参数,
        {Function} callback 回调方法,
        {Boolean} isCheck 是否校验验签
        {Boolean} isTourist 游客模式
    } 请求参数
	@return
*/
function requestApi({path, data, callback, isCheck, isTourist}) {
    wx.request({
        url: path,
        header: {
            'REQUESTAPP': '1',
            'REQUESTCLIENT': '56',
            'VERSIONFORAPP': '1.0.2',
            'content-type': 'application/json'
        },
        method: 'POST',
        data: isCheck == false ? data : require('../third/attestation.js').init(data),
        success: function (res) {
            if (!isTourist){
                if (res.data.code == 201 || res.data.code == 3 || res.data.code == 102) {
                    wx.setStorage({
                        key: "token",
                        data: ""
                    })
                    md_app.globalData.token = ''
                    md_app.globalData.uuid = ''
                    wx.setStorageSync('token', '')
                    wx.setStorageSync('uuid', '')
                    wx.setStorageSync('wyimAccid', '')
                    wx.setStorageSync('wyimToken', '')
                    if (getApp().globalData.isGoLogin == true) {
                        getApp().globalData.isGoLogin = false
                        wx.showToast({
                            title: '登录已失效，请重新登录',
                            icon: 'none',
                            duration: 2000
                        })
                        setTimeout(() => {
                            wx.navigateTo({
                                url: '/pages/main/sys/login/index/index'
                            })
                        }, 2000)
                    }
                    return
                }
            }
            typeof callback == "function" && callback(null, res)
        },
        fail: function (res) {
            typeof callback == "function" && callback(res)
        }
    })
}

module.exports = {
    api: requestApi,
    config: requestConfig
}