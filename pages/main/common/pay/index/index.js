const md_request = require('../../../../../utils/request.js')
const md_auth = require('../../../../../utils/authorize.js')
const md_app = getApp()

Page({
    data: {
        isChoose: false,
        isCheck: false,
        isPay: true,
        price: 0,
        realPrice: 0,
        paramObj: {},
        realGold: 0, //花费的澜渟币
        gold: 0 //账户的澜渟币
    },

    /**
     * 生命周期函数--监听页面加载
     * @param {object} options 链接参数
     * @return
     */
    onLoad: function (options) {
        this.setData({
            paramObj: options,
            price: (Number(options.price) / 100).toFixed(2),
            realPrice: Number(options.price)
        })
        if (options.type == 1 || options.type == 5){
            this.setData({
                isCheck: true
            })
        }
        if (options.type == 2 || options.type == 3 || options.type == 11){
            this.setData({
                isChoose: true
            })
        }
        if (!(options.type == 1 || options.type == 5)){
            this.initMoney()
        }
        md_auth.getUnionid()
    },

    /**
     *  初始化澜渟币
     *  @param 
     *  @return 
     */
    initMoney: function () {
        md_request.api({
            path:md_request.config.rec + '/account/info', 
            data:{
                'token': md_app.globalData.token
            }, 
            callback:(err, res) => {
                if (res.data.code == '200') {
                    this.setData({
                        gold: Number(res.data.data.balance)
                    })
                    if (this.data.gold != 0) {
                        if (this.data.gold >= this.data.realPrice) {
                            this.setData({
                                realPrice: 0,
                                realGold: this.data.realPrice
                            })
                        } else if (this.data.gold < this.data.realPrice) {
                            this.setData({
                                realPrice: this.data.realPrice - this.data.gold,
                                realGold: this.data.gold
                            })
                        }
                    }
                }
            }
        })
    },

    /**
     *  选择澜渟币
     *  @param 
     *  @return 
     */
    chooseMoney: function () {
        this.setData({
            isChoose: !this.data.isChoose
        })
        if (this.data.isChoose) {
            if (this.data.gold != 0) {
                if (this.data.gold >= this.data.realPrice) {
                    this.setData({
                        realPrice: 0,
                        realGold: this.data.realPrice
                    })
                } else if (this.data.gold < this.data.realPrice) {
                    this.setData({
                        realPrice: this.data.realPrice - this.data.gold,
                        realGold: this.data.gold
                    })
                }
            }
        } else {
            this.setData({
                realPrice: Number(this.data.paramObj.price),
                realGold: 0
            })
        }
    },

    /**
     *  选择支付方式
     *  @param 
     *  @return 
     */
    choosePay: function () {
        if (this.data.paramObj.type != 1 && this.data.paramObj.type != 5){
            this.setData({
                isCheck: !this.data.isCheck
            })
        }
    },

    /**
     *  支付
     *  @param
     *  @return
     */
    pay: function () {
        if (this.data.realPrice > 0){
            if (!this.data.isCheck || !this.data.isPay) {
                return
            }
        }
        this.setData({
            isPay: false
        })
        md_auth.getUnionid(() => {
            this.payCommon()
        })
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
        if(this.data.paramObj.type == 1){
            paramObj.meet_code = this.data.paramObj.meet_code
        }
        if (this.data.realGold > 0) {
            if (this.data.realGold >= this.data.paramObj.price) {
                paramObj.pay_method = '5' //澜渟币支付
                paramObj.gold = this.data.realGold
            } else if (this.data.realGold < this.data.paramObj.price) {
                paramObj.pay_method = '1' //微信支付
                paramObj.gold = this.data.realGold
            }
        } else {
            paramObj.pay_method = '1'
        }
        if (this.data.paramObj.couponcode){
            paramObj.coupon_code = this.data.paramObj.couponcode
        }
        const that = this
        md_request.api({
            path: md_request.config.pay + '/v1/pay', 
            data:paramObj, 
            callback:(err, payRes) => {
                if (payRes.data.code == 200) {
                    wx.requestPayment({
                        timeStamp: payRes.data.data.timeStamp,
                        nonceStr: payRes.data.data.nonceStr,
                        package: payRes.data.data.package,
                        signType: 'MD5',
                        paySign: payRes.data.data.paySign,
                        success(wxRes) {
                            that.selectComponent('#mdDialog').tip('支付中...', ()=>{}, 3000)
                            setTimeout(()=>{
                                md_request.api({
                                    path: md_request.config.pay + '/v1/success',
                                    data: {
                                        token: md_app.globalData.token,
                                        order_id: payRes.data.data.order_id
                                    },
                                    callback: (err, checkRes) => {
                                        that.setData({
                                            isPay: true
                                        })
                                        if (checkRes.data.code == 200) {
                                            if (that.data.paramObj.type == 2 || that.data.paramObj.type == 3 || that.data.paramObj.type == 11) {
                                                wx.navigateBack({
                                                    delta: 2,
                                                    success: () => {
                                                        pages[pages.length - 3].refresh()
                                                    }
                                                })
                                            }
                                        } else {
                                            that.selectComponent('#mdDialog').tip(checkRes.data.note)
                                        }
                                    }
                                })
                            },3000)
                        },
                        fail(wxRes) {
                            that.selectComponent('#mdDialog').tip('支付失败')
                            that.setData({
                                isPay: true
                            })
                        }
                    })
                } else if (payRes.data.code == 208 || payRes.data.code == 308) { //免密支付,澜渟币支付
                    if (this.data.paramObj.type == 2 || this.data.paramObj.type == 3 || this.data.paramObj.type == 11){
                        wx.navigateBack({
                            delta: 2,
                            success: () => {
                                pages[pages.length - 3].refresh()
                            }
                        })
                    }
                    this.setData({
                        isPay: true
                    })
                } else {
                    that.selectComponent('#mdDialog').tip(payRes.data.note)
                    this.setData({
                        isPay: true
                    })
                }
            }
        })
    }
})