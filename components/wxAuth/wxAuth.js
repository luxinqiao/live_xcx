const md_app = getApp()
const md_auth = require('../../utils/authorize.js')
const md_common = require('../../utils/common.js')

Component({
    properties: {
        param: {
            type: Object,
            value: {}
        },
        paramStr: {
            type: String,
            value: ''
        }
    },
    data: {
        canIUseGetUserProfile: md_app.globalData.canIUseGetUserProfile
    },

    methods: {
        /**
            处理userPorfile授权
            @param
            @return
         */
        doUserProfileAuth:md_common.limit(function(cancelLimit) {
            if (md_app.globalData.userInfo && md_app.globalData.userInfo.nickName) { //已授权
                this.checkLogin()
                cancelLimit()
                return
            }
            //推荐wx.getUserProfile，每次调用均弹窗，妥善存储用户信息避免重复弹窗
            wx.getUserProfile({
                desc: '获取用户信息',
                success: res => {
                    md_app.globalData.userInfo = res.userInfo
                    wx.setStorageSync('userInfo', res.userInfo)
                    this.checkLogin()
                },
                complete: () => {
                    cancelLimit()
                }
            })
        }),

        /**
            处理userInfo授权
            @param {dom} e 授权按钮
            @return
         */
        doUserInfoAuth:md_common.limit(function(cancelLimit, e) {
            if (md_app.globalData.userInfo.nickName && md_app.globalData.userInfo.avatarUrl) { //已授权
                this.checkLogin()
                cancelLimit()
                return
            }
            wx.getSetting({
                success: res => {
                    if (res.authSetting['scope.userInfo']) { 
                        //不推荐getUserInfo，自2021年4月13日起，不再弹窗并返回匿名信息
                        md_app.globalData.userInfo = e.detail.userInfo
                        wx.setStorageSync('userInfo', e.detail.userInfo)
                        this.checkLogin()
                    }
                },
                complete: ()=>{
                    cancelLimit()
                }
            })
        }),

        /**
            校验登录
            @param
            @return
         */
        checkLogin() {
            md_auth.checkLogin(() => {
                this.triggerEvent('next', {
                    param: this.properties.param,
                    paramStr: this.properties.paramStr
                })
            })
        }
    }
})
