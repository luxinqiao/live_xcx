const md_request = require('../../../../../utils/request.js')
const md_common = require('../../../../../utils/common.js')
const md_app = getApp()

Page({
    data: {
        paramObj: {},
        dataArr: [],
        isNomoreShow: false
    },

    /** 
        生命周期函数--监听页面加载 
        @param {Object} options 链接参数 
        @return 
     */
    onLoad: function (options) {
        this.setData({
            paramObj: options
        })
        this.initData()
    },

    /** 
        初始化数据 
        @param 
        @return 
     */
    initData: function () {
        md_request.api({
            path: md_request.config.common + '/address/records',
            data: {
                token: md_app.globalData.token
            },
            callback: (err, res) => {
                if (res.data.code == 200) {
                    this.setData({
                        isNomoreShow: true,
                        dataArr: res.data.data
                    })
                }
            }
        })
    },

    /** 
        选中地址 
        @param {Dom} e 地址
        @return
     */
    checkAddress: function (e) {
        const address = e.currentTarget.dataset.address
        if (this.data.paramObj.isSet == '1') {
            md_common.getPrePage().setAddress(address.zone, address.content, address.contact_name, address.contact_call)
            wx.navigateBack({
                delta: 1
            })
        }
    },

    /*
        设为默认
        @param {Dom} e 地址
        @return
    */
    setDefault: function (e) {
        const item = e.currentTarget.dataset.item
        if (item.is_default == 1) {
            return
        }
        md_request.api({
            path: md_request.config.common + '/address/used',
            data: {
                token: md_app.globalData.token,
                code: item.code
            },
            callback: (err, res) => {
                if (res.data.code == 200) {
                    this.selectComponent('#mdDialog').tip('设置成功')
                    this.initData()
                }
            }
        })
    },

    /** 
        跳转-编辑地址 
        @param {Dom} e 编辑按钮 
        @return 
     */
    goEdit: function (e) {
        const item = e.currentTarget.dataset.item
        wx.navigateTo({
            url: '../edit/edit?code=' + item.code + '&name=' + item.contact_name + '&call=' + item.contact_call + '&zone=' + item.zone + '&addr=' + item.content
        })
    },
    /** 
        跳转-新增地址 
        @param {Dom} e 新增按钮 
        @return 
     */
    goAdd: function (e) {
        wx.navigateTo({
            url: '../add/add'
        })
    }
})