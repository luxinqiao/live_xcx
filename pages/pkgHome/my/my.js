var md_request = require('../../../utils/request.js')
var md_common = require('../../../utils/common.js')
var md_auth = require('../../../utils/authorize.js')
var md_app = getApp()

Page({
    data: {
        isCanIUse: wx.canIUse('button.open-type.getUserInfo'),
        isShowLogin: false, //是否显示头像部分（不能默认显示未登录、体验不好）
        isLogin: false,
        useInfoObj: {},
        isHasnoRead: false,
        imgUrl: '',
        name: '',
        isSvip: false,
        isVip: false,
        isRvflag: false, // 产康师标志（默认不显示）
        isDisabled: false,
        isFirstTabChange: true // 是否首次切换tab进入“我的”主界面
    },

    /**
     * 生命周期函数--监听页面加载
     * @param
     * @return
     */
    onLoad: function () {
        if (md_common.isEmpty(md_app.globalData.unionid)) {
            md_auth.getUnionid(this.data.isCanIUse, () => {})
        }
        this.initData()
    },

    /**
     * 生命周期函数--监听页面显示
     * @param
     * @return
     */
    onShow: function () {
        this.setData({
            isDisabled: false
        })
        if (this.data.isFirstTabChange) {
            this.setData({
                isFirstTabChange: false
            })
        }else {
            this.onLoad();
        }
        this.haveNotice()
    },

    /**
     * 初始化数据
     * @param 
     * @return
     */
    initData: function () {
        md_request.api({
            path: md_request.config.rih + '/Login/getUserInfo',
            data: {
                "token": md_app.globalData.token
            },
            callback: (err, res) => {
                if (res.data.code == '200') {
                    this.setData({
                        isSvip: res.data.data.is_svip,
                        isVip: res.data.data.is_vip
                    })
                    let infoData = res.data.data.UserInfo
					// 优先显示平台昵称和头像
                    if (md_common.isEmpty(infoData.uiNickName) && !md_common.isEmpty(infoData.WeChatIDName)) {
                        this.setData({
                            name: infoData.WeChatIDName.length > 10 ? `${infoData.WeChatIDName.substring(0,10)}...` : infoData.WeChatIDName
                        })
                    } else {
                        this.setData({
                            name: infoData.uiNickName.length > 10 ? `${infoData.uiNickName.substring(0,10)}...` : infoData.uiNickName
                        })
                    }
                    if (md_common.isEmpty(infoData.uiHeadImageUrl) && !md_common.isEmpty(infoData.weChatHeadImageUrl)) {
                        this.setData({
                            imgUrl: infoData.weChatHeadImageUrl
                        })
                    } else {
                        if (md_common.isEmpty(infoData.uiHeadImageUrl)) {
                            this.setData({
                                imgUrl: "/images/home/my/default_header.png"
                            })
                        } else {
                            if (infoData.uiHeadImageUrl.indexOf('http') == -1) {
                                infoData.uiHeadImageUrl = md_request.config.oss + "/" + infoData.uiHeadImageUrl
                            }

                            this.setData({
                                imgUrl: infoData.uiHeadImageUrl
                            })
                        }
                    }
                    if (!md_common.isEmpty(infoData.recovery_utag)) {
                        this.setData({
                            isRvflag: true
                        })
                    }
                    this.setData({
                        useInfoObj: infoData,
                        isLogin: true,
                        isShowLogin: true
                    })
                    md_app.globalData.useInfoObj = infoData;
                } else if (res.data.code == '3' || res.data.code == '102' || res.data.code == '201') {
                    md_app.globalData.token = ''
                    wx.setStorage({
                        key: 'token',
                        data: ''
                    })
                    this.setData({
                        isLogin: false,
                        isShowLogin: true
                    })
                }
            },
            isCheck: true,
            isTourist: true
        });
    },

    /**
     * 新消息通知
     * @param 
     * @return
     */
    haveNotice: function () {
        md_request.api({
            path: md_request.config.common + '/note/unread',
            data: {
                "token": md_app.globalData.token
            },
            callback: (err, res) => {
                if (res.data.code == '200') {
                    if (res.data.data.system_count >= 1) {
                        this.setData({
                            isHasnoRead: true
                        })
                    } else {
                        this.setData({
                            isHasnoRead: false
                        })
                    }
                }
            },
            isCheck: true,
            isTourist: true
        });
    },

    /**
     * 我的信息
     * @param
     * @return
     */
    goChangeInfo: function () {
        if (this.data.isLogin) {
            wx.navigateTo({
                url: '/pages/pkgs/my/pages/info/index/index',
            })
        }
    },

    /**
     * 联系商家
     * @param 
     * @return
     */
    contactShop: function () {
        wx.makePhoneCall({
            phoneNumber: '400-133-5668',
        })
    },

    /**
     * 意见反馈
     * @param {dom} e 意见反馈
     * @return
     */
    goFeedback(e) {
        if (!this.data.isDisabled) {
            this.setData({
                isDisabled: true
            })
            wx.navigateTo({
                url: '/pages/pkgs/my/pages/advice/advice',
            })
        }
    },

    /**
     * 设置
     * @param {dom} e 设置
     * @return
     */
    goSetting: function (e) {
        if (!this.data.isDisabled) {
            this.setData({
                isDisabled: true
            })
            wx.navigateTo({
                url: '/pages/pkgs/my/pages/setting/index/index',
            })
        }
    },

    /**
     * 跳转-学习中心 
     * @param {dom} e 学习中心
     * @return
     */
    goStudyCenter(e) {
        if (!this.data.isDisabled) {
            this.setData({
                isDisabled: true
            })
            wx.navigateTo({
                url: '/pages/pkgs/my/pages/menuList/studyCenter/studyCenter',
            })
        }
    },


    /**
     * 系统通知
     * @param 
     * @return
     */
    goNotice: function () {
        if (this.data.isLogin) {
            wx.navigateTo({
                url: '/pages/pkgs/my/pages/message/message',
            })
        }
    },

    /**
     * 跳转-登录页
     * @param {dom} e 登录
     * @return
     */
    goLogin(e) {
        if (!this.data.isDisabled) {
            this.setData({
                isDisabled: true
            })
        }
    },


    /**
     * 跳转-认证
     * @param 
     * @return
     */
    goAuthentication() {
        if (this.data.isLogin) {
            wx.navigateTo({
                url: '/pages/pkgs/my/pages/authentication/authentication'
            })
        }
    },

     /**
     * 打开小程序
     * @param {object} e
     * @return
     */
    goXCX(e) {
        if(e.currentTarget.dataset.type == 'meet') {
            wx.navigateToMiniProgram({
                appId: 'wxf1d3105152670d7b',
                path: 'pages/meeting/index/index',
                //develop（开发版），trial（体验版），release（正式版） 
                envVersion: 'release',
                success(res) {}
            })
        } else if(e.currentTarget.dataset.type == 'train') {
            wx.navigateToMiniProgram({
                appId: 'wxf139c62f461baf31',
                path: 'pages/main/train/index/index',
                envVersion: 'release',
                success(res) {}
            })
        } else {
            wx.navigateToMiniProgram({
                appId: 'wxebed0eb22a4e21d9',
                path: 'pages/main/mall/index/index',
                envVersion: 'release',
                success(res) { }
            })
        }
    },
})