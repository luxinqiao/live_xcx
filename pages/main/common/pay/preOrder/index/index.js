const md_request = require('../../../../../../utils/request.js')
const md_common = require('../../../../../../utils/common.js')
const md_auth = require('../../../../../../utils/authorize.js')
const md_app = getApp()

Page({
    data: {
        paramObj: {},
        tag: '',
        price: 0,
        couponText: '请选择优惠券',
        couponDataObj: {},
        checkCouponCode: '', //选中优惠券的code
        checkCouponPrice: 0, //选中优惠券优惠价格
        realPrice: 0,
        isPay: true
    },

    /**
     * 生命周期函数--监听页面加载
     * @param {object} options 链接参数
     * @return
     */
    onLoad: function (options) {
        this.initPage(options)
        if (md_common.isEmpty(md_app.globalData.openid)) {
            md_auth.getUnionid(wx.canIUse('button.open-type.getUserInfo'))
        }
    },

    /**
     * 初始化页面
     * @param {object} options 页面链接参数
     * @return
     */
    initPage: function (options) {
        this.setData({
            paramObj: options,
            realPrice: options.price,
            'paramObj.cover': options.cover + '?x-oss-process=image/resize,m_fill,l_800' 
        })
        if (options.type==2) {
            this.setData({
                tag: '课程'
            })
        } else if (options.type == 3) {
            this.setData({
                tag: '专栏'
            })
        } else if (options.type == 11) {
            this.setData({
                tag: '直播'
            })
        }
        this.initCoupon(options)
    },

    /**
     *  下单可用优惠券
     *  @param {object} options 链接参数
     *  @return
     */
    initCoupon: function (options) {
        md_request.api({
            path: md_request.config.live +'/coupon/canuse', 
            data:{
                "token": md_app.globalData.token,
                "where_code": options.code,
                "for_where": options.type,
                "pay_count": options.price
            }, 
            callback:(err, res) => {
                if (res.data.code == '200') {
                    let data = res.data.data
                    if (data.length>0) {
                        md_app.globalData.couponCode = data[0].code
                        md_app.globalData.couponPrice = data[0].amount
                        this.setData({
                            checkCouponCode: md_app.globalData.couponCode,
                            checkCouponPrice: md_app.globalData.couponPrice
                        })
                        let real = this.data.paramObj.price - md_app.globalData.couponPrice
                        if (real >0) {
                            this.setData({
                                realPrice: real
                            })
                        } else {
                            this.setData({
                                realPrice: 0
                            })
                        }
                    } else {
                        md_app.globalData.couponCode = ''
                        md_app.globalData.couponPrice = 0
                    }
                    this.setData({
                        couponDataObj: res.data.data
                    })
                }
            }
        })
    },

    /**
     *  跳转优惠券页面
     *  @param 
     *  @return
     */
    seeCoupon: function() {
        if(this.data.couponDataObj.length>0) {
            wx.navigateTo({
                url: '/pages/main/common/pay/preOrder/coupon/coupon?code=' + this.data.paramObj.code + '&priice=' + this.data.paramObj.price + '&type=' + this.data.paramObj.type
            })
        }
    },

    /**
     *  获取选择的优惠券
     *  @param 
     *  @return
     */
    getCoupon: function() {
        this.setData({
            checkCouponCode: md_app.globalData.couponCode,
            checkCouponPrice: md_app.globalData.couponPrice
        })
        let real = this.data.paramObj.price - md_app.globalData.couponPrice
        if (real > 0) {
            this.setData({
                realPrice: real
            })
        } else {
            this.setData({
                realPrice: 0
            })
        }
    },

    /**
     *  去支付
     *  @param {dom} e 课程
     *  @return
     */
    goPay: function (e) {
        if (this.data.realPrice == 0){
            if (!this.data.isPay) {
                return
            }
            this.setData({
                isPay: false
            })
            this.payCommon()
        }else{
            wx.navigateTo({
                url: '/pages/main/common/pay/index/index?code=' + e.currentTarget.dataset.code + '&price=' + this.data.realPrice + '&type=' + this.data.paramObj.type + '&couponcode=' + this.data.checkCouponCode + '&meet_code=' + this.data.paramObj.meet_code
                    + '&name=' + this.data.paramObj.name
            })
        }
    },
    /**
     *  支付-项目公共部分
     *  @param
     *  @return
     */
    payCommon: function () {
        var pages = getCurrentPages(); // 当前页面
        let paramObj = {
            openid: md_app.globalData.openid,
            token: md_app.globalData.token,
            product_type: this.data.paramObj.type,
            product_code: this.data.paramObj.code,
            product_count: '1'
        }
        if (this.data.paramObj.type == 1) {
            paramObj.meet_code = this.data.paramObj.meet_code
        }
        paramObj.pay_method = '1'
        paramObj.coupon_code = this.data.checkCouponCode
        const that = this
        md_request.api({
            path: md_request.config.pay + '/v1/pay',
            data: paramObj,
            callback: (err, payRes) => {
                if (payRes.data.code == 208) { //免密支付
                    this.selectComponent('#mdDialog').tip('支付成功', ()=>{},1000)
                    setTimeout(()=>{
                        if (this.data.paramObj.type == 2 || this.data.paramObj.type == 3 || this.data.paramObj.type == 11) {
                            wx.navigateBack({
                                delta: 1,
                                success: () => {
                                    pages[pages.length - 2].refresh()
                                }
                            })             
                        }
                        this.setData({
                            isPay: true
                        })
                    },1000)
                } else {
                    this.selectComponent('#mdDialog').tip(payRes.data.note)
                    this.setData({
                        isPay: true
                    })
                }
            }
        })
    }
})