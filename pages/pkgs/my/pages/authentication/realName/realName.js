const md_request = require('../../../../../../utils/request.js')
const md_common = require('../../../../../../utils/common.js')
const md_upImg = require('../../../../../../utils/uploadImg.js')
const md_dict = require('../../../../../../utils/dict.js')
const md_reg = require('../../../../../../utils/reg.js')
const md_app = getApp()

Page({
    data: {
        realNameAuthen: '', // 实名认证信息
        isShowFail: false, // 是否显示失败说明
        uiRemark: '', // 失败说明
        name: '', // 姓名
        card: '', // 身份证号
        frontImg: '/pages/pkgs/my/images/authentication/frontSide.png', // 正面图（用于前端展示）
        frontImgCut: '', // 不带oss前缀的地址（用于传给后台）
        reverseImg: '/pages/pkgs/my/images/authentication/reverseSide.png', // 反面图（用于前端展示）
        reverseImgCut: '', // 不带oss前缀的地址（用于传给后台）
        btnText: '提交认证' // 提交按钮文字
    },

    /**
     * 生命周期函数--监听页面加载
     * @param {Object} options 链接参数
     * @return
     */
    onLoad: function (options) {
        this.initData(options);
    },

    /**
     * 初始化数据
     * @param {Object} options 链接参数
     * @return
     */
    initData(options) {
        this.setData({
            realNameAuthen: options.realNameAuthen
        })

        if (options.realNameAuthen != md_dict.realName.REALNAMENEVER) {
            this.setData({
                btnText: '重新提交认证'
            })
            // 获取实名认证信息（不是“未实名认证则需要获取用户实名认证信息”）
            this.getRealNameInfo();
        }
    },

    /**
     * 获取实名认证信息
     * @param
     * @return
     */
    getRealNameInfo() {
        md_request.api({
            path: md_request.config.rih + '/UserInfo/userRealNameInfo',
            data: {
                "token": md_app.globalData.token
            },
            callback: (err, res) => {
                var msg = res.data.msg;
                var code = res.data.code;
                var data = res.data.data;
                if (code == '200') {
                    if (!md_common.isEmpty(data.id_card_frontfile)) {
                        if (data.id_card_frontfile.search("https") == -1) {
                            this.setData({
                                'frontImg': md_request.config.oss + "/" + data.id_card_frontfile,
                                'frontImgCut': data.id_card_frontfile
                            })
                        } else {
                            var splitArr = data.image.split('com/');
                            this.setData({
                                'frontImg': data.id_card_frontfile,
                                'frontImgCut': splitArr[1]
                            })
                        }
                    }

                    if (!md_common.isEmpty(data.id_card_frontfile)) {
                        if (data.id_card_backfile.search("https") == -1) {
                            this.setData({
                                'reverseImg': md_request.config.oss + "/" + data.id_card_backfile,
                                'reverseImgCut': data.id_card_backfile
                            })
                        } else {
                            var splitArr = data.image.split('com/');
                            this.setData({
                                'reverseImg': data.id_card_backfile,
                                'reverseImgCut': splitArr[1]
                            })
                        }
                    }

                    // 实名认证失败
                    if (data.uiRealNameAuthentication == md_dict.realName.REALNAMEFAIL) {
                        if (!md_common.isEmpty(data.uiRemark)) {
                            this.setData({
                                'isShowFail': true, 
                                'uiRemark': data.uiRemark,
                            })
                        }
                    }

                    this.setData({
                        'name': data.id_realname,
                        'card': data.id_number
                    })
                } else {
                    this.selectComponent('#mdDialog').tip(msg)
                }
            }
        });
    },

    /**
     * 上传正面图
     * @param 
     * @return
     */
    uploadFront: function () {
        let _this = this
        md_upImg.uploadImg(1, function (res, urlCut) {
            _this.setData({
                'frontImg': res[0],
                "frontImgCut": urlCut[0]
            })
        })
    },

    /**
     * 上传反面图
     * @param 
     * @return
     */
    uploadReverse: function () {
        let _this = this
        md_upImg.uploadImg(1, function (res, urlCut) {
            _this.setData({
                'reverseImg': res[0],
                "reverseImgCut": urlCut[0]
            })
        })
    },

    /**
     * 监听姓名输入
     * @param {dom} e 姓名输入
     * @return
     */
    inputName: function (e) {
        this.setData({
            name: md_common.trimStr(e.detail.value)
        })
    },

    /**
     * 监听身份证号输入
     * @param {dom} e 身份证号输入
     * @return
     */
    inputCard: function (e) {
        this.setData({
            card: md_common.trimStr(e.detail.value)
        })
    },

    /**
     * 提交
     * @param 
     * @return
     */
    submit: function () {
        if (md_common.isEmpty(this.data.name)) {
            this.selectComponent('#mdDialog').tip('请输入姓名');
        } else if (!md_reg.validCard(this.data.card)) {
            this.selectComponent('#mdDialog').tip('请输入正确的身份证号');
        } else if (this.data.frontImg == '/pages/pkgs/my/images/authentication/frontSide.png') {
            this.selectComponent('#mdDialog').tip('请上传身份证');
        } else if (this.data.reverseImg == '/pages/pkgs/my/images/authentication/reverseSide.png') {
            this.selectComponent('#mdDialog').tip('请上传身份证');
        }else {
            md_request.api({
                path: md_request.config.rih + '/UserInfo/userSubmitRealNameAuthenticationInfo',
                data: {
                    "token": md_app.globalData.token,
                    "id_realname": this.data.name,
                    "id_number": this.data.card,
                    "id_card_frontfile": this.data.frontImgCut,
                    "id_card_backfile": this.data.reverseImgCut,
                },
                callback: (err, res) => {
                    var msg = res.data.msg;
                    var code = res.data.code;
                    if (code == '200') {
                        md_app.globalData.useInfoObj = {
                            uiRealNameAuthentication: '1'
                        }
                        this.selectComponent('#mdDialog').alert('认证申请提交成功，我们将在5个工作日内进行认证，请关注认证结果。', '确定', () => {
                            this.selectComponent('#mdDialog').close()
                            wx.navigateBack({
                                delta: 1
                            })
                        })
                    } else {
                        this.selectComponent('#mdDialog').tip(msg)
                    }
                }
            });
        }
    }
})