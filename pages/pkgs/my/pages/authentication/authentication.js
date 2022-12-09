var md_request = require('../../../../../utils/request.js')
var md_dict = require('../../../../../utils/dict.js')
var md_app = getApp();

Page({
    data: {
        realNameAuthen: '', // 实名认证信息
        agency: '' // 机构认证信息
    },

    /**
     * 生命周期函数--监听页面显示
     * @param
     * @return
     */
    onShow: function () {
        // 获取认证信息
        this.getAuthInfo();
    },

    /**
     * 获取认证信息
     * @param 
     * @return
     */
    getAuthInfo() {
        md_request.api({
            path: md_request.config.rih + '/DoctorInfo/getAllTitleInfo',
            data: {
                "token": md_app.globalData.token
            },
            callback: (err, res) => {
                var msg = res.data.msg;
                var code = res.data.code;
                var data = res.data.data;
                if (code == '200') {
                    this.setData({
                        realNameAuthen: data.realNameInfo.real_name_step,
                        agency: data.agency.status
                    })
                } else {
                    this.selectComponent('#mdDialog').tip(msg)
                }
            }
        });
    },

    /**
     * 跳转-实名认证
     * @param
     * @return
     */
    goRealName() {
        md_request.api({
            path: md_request.config.rih + '/DoctorInfo/getAllTitleInfo',
            data: {
                "token": md_app.globalData.token
            },
            callback: (err, res) => {
                var msg = res.data.msg;
                var code = res.data.code;
                var data = res.data.data;
                if (code == '200') {
                    this.setData({
                        realNameAuthen: data.realNameInfo.real_name_step,
                        agency: data.agency.status
                    })
                    // 不是“已实名认证”则跳转实名认证页
                    if (this.data.realNameAuthen != md_dict.realName.REALNAMEHAS) {
                        wx.navigateTo({
                            url: './realName/realName?realNameAuthen=' + this.data.realNameAuthen
                        })
                    } else {
                        this.selectComponent('#mdDialog').tip('已实名认证')
                    }
                } else {
                    this.selectComponent('#mdDialog').tip(msg)
                }
            }
        });
    },

    /**
     * 跳转-机构认证
     * @param
     * @return
     */
    goAgency() {
        md_request.api({
            path: md_request.config.rih + '/DoctorInfo/getAllTitleInfo',
            data: {
                "token": md_app.globalData.token
            },
            callback: (err, res) => {
                var msg = res.data.msg;
                var code = res.data.code;
                var data = res.data.data;
                if (code == '200') {
                    this.setData({
                        realNameAuthen: data.realNameInfo.real_name_step,
                        agency: data.agency.status
                    })
                    // 不是“已机构认证”则跳转机构认证页
                    if (this.data.agency != md_dict.agency.AGENCYHAS) {
                        wx.navigateTo({
                            url: './agency/agency?agency=' + this.data.agency
                        })
                    } else {
                        this.selectComponent('#mdDialog').tip('已认证')
                    }
                } else {
                    this.selectComponent('#mdDialog').tip(msg)
                }
            }
        });
    }
})