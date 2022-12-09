var md_request = require('../../../../../../utils/request.js')
var md_common = require('../../../../../../utils/common.js')

var md_app = getApp()

Page({
    data: {
        type: '',
        sign: '',
        isSign: false,
        remark: '',
        isRemark: false
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
    initPage(options) {
        if (options.type == 'sign') {
            wx.setNavigationBarTitle({
                title: '个性签名'
            })
            this.setData({
                type: 'sign',
                sign: options.sign
            })
            if (!md_common.isEmpty(this.data.sign)) {
                this.setData({
                    isSign: true
                })
            }
        } else if (options.type == 'remark') {
            wx.setNavigationBarTitle({
                title: '个人简介'
            })
            this.setData({
                type: 'remark',
                remark: options.remark
            })
            if (!md_common.isEmpty(this.data.remark)) {
                this.setData({
                    isRemark: true
                })
            }
        }
    },

    /**
     * 实时监控输入-个性签名
     * @param {dom} e data-的值
     * @return
     */
    signChange: function(e) {
        this.setData({
            sign: md_common.trimStr(e.detail.value)
        })
        if (md_common.isEmpty(this.data.sign)) {
            this.setData({
                isSign: false
            })
        } else {
            this.setData({
                isSign: true
            })
        }
    },

    /**
     * 实时监控输入-个人简介
     * @param {dom} e data-的值
     * @return
     */
    remarkChange: function(e) {
        this.setData({
            remark: md_common.trimStr(e.detail.value)
        })
        if (md_common.isEmpty(this.data.remark)) {
            this.setData({
                isRemark: false
            })
        } else {
            this.setData({
                isRemark: true
            })
        }
    },

    /**
     * 修改
     * @param {dom} e data-的值
     * @return
     */
    complete: function(e) {
        let dataObj = {
            "token": md_app.globalData.token
        }
        let url = md_request.config.rih
        if (this.data.type == 'remark') {
            dataObj.uiRemark = this.data.remark
            url += '/UserInfo/updateUserInfo'
        }
        if (e.currentTarget.dataset.flag) {
            md_request.api({
                path: url,
                data: dataObj,
                callback: (err, res) => {
                    if (res.data.code == '200') {
                        md_common.getPrePage().initData()
                        wx.navigateBack({
                            delta: 1
                        })
                    } else {
                        this.selectComponent('#mdDialog').tip(res.data.msg)
                    }
                }
            });
        }
    },

    /**
     * 修改个性签名
     * @param {dom} e data-的值
     * @return
     */
    completeSign: function (e) {
        if (e.currentTarget.dataset.flag) {
            md_request.api({
                path: md_request.config.rih + '/UserInfo/setUserSign',
                data: {
                    "token": md_app.globalData.token,
                    "sign": this.data.sign
                },
                callback: (err, res) => {
                    if (res.data.code == '200') {
                        md_common.getPrePage().initData()
                        wx.navigateBack({
                            delta: 1
                        })
                    }
                },
                isCheck: false
            });
        }
    }
})