const md_request = require('../../../../../../utils/request.js')
const md_common = require('../../../../../../utils/common.js')
const md_app = getApp()

Page({
    data: {
        paramObj: {},
        couponDataObj: {},
        checkCouponCode: '', //选中优惠券的code
        checkCouponPrice: 0 //选中优惠券优惠价格
    },

    /**
     * 生命周期函数--监听页面加载
     * @param {object} options 链接参数
     * @return
     */
    onLoad: function (options) {
        this.initPage(options)
    },

    /**
     * 初始化页面
     * @param {object} options 链接参数
     * @return
     */
    initPage: function (options) {
        this.setData({
            paramObj: options
        })
        this.initCoupon(this.data.paramObj)
    },

    /**
     *  下单可用优惠券
     *  @param {object} options 链接参数
     *  @return
     */
    initCoupon: function (options) {
        md_request.api({
            path: md_request.config.live+'/coupon/canuse', 
            data: {
                "token": md_app.globalData.token,
                "where_code": options.code,
                "for_where": options.type, 
                "pay_count": options.priice
            }, 
            callback: (err, res) => {
                if (res.data.code == '200') {
                    for (let inx in res.data.data) {
                        res.data.data[inx].begin_date = res.data.data[inx].begin_date.replace(/-/g, '.')
                        res.data.data[inx].end_date = res.data.data[inx].end_date.replace(/-/g, '.')
                        if (md_app.globalData.couponCode == res.data.data[inx].code) {
                            res.data.data[inx].use = true
                            this.setData({
                                checkCouponCode: res.data.data[inx].code,
                                checkCouponPrice: res.data.data[inx].amount
                            })
                        } else {
                            res.data.data[inx].use = false
                        }
                    }
                    this.setData({
                        couponDataObj: res.data.data
                    })
                }
            }
        })
    },

    /**
     *  选择优惠券
     *  @param {Dom} e 优惠券
     *  @return
     */
    chooseCoupon: function (e) {
        let index = e.currentTarget.dataset.index
        let use = e.currentTarget.dataset.use
        let code = e.currentTarget.dataset.code
        let couponPrice = e.currentTarget.dataset.price
        let allCoupon = this.data.couponDataObj
        let price = this.data.price
        for (let inx in allCoupon) {
            allCoupon[inx].use = false
        }
        let checkItem = 'couponDataObj[' + index + '].use'
        this.setData({
            couponDataObj: allCoupon,
            [checkItem]: !use,
        })
        if (use) {
            this.setData({
                checkCouponCode: '',
                checkCouponPrice: 0
            })
        } else {
            this.setData({
                checkCouponCode: code,
                checkCouponPrice: couponPrice
            })
        }
    },

    /**
     *  返回下单页
     *  @param 
     *  @return
     */
    goBack: function() {
        md_app.globalData.couponCode = this.data.checkCouponCode
        md_app.globalData.couponPrice = this.data.checkCouponPrice
        md_common.getPrePage().getCoupon()
        wx.navigateBack({
            delta: 1
        })
    }
})