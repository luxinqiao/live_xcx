var md_app = getApp()

Page({
    data: {
        lastTime: 0,
        isVersion: true,
        version: md_app.globalData.version,
        subVersion: md_app.globalData.subVersion
    },

    /**
     * 生命周期函数--监听页面加载
     * @param
     * @return
     */
    onLoad: function() {
        this.initPage()
    },

    /**
     * 初始化页面
     * @param 
     * @return
     */
    initPage: function() {
        this.setData({
            lastTime: 0,
            isVersion: true
        })
    },

    /**
     * 双击切换版本号
     * @param {dom} e 版本号
     * @return
     */
    getVersion: function (e) {
        let thisTime = e.timeStamp
        let lastTime = this.data.lastTime // 获取上次点击时间 默认为0
        let isVersion = this.data.isVersion
        if (lastTime != 0) {
            if (thisTime - this.data.lastTime < 300)
                this.setData({
                    isVersion: !isVersion
                })
        }
        this.setData({
            lastTime: thisTime
        })
    },

    /**
     * 退出登录
     * @param 
     * @return
     */
    logout: function () {
        this.selectComponent('#mdDialog').confirm('确认退出登录吗？', '取消', () => { }, '确认', () => {
            md_app.globalData.token = ''
            md_app.globalData.isLogin = false
            wx.setStorageSync('token', '')
            wx.reLaunch({
                url: '/pages/pkgHome/my/my'
            })
        })
    },

    /**
     * 跳转-地址管理
     * @param 
     * @return
     */
    goAddress() {
        wx.navigateTo({
            url: '/pages/main/common/address/list/list',
        })
    },

    /**
     * 跳转-用户协议
     * @param 
     * @return
     */
    goUserAgreement: function() {
        wx.navigateTo({
            url: '../userAgree/userAgree'
        })
    },

    /**
     * 跳转-关于我们
     * @param 
     * @return
     */
    goUs: function() {
        wx.navigateTo({
            url: '../aboutUs/aboutUs'
        })
    }
})