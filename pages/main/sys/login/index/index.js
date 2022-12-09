const md_auth = require('../../../../../utils/authorize.js')
const md_request = require('../../../../../utils/request.js')
const md_common = require('../../../../../utils/common.js')
const md_login = require('../../../../../utils/login.js')
const md_app = getApp()

Page({
    data: {
        version: md_app.globalData.version,
        code: '',
        paramObj: {
            card_no: '' //卡片编号
        }
    },

    /**
        生命周期函数--页面加载
        @param {Obj} option 页面参数
        @return
     */
    onLoad(option) {
        if (option.card_no) {
            this.setData({
                'paramObj.card_no': option.card_no
            })
        }
        md_auth.getUnionid()
        this.refreshWxCode()
    },

    /**
        刷新微信code（获取5分钟内有效）
        @param
        @return
     */
    refreshWxCode() {
        wx.login({
            success: res => {
                this.setData({
                    code: res.code
                })
            }
        })
    },

    /**
        跳转-微信一键登录
        @param {dom} e 登录
        @return
     */
    goWechatLogin(e) {
        if (e.detail.errMsg == "getPhoneNumber:ok") {
            md_auth.getPhoneNumber({
                code: this.data.code,
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv,
                success: phone => {
                    md_auth.getUnionid(() => {
                        this.bindPhone(phone)
                    })
                },
                error: msg => {
                    this.selectComponent('#mdDialog').alert(msg)
                    this.refreshWxCode()
                }
            })
        } else {
            this.selectComponent('#mdDialog').alert('您已拒绝授权，请重新点击并授权')
        }
    },

    /**
        绑定手机号
        @param {Number} phone 手机号
        @return
     */
    bindPhone(phone) {
        md_request.api({
            path: md_request.config.lesson + '/wechat/bind',
            data: {
                login_type: 1,
                phone: phone,
                unionid: md_app.globalData.unionid,
                nickname: md_app.globalData.userInfo.nickName,
                headimgurl: md_app.globalData.userInfo.avatarUrl
            },
            callback: (err, res) => {
                if (res.data.code != '200') {
                    this.selectComponent('#mdDialog').tip(res.data.note)
                    return
                }
                md_auth.setToken(res.data.data.token, res.data.data.uuid)
                if (this.data.paramObj.card_no) {
                    md_login.goReceive(phone, this.data.paramObj.card_no)
                } else {
                    getCurrentPages().map((item) => {
                        typeof(item.loginRefresh) == 'function' ? item.loginRefresh() : item.onLoad(item.options)
                    })
                    wx.navigateBack({
                        delta: 1
                    })
                }
            }
        })
    },

    /**
        跳转-手机号登录
        @param
        @return
     */
    goPhoneLogin() {
        let url = '/pages/main/sys/login/phoneLogin/phoneLogin'
        if (!md_common.isEmpty(this.data.paramObj.card_no)) {
            url += '?card_no=' + this.data.paramObj.card_no
        }
        wx.navigateTo({
            url: url
        })
    },

    /**
        跳转-用户协议
        @param
        @return
     */
    goUserAgreement() {
        wx.navigateTo({
            url: '/pages/pkgs/my/pages/setting/userAgree/userAgree'
        })
    },

    /**
        生命周期函数--页面卸载
        @param
        @return
     */
    onHide() {
        md_app.globalData.isGoLogin = true
    },

    /**
        生命周期函数--页面销毁
        @param
        @return
     */
    onUnload() {
        md_app.globalData.isGoLogin = true
    }
})