const md_auth = require('../../../../../utils/authorize.js')
const md_common = require('../../../../../utils/common.js')
const md_reg = require('../../../../../utils/reg.js')
const md_request = require('../../../../../utils/request.js')
const md_storage = require('../../../../../utils/storage.js')
const md_app = getApp()

Page({
    data: {
        phone: '',
        code: '',
        cardObj: {},
        isSecond: false, // 是否显示倒计时
        btnText: "获取验证码",
        countdownFnc: function () {},
        version: md_app.globalData.version,
        paramObj: {
            card_no: ''
        }
    },

    /**
        生命周期函数--页面加载
        @param {Obj} option 地址栏传递参数
        @return
     */
    onLoad(option) {
        if (option.card_no) {
            this.setData({
                'paramObj.card_no': option.card_no
            })
        }
    },

    /**
        手机号获取焦点事件
        @param {Dom} e focus事件参数
        @return
     */
    focus(e) {
        md_storage.systemInfo.setKbHeight(e.detail.height)
    },

    /**
        获取验证码
        @param {Obj} t 当前页面对象this
        @param {Dom} e 点击事件事件参数
        @param {fnc} fnc 回调函数
        @return
     */
    queryCode: md_common.btnlimit((t, e, fnc) => {
        t.data.phone = t.formartPhone(t.data.phone)
        if (t.data.isSecond) {
            return
        }
        if (!md_reg.validPhone(t.data.phone)) {
            t.selectComponent('#mdDialog').tip('请输入正确的手机号')
            return
        }
        md_request.api({
            path: md_request.config.common + '/commonservice/alysms',
            data: {
                token: md_app.globalData.token,
                phone: t.data.phone,
                msg_type: 1
            },
            callback: (err, res) => {
                if (res.data.code == '200') {
                    t.selectComponent('#mdDialog').tip('验证码已发送')
                    let countdownFnc = setInterval(() => {
                        let btnText = parseInt(t.data.btnText)
                        if (--btnText === 0) {
                            clearInterval(t.data.countdownFnc)
                            t.setData({
                                isSecond: false,
                                btnText: '获取验证码'
                            })
                        } else {
                            t.setData({
                                btnText: `${btnText}s`
                            })
                        }
                    }, 1000)
                    t.setData({
                        isSecond: true,
                        btnText: '60s',
                        countdownFnc: countdownFnc
                    },()=>{
                        fnc()
                    })
                } else {
                    t.selectComponent('#mdDialog').tip(res.data.msg)
                    fnc()
                }
            }
        })
    }),

    /**
        输入手机号
        @param {dom} e 手机号
        @return
     */
    phoneChange(e) {
        if (md_common.isEmpty(e.detail.keyCode)) {
            return
        }
        e.detail.value = md_common.trimStr(e.detail.value.replace(/[^\d| ]/g, ''))
        if (e.detail.keyCode == 8) { //删除键不补全标记
            this.setData({
                phone: e.detail.value
            })
        } else {
            this.setData({
                phone: this.formartPhone(e.detail.value, ' ')
            })
        }
    },

    /**
        清空手机号
        @param
        @return
     */
    clearPhone() {
        wx.hideKeyboard({
            complete: (res) => {
                this.setData({
                    phone: ''
                })
            },
        })
    },

    /**
        输入验证码
        @param {dom} e 验证码
        @return
     */
    codeChange(e) {
        this.setData({
            code: e.detail.value
        })
    },

    /**
        登录
        @param
        @return
     */
    login() {
        this.data.phone = this.formartPhone(this.data.phone)
        if (this.data.phone == '' || this.data.code == '') {
            return
        }
        if (!md_reg.validPhone(this.data.phone)) {
            this.selectComponent('#mdDialog').tip('请输入正确的手机号')
            return
        }
        if (!md_reg.validCode(this.data.code)) {
            this.selectComponent('#mdDialog').tip('验证码不正确')
            return
        }
        md_auth.getUnionid(()=> {
            this.bindInfo(this.data.phone, this.data.code)
        })
    },

    /**
        绑定用户信息
        @param {Number} phone 手机号
        @param {Number} code 验证码
        @return
     */
    bindInfo(phone, code) {
        md_request.api({
            path: md_request.config.rih + '/LogForToken/validIdenfifyCodeByTelForLogin',
            data: {
                telNumber: phone,
                identifyCode: code
            },
            callback: (err, res) => {
                if (res.data.code != '200') {
                    this.selectComponent('#mdDialog').tip(res.data.note)
                    return
                }
                md_auth.setToken(res.data.data.Token, res.data.data.UserInfo.uiUID)
                if (this.data.paramObj.card_no) {
                    md_login.goReceive(phone, this.data.paramObj.card_no)
                } else {
                    getCurrentPages().map((item) => {
                        typeof(item.loginRefresh) == 'function' ? item.loginRefresh() : item.onLoad(item.options)
                    })
                    wx.navigateBack({
                        delta: 2
                    })
                }
            }
        })
    },

    /**
        格式化手机号
        @param {string} ephone 手机号
        @param {string} str 分隔符
        @return {string} 格式化后的手机号
     */
    formartPhone(phone, str) {
        if (str == undefined) {
            str = ''
        }
        if (phone.length > 7) {
            return phone.substring(0, 3) + str + md_common.trimStr(phone.substring(3, 8)) + str + md_common.trimStr(phone.substring(8))
        } else if (phone.length > 2) {
            return phone.substring(0, 3) + str + md_common.trimStr(phone.substring(3))
        }
        return phone
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
        生命周期函数--页面隐藏
        @param
        @return
     */
    onHide() {
        md_app.globalData.isGoLogin = true
    },

    /**
        生命周期函数--页面卸载
        @param
        @return
     */
    onUnload() {
        md_app.globalData.isGoLogin = true
    }
})