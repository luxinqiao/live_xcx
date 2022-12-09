/**
    文件描述：登录回调工具类
    创建人：卢信桥
    创建时间：2019-12-19
 */
const md_request = require('./request.js')
const md_app = getApp()

/**
    业务逻辑-领取卡券
    @param {String} phone 手机号
    @param {String} card_no 卡号
    @return
 */
const goReceive = (phone, card_no)=> {
    md_request.api({
        path: md_request.config.less + '/exchange/card-get',
        data: {
            'token': md_app.globalData.token,
            'phone': phone,
            'card_no': card_no
        },
        callback: (err, res) => {
            if (res.data.code != 200) {
                wx.showToast({
                    title: res.data.note,
                    icon: 'none',
                    duration: 2000
                })
                setTimeout(()=>{
                    wx.reLaunch({
                        url: `/pages/pkgHome/college/college`,
                    })
                },2000)
                return
            }
            let cardObj = res.data.data
            let cardName = cardObj.product_type == '17' ? 'Svip兑换成功' : (cardObj.product_type == '16' ? 'Vip兑换成功' : `兑换券兑换成功`)
            if (cardObj.product_type == '17' || cardObj.product_type == '16') {
                wx.showToast({
                    title: cardName,
                    icon: 'none',
                    duration: 2000
                })
                setTimeout(()=>{
                    wx.reLaunch({
                         url: `/pages/pkgs/my/pages/menuList/coupon/coupon?type=1`,
                    })
                },2000)
            } else {
                wx.showToast({
                    title: cardName,
                    icon: 'none',
                    duration: 2000
                })
                setTimeout(()=>{
                    wx.reLaunch({
                         url: `/pages/pkgHome/college/college?code=${cardObj.product_code}&type=${cardObj.product_type}`,
                    })
                },2000)
            }
        }
    })
}

module.exports = {
    goReceive: goReceive
}