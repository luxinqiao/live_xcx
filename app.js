/**
 * 文件描述：app.js
 * 创建人：赵志银
 * 创建时间：2019-08-15
 */
var md_request = require('./utils/request.js')

App({
    /**
     * 监听小程序初始化
     * @param 
     * @return
     */
    onLaunch: function(options) {
        //判断设备类型 android ios windows
        if(((wx.getSystemInfoSync().system).toUpperCase()).indexOf('ANDROID') != -1){
            this.globalData.platform = 'Android'
        }else if(((wx.getSystemInfoSync().system).toUpperCase()).indexOf('IOS') != -1){
            this.globalData.platform = 'Ios'
            if(((wx.getSystemInfoSync().model).toUpperCase()).indexOf('IPHONE X') != -1) {
                this.globalData.isIphoneX = true
            }
        }else if(((wx.getSystemInfoSync().platform).toLowerCase()).indexOf('windows') != -1){
            this.globalData.platform = 'windows'
        }
        //获取顶部信息栏以及胶囊
        wx.getSystemInfo({
            success: (res) => {
                let btn = wx.getMenuButtonBoundingClientRect();
                this.globalData.statusBarHeight = res.statusBarHeight + btn.height + (btn.top - res.statusBarHeight) * 2;
                this.globalData.menuButton = btn;
            }
        })
        this.getVersion()
        //监听网络状态改变
        wx.onNetworkStatusChange((res)=>{
            if(!res.isConnected){
                wx.showToast({
                    title: '网络连接不可用',
                    icon: 'none',
                    duration: 2000
                  })
                  this.isNetwork = false
            }else{
                if(!this.isNetwork){
                    wx.showToast({
                        title: '网络已连接',
                        icon: 'none',
                        duration: 2000
                      })
                      this.isNetwork = true
                }
            }
        })
        //获取微信授权
        if (wx.getUserProfile) {
            this.globalData.canIUseGetUserProfile = true
        }
    },
    /**
     * 获取当前版本
     * @param
     * @return
     */
    getVersion() {
        md_request.api({
            path: md_request.config.lesson + '/source/home',
            data: {
                'token': ''
            },
            callback: (err, res) => {
                if (res.data.code == '200') {
                    this.globalData.versionType = res.data.data.is_submit
                }
            }
        })
    },
    isNetwork: true,
    globalData: {
        canIUseGetUserProfile: false,
        canIUseGetUserInfo: wx.canIUse('button.open-type.getUserInfo'),
        canIUseOpenData: wx.canIUse('open-data.type.userNickName') && wx.canIUse('open-data.type.userAvatarUrl'),
        userInfo: wx.getStorageSync('userInfo'),
        unionid: wx.getStorageSync('unionid'),
        openid: wx.getStorageSync('openid'),
        token: wx.getStorageSync('token'),
        uuid: wx.getStorageSync('uuid'),
        useInfoObj: {},
        versionType: '',   //小程序的版本 0 正常 1 送检版
        version: '1.0.3',
        subVersion: '1.0.3.4',
        isGoLogin: true,
        platform: '',
        isClick: false
    }
})