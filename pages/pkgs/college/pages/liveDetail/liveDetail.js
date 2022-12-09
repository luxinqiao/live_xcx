const md_request = require('../../../../../utils/request.js')
const md_auth = require('../../../../../utils/authorize.js')
const md_common = require('../../../../../utils/common.js')
const md_dict = require('../../../../../utils/dict.js')
const md_app = getApp()
let liveTimer

Page({
    data: {
        isLoading: true,
        paramObj: {},
        liveDataObj: {},
        couponObj: {},
        dateArr: [],
        moveUp: 0,
        isCountdown: false,
        password: '',
        isExceed: false, //是否超过两行
        isExpand: false, //是否暂开
        isEnter: false,
        isFirst: true,
        isShow: false,
        isHide: false,
        isGoLive: false,
        platform: md_app.globalData.platform,
        liveType: '',
        isIphoneX: md_app.globalData.isIphoneX
    },
    /**
     * 页面加载方法
     * @param {object} options 页面链接参数
     * @return
     */
    onLoad: function (options) {
        this.setData({
            isLoading: true
        })
        if (!md_common.isEmpty(options.scene)) {
            let paramStr = decodeURIComponent(options.scene)
            let paramArr = paramStr.split(',')
            this.setData({
                isLoading: true
            })
            this.selectComponent('#mdDialog').loading()
            this.initData({
                code: paramArr[0],
                type: paramArr[1] ? paramArr[1] : ''
            })
        } else if (!md_common.isEmpty(options.q)){ //普通二维码
            let src = decodeURIComponent(options.q)
            let srcpath = src.substring(src.indexOf('?') + 1)
            srcpath = srcpath.split('&')
            for (let i in srcpath) {
                if (srcpath[i].indexOf('live_code=') != -1) {
                    this.initData({
                        code: srcpath[i].substring(srcpath[i].indexOf('=') + 1)
                    })
                }
            }
        } else {
            this.initData(options)
        }
        this.selectComponent('#mdDialog').loading()
    },
    /**
     * 小程序生命周期函数-页面销毁时触发
     * @param
     * @return
     */
    onUnload() {
        clearInterval(liveTimer)
    },
    /**
     * 小程序生命周期函数-页面隐藏时触发
     * @param
     * @return
     */
    onHide() {
        this.setData({
            isHide: true,
            isGoLive: false
        })
    },
    /**
     * 小程序生命周期函数-页面显示时触发
     * @param
     * @return
     */
    onShow() {
        this.setData({
            isEnter: false
        })
        if (this.data.isHide) {
            clearInterval(liveTimer)
            this.setData({
                isFirst: true
            })
            this.getLiveDetail()
        }
    },
    /**
     * 初始化数据
     * @param {object} options 页面链接参数
     * @return
     */
    initData: function (options) {
        this.setData({
            paramObj: options
        })
        this.getLiveDetail()
        this.initCoupon()
    },

    /**
     * 获取直播详情数据
     * @param
     * @return
     */
    getLiveDetail: function () {
        md_request.api({
            path: md_request.config.lesson + '/source/live',
            data: {
                "token": md_app.globalData.token,
                "live_code": this.data.paramObj.code,
            },
            callback: (err, res) => {
                if (res.data.code == '214') {
                    this.selectComponent('#mdDialog').tip(res.data.note)
                    setTimeout(() => {
                        wx.navigateBack({
                            delta: 1
                        })
                    }, 1500)
                    return
                }
                if (res.data.code == '200') {
                    this.selectComponent('#mdDialog').close()
                    let left_time = parseInt(res.data.data.left_time)
                    if (res.data.data.status == 0) {
                        if (this.data.isFirst) {
                            this.setData({
                                dateArr: this.processTime(left_time),
                                isCountdown: true,
                                isFirst: false
                            })
                            liveTimer = setInterval(() => {
                                this.setData({
                                    dateArr: this.processTime(--left_time)
                                })
                                if (left_time <= 0) {
                                    this.setData({
                                        "liveDataObj.status": "1"
                                    })
                                    clearInterval(liveTimer)
                                    this.getLiveDetail()
                                    const pages = getCurrentPages()
                                    pages.map((item) => {
                                        if (item.route === 'pages/pkgs/college/pages/classifyList/liveList/list') {
                                            item.onLoad(item.options)
                                        }
                                    })
                                    let data = this.data.liveDataObj
                                    if (data.btn.route == '0') {
                                        if (!this.data.isEnter) {
                                            this.checkIn()
                                        }
                                    }
                                }
                            }, 1000)
                        }
                    } else {
                        this.setData({
                            isCountdown: false
                        })
                    }
                    let liveDataObj = res.data.data
                    liveDataObj.original_price = Number(liveDataObj.original_price)
                    liveDataObj.price = Number(liveDataObj.price)
                    liveDataObj.btn.btn_name = liveDataObj.btn.btn_name.replace('直播', '')
                    this.setData({
                        liveDataObj: res.data.data,
                        isLoading: false
                    })
                    let widthMagn = 1
                    try {
                        const res = wx.getSystemInfoSync()
                        widthMagn: res.windowWidth / 375
                    } catch (e) {}
                    let query = this.createSelectorQuery()
                    query.select('#liveDetail_replace').boundingClientRect()
                    query.exec(function (rect) {
                        if (rect[0] === null) return;
                        if (rect[0].height > widthMagn * 36) {
                            this.setData({
                                isExceed: true,
                            })
                        }
                    }.bind(this))
                    this.setData({
                        liveType: res.data.data.is_broad
                    })
                }
            }
        })
    },
    /**
     * 转换时间
     * @param {Number} second 秒数
     * @return {Array} 时间的数组
     */
    processTime(second) {
        let day = Math.floor(second / 86400)
        let remain = second % 86400
        let hour = Math.floor(remain / 3600)
        remain = remain % 3600
        let minute = Math.floor(remain / 60)
        return [day, hour, minute, second % 60]
    },
    /**
     * 可领优惠券
     * @param 
     * @return
     */
    initCoupon: function () {
        let dataObj = {
            'token': md_app.globalData.token,
            'where_code': this.data.paramObj.code
        }
        dataObj.for_where = 11
        md_request.api({
            path: md_request.config.live + '/coupon/canget',
            data: dataObj,
            callback: (err, res) => {
                if (res.data.code == '200') {
                    let data = res.data.data
                    for (let inx in data) {
                        data[inx].begin_date = data[inx].begin_date.replace(/-/g, '.')
                        data[inx].end_date = data[inx].end_date.replace(/-/g, '.')
                    }
                    this.setData({
                        couponObj: data
                    })
                }
            }
        })
    },
    /**
     * 出现优惠券弹窗
     * @param {dom} e 事件参数
     * @return
     */
    seeCoupon: function (e) {
        this.setData({
            isCouponshow: true
        })
        this.selectComponent('#mdPopup').showPopup()
    },
    /**
     * 优惠券弹窗常驻
     * @param
     * @return
     */
    openCoupon: function () {
        this.setData({
            isCouponshow: true
        })
    },
    /**
     * 输入框获取焦点事件
     * @param
     * @return
     */
    focus() {
        this.setData({
            moveUp: -160
        })
    },
    /**
     * 输入框失去焦点事件
     * @param
     * @return
     */
    blur() {
        this.setData({
            moveUp: 0
        })
    },
    /**
     * 关闭优惠券弹窗
     * @param
     * @return
     */
    closeCoupon: function () {
        if (md_app.globalData.token) {
            this.setData({
                isCouponshow: false
            })
        }
        this.selectComponent('#mdPopup').hidePopup()
    },
    /**
     * 领取优惠券
     * @param {dom} e 优惠券
     * @return
     */
    getCoupon: function (e) {
        md_request.api({
            path: md_request.config.live + '/coupon/get',
            data: {
                'token': md_app.globalData.token,
                'coupon_code': e.currentTarget.dataset.code
            },
            callback: (err, res) => {
                if (res.data.code == '200') {
                    this.initCoupon()
                }
            }
        })
    },
    /**
     * 预约成功提示
     * @param 
     * @return
     */
    prompt() {
        if (this.data.liveDataObj.btn.btn_name == '预约') {
            this.selectComponent('#mdDialog').tip('预约成功')
            this.liveSub()
        } else {
            this.getLiveDetail()
            this.initCoupon()
        }
    },
    /**
     * 支付完刷新页面
     * @param 
     * @return
     */
    refresh: function () {
        this.setData({
            isGoLive: true
        })
        this.checkIn()
    },
    /**
     * 进入课堂
     * @param {Obj} t 当前页面对象this
     * @param {dom} e 按钮传参
     * @param {Fnc} callbackFn 设置按钮可点击的回调 
     * @return
     */
    goLiveCourse: md_common.btnlimit((t, e, callbackFn) => {
        let route = e.currentTarget.dataset.route
        let data = t.data.liveDataObj
        if (route == '0') {
            t.setData({
                isGoLive: true
            })
        } else if (route == '1') {
            if (data.is_authed == '1') {
                t.setData({
                    isGoLive: true
                })
            }
        } else if (route == '2') {
            t.setData({
                isGoLive: true
            })
        }
        if (route == '0') { // 进入课堂
            t.checkIn(callbackFn)
        } else if (route == '1') { // 密码进入
            if (data.is_authed == '0') { //是否授权
                t.setData({
                    isShow: true
                })
                callbackFn()
            } else if (data.is_authed == '1') {
                t.checkIn(callbackFn)
            }
        } else if (route == '3') { // 购买/观看直播
            if (md_app.globalData.token) {
                wx.navigateTo({
                    url: '/pages/main/common/pay/preOrder/index/index?code=' + t.data.paramObj.code + '&name=' + t.data.liveDataObj.name + '&cover=' + t.data.liveDataObj.cover + '&price=' + t.data.liveDataObj.price + '&type=11'
                })
            }
            callbackFn()
        } else if (route == '2') { // 预约直播
            t.checkIn(callbackFn)
        }
    }),
    /**
     * 去直播间详情页
     * @param
     * @return
     */
    goStudio() {
        wx.navigateTo({
            url: '/pages/pkgs/my/pages/menuList/liveRoom/liveRoomDetail/liveRoomDetail?roomCode=' + this.data.liveDataObj.room_code
        })
    },
    /**
     * 直播预约
     * @param
     * @return
     */
    liveSub() {
        let data = this.data.liveDataObj
        md_request.api({
            path: md_request.config.lesson + '/live/sub',
            data: {
                "token": md_app.globalData.token,
                "code": this.data.paramObj.code,
            },
            callback: (err, res) => {
                this.getLiveDetail()
                this.initCoupon()
            }
        })
    },
    /**
     * 关注 / 取消直播间
     * @param {dom} e 事件参数
     * @return
     */
    goAttention(e) {
        let data = {
            ...this.data.liveDataObj
        }
        let is_follow
        if (data.room_info.is_follow == '1') {
            this.selectComponent('#mdDialog').confirm('确定取消关注？', '取消', () => {
                this.selectComponent('#mdDialog').close()
            }, '确定', () => {
                is_follow = '0'
                data.room_info.is_follow = '2'
                md_request.api({
                    path: md_request.config.live + '/room/setfollow',
                    data: {
                        "token": md_app.globalData.token,
                        "room_code": data.room_code,
                        "status": is_follow
                    },
                    callback: (err, res) => {
                        if (res.data.code != '200') {
                            this.selectComponent('#mdDialog').tip(res.data.note)
                            return
                        }
                        this.getLiveDetail()
                        this.pageUpdate()
                    }
                })
            })
        } else {
            is_follow = '1'
            data.room_info.is_follow = '1'
            md_request.api({
                path: md_request.config.live + '/room/setfollow',
                data: {
                    "token": md_app.globalData.token,
                    "room_code": data.room_code,
                    "status": is_follow
                },
                callback: (err, res) => {
                    if (res.data.code != '200') {
                        this.selectComponent('#mdDialog').tip(res.data.note)
                        return
                    }
                    this.getLiveDetail()
                    this.pageUpdate()
                }
            })
        }
    },
    /**
     * catch事件替代函数，无任何用处
     * @param 
     * @return
     */
    useless() {},
    /**
     * 输入框内容改变事件
     * @param {dom} e 事件参数
     * @return
     */
    passwordChange(e) {
        let value = e.detail.value
        this.setData({
            password: value.replace(/[^\w\.\/]/ig, '')
        })
    },
    /**
     * 展开事件
     * @param
     * @return
     */
    expand() {
        this.setData({
            isExpand: !this.data.isExpand
        })
    },
    /**
     * 取消按钮事件
     * @param
     * @return
     */
    cancel() {
        this.setData({
            isShow: false
        })
    },
    /**
     * 确认按钮事件
     * @param
     * @return
     */
    confim() {
        let data = this.data.liveDataObj
        if (this.data.password == '') {
            wx.showToast({
                title: '密码不能为空',
                icon: 'none'
            })
            return
        }
        this.setData({
            isShow: false
        })
        this.setData({
            isGoLive: true
        })
        this.checkIn()
    },
    /**
     * 进入课堂
     * @param {Fnc} callbackFn 设置按钮可点击的回调
     * @return
     */
    checkIn(callbackFn) {
        let liveData = this.data.liveDataObj
        md_request.api({
            path: md_request.config.live + '/live/checkIn',
            data: {
                "token": md_app.globalData.token,
                "live_code": this.data.paramObj.code,
                "password": this.data.password
            },
            callback: (err, res) => {
                if (res.data.code != '200') {
                    this.setData({
                        isGoLive: false
                    })
                    wx.showToast({
                        title: res.data.note,
                        icon: 'none'
                    })
                    this.setData({
                        password: ''
                    })
                    if (typeof (callbackFn) == 'function') {
                        callbackFn()
                    }
                    return
                }
                if (res.data.data.is_authed == '1') {
                    this.prompt()
                    this.setData({
                        isEnter: true,
                        isShow: false
                    })
                    if (this.data.liveType == md_dict.liveType.AUDIO) {
                        wx.navigateTo({
                            url: '/pages/pkgs/college/pages/live/audio/index/index?roomId=' + liveData.wyroom + '&liveName=' + liveData.name + '&roomName=' + liveData.room_info.name + '&avatar=' + liveData.room_info.cover + '&pop=' + res.data.data.read_count + '&status=' + res.data.data.status + '&isPullHistory=' + res.data.data.history_enable + '&liveCode=' + liveData.code + '&room_code=' + liveData.room_code + '&ppt_cover=' + liveData.ppt_cover + '&isInBegintime=' + res.data.data.in_begin_time
                        })
                    } else if (this.data.liveType == md_dict.liveType.VIDEO) {
                        let url = '/pages/pkgs/college/pages/live/video/video?roomId=' + liveData.wyroom + '&liveName=' + liveData.name + '&roomName=' + liveData.room_info.name + '&avatar=' + liveData.room_info.cover + '&pop=' + res.data.data.read_count + '&status=' + res.data.data.status + '&isPullHistory=' + res.data.data.history_enable + '&liveCode=' + liveData.code + '&room_code=' + liveData.room_code + '&startTime=' + liveData.start_at + '&cover=' + liveData.cover + '&pushStatus=' + res.data.data.push_status + '&vid=' + res.data.data.vid
                        if (!md_common.isEmpty(res.data.data.urls) && !md_common.isEmpty(res.data.data.urls.full)) {
                            url += '&currLive=' + encodeURIComponent(res.data.data.urls.full)
                        }
                        wx.navigateTo({
                            url: url
                        })
                    }
                    if (typeof (callbackFn) == 'function') {
                        callbackFn()
                    }
                } else if (res.data.data.is_authed == '0') {
                    wx.showToast({
                        title: '听课密码错误',
                        icon: 'none'
                    })
                    if (typeof (callbackFn) == 'function') {
                        callbackFn()
                    }
                }
            }
        })
    },
    /**
     * ios去客服回话
     * @param {dom} e 按钮传参
     * @return
     */
    goContact(e) {
        this.selectComponent('#mdDialog').customize()
    },
    /**
     * 关闭去客服弹框
     * @param
     * @return
     */
    closeDialog() {
        this.selectComponent('#mdDialog').close()
    },
    /**
     * 用户点击右上角分享
     * @param
     * @return
     */
    onShareAppMessage: function () {
        return {
            title: this.data.liveDataObj.name,
            imageUrl: this.data.liveDataObj.poster
        }
    },
    /**
     * 更新上级页面
     * @param 
     * @return
     */
    pageUpdate() {
        const pages = getCurrentPages()
        pages.map((item) => {
            if (item.route === 'pages/pkgs/my/pages/menuList/liveRoom/liveRoomDetail/liveRoomDetail' || item.route === 'pages/pkgs/my/pages/menuList/liveRoom/liveRoomList/liveRoomList' || item.route === 'pages/pkgs/my/pages/menuList/liveRoom/liveRoomList/liveRoomList') {
                item.onLoad(item.options)
            }
        })
    }
})