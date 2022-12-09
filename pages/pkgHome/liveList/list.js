const md_request = require('../../../utils/request.js')
const md_app = getApp()

Page({
    data: {
        top: md_app.globalData.statusBarHeight,
        tabNum: '',
        modeName:'',
        modeArr: ['pre', 'load', 'has'],
        preDataObj: {       //预告
            listDataObj: {},
            pageIndex: 1,
            lastPage: 0,
            isNewShow: false
        },
        loadDataObj: {       //LIVE
            listDataObj: {},
            pageIndex: 1,
            lastPage: 0,
            isNewShow: false
        },
        hasDataObj: {       //结束
            listDataObj: {},
            pageIndex: 1,
            lastPage: 0,
            isNewShow: false
        },
        trailHeight: 0,
        liveingHeight: 0,
        reviewHeight: 0,
        isOne: true,
        isSlidLoad_tr: false,
        isSlidLoad_li: false,
        isSlidLoad_re: false,
        vipType: '0',
        svipType: '0',
        platform: md_app.globalData.platform,
		globalObj: {}
    },

    /**
     * 生命周期函数--监听页面加载
     * @param {Object} options 地址栏参数
     * @return
     */
    onLoad: function (options) {
        this.setData({
            tabNum: 1,
            modeName: this.data.modeArr[1]
        })
        setTimeout(()=> {
            this.setData({
                globalObj: md_app.globalData
            })
        }, 1000)
        this.initEndData()
        this.initLoadData()
        this.initPreData()
    },

    /**
     * 初始化直播预告数据
     * @param 
     * @return
     */
    initPreData: function () {
        if (this.data.preDataObj.pageIndex > 1) {
            this.setData({
                isSlidLoad_tr: true
            })
        }
        md_request.api({
            path: md_request.config.live + '/live/index',
            data: {
                'token': md_app.globalData.token,
                'pageIndex': this.data.preDataObj.pageIndex,
                'pageLimit': '10',
                'status': '0'
            },
            callback: (err, res) => {
                this.setData({
                    isSlidLoad_tr: false
                })
                if (res.data.code == '200') {
                    let data = res.data.data
                    if (data.is_last_page == 1) {
                        this.setData({
                            'preDataObj.lastPage': 1
                        })
                    }
                    let temList = this.data.preDataObj.listDataObj
                    let temPageIndex = this.data.preDataObj.pageIndex
                    for (let idx in data.list) {
                        data.list[idx].price = (data.list[idx].price / 100).toFixed(2)
                    }
                    if (this.data.preDataObj.pageIndex == 1) {
                        temPageIndex = 1
                        temList = data.list
                    } else {
                        temList = temList.concat(data.list)
                    }
                    if (this.data.preDataObj.isNewShow) {
                        wx.stopPullDownRefresh()
                        this.setData({
                            'preDataObj.isNewShow': false
                        })
                    }
                    this.setData({
                        'preDataObj.listDataObj': temList,
                        'preDataObj.pageIndex': temPageIndex,
                        'vipType': res.data.data.is_vip,
                        'svipType': res.data.data.is_svip
                    })
                    if(this.data.modeName == 'pre'){
                        wx.hideNavigationBarLoading() //完成停止加载
                        wx.stopPullDownRefresh() //停止下拉刷新
                    }
                    let trailHeight = this.data.preDataObj.listDataObj.length * 264
                    this.setData({
                        trailHeight: this.data.preDataObj.listDataObj.length ? trailHeight + 130 : 600
                    })
                }
            }
        })
    },

    /**
     * 初始化直播直播中数据
     * @param 
     * @return
     */
    initLoadData: function () {
        if (this.data.loadDataObj.pageIndex > 1) {
            this.setData({
                isSlidLoad_li: true
            })
        }
        md_request.api({
            path: md_request.config.live + '/live/index',
            data: {
                'token': md_app.globalData.token,
                'pageIndex': this.data.loadDataObj.pageIndex,
                'pageLimit': '10',
                'status': '1'
            },
            callback: (err, res) => {
                this.setData({
                    isSlidLoad_li: false
                })
                if (res.data.code == '200') {
                    let data = res.data.data
                    if (data.is_last_page == 1) {
                        this.setData({
                            'loadDataObj.lastPage': 1
                        })
                    }
                    let temList = this.data.loadDataObj.listDataObj
                    let temPageIndex = this.data.loadDataObj.pageIndex
                    for (let idx in data.list) {
                        data.list[idx].price = (data.list[idx].price / 100).toFixed(2)
                    }
                    if (this.data.loadDataObj.pageIndex == 1) {
                        temPageIndex = 1
                        temList = data.list
                    } else {
                        temList = temList.concat(data.list)
                    }
                    if (this.data.loadDataObj.isNewShow) {
                        wx.stopPullDownRefresh()
                        this.setData({
                            'loadDataObj.isNewShow': false
                        })
                    }
					if (temList.length == 0) { //LIVE无数据，默认显示往期回顾
						this.setData({
							tabNum: 2,
							modeName: this.data.modeArr[2],
						})
					}
                    this.setData({
                        'loadDataObj.listDataObj': temList,
                        'loadDataObj.pageIndex': temPageIndex,
                        'vipType': res.data.data.is_vip,
                        'svipType': res.data.data.is_svip
                    })
                    if (this.data.modeName == 'load') {
                        wx.hideNavigationBarLoading() //完成停止加载
                        wx.stopPullDownRefresh() //停止下拉刷新
                    }
                    let liveingHeight = this.data.loadDataObj.listDataObj.length * 264
                    this.setData({
                        liveingHeight: this.data.loadDataObj.listDataObj.length ? liveingHeight + 130 : 600
                    })
                }
            }
        })
    },

    /**
     * 初始化直播往期回顾数据
     * @param 
     * @return
     */
    initEndData: function () {
        if (this.data.hasDataObj.pageIndex > 1){
            this.setData({
                isSlidLoad_re: true
            })
        }
        md_request.api({
            path: md_request.config.live + '/live/index',
            data: {
                'token': md_app.globalData.token,
                'pageIndex': this.data.hasDataObj.pageIndex,
                'pageLimit': '10',
                'status': '2'
            },
            callback: (err, res) => {
                this.setData({
                    isSlidLoad_re: false
                })
                if (res.data.code == '200') {
                    let data = res.data.data
                    if (data.is_last_page == 1) {
                        this.setData({
                            'hasDataObj.lastPage': 1
                        })
                    }
                    let temList = this.data.hasDataObj.listDataObj
                    let temPageIndex = this.data.hasDataObj.pageIndex
                    for (let idx in data.list) {
                        data.list[idx].price = (data.list[idx].price / 100).toFixed(2)
                    }
                    if (this.data.hasDataObj.pageIndex == 1) {
                        temPageIndex = 1
                        temList = data.list
                    } else {
                        temList = temList.concat(data.list)
                    }
                    if (this.data.hasDataObj.isNewShow) {
                        wx.stopPullDownRefresh()
                        this.setData({
                            'hasDataObj.isNewShow': false
                        })
                    }
                    this.setData({
                        'hasDataObj.listDataObj': temList,
                        'hasDataObj.pageIndex': temPageIndex,
                        'vipType': res.data.data.is_vip,
                        'svipType': res.data.data.is_svip
                    })
                    if (this.data.modeName == 'has') {
                        wx.hideNavigationBarLoading() //完成停止加载
                        wx.stopPullDownRefresh() //停止下拉刷新
                    }
                    let reviewHeight = this.data.hasDataObj.listDataObj.length * 264
                    this.setData({
                        reviewHeight: this.data.hasDataObj.listDataObj.length ? reviewHeight + 130 : 600
                    })
                }
            }
        })
    },

    /**
     * 切换tab
     * @param {dom} e 切换的tab
     * @return
     */
    changeTab: function (e) {
        this.setData({
            tabNum: Number(e.currentTarget.dataset.index)
        })
        wx.pageScrollTo({
            scrollTop: 0
        })
    },

    /**
     * 跳转到详情页面
     * @param {dom} e 详情
     * @return
     */
    goDetails: function (e) {
        wx.navigateTo({
            url: '/pages/pkgs/college/pages/liveDetail/liveDetail?code=' + e.currentTarget.dataset.code + '&type=2'
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     * @param
     * @return
     */
    onPullDownRefresh: function () {
        if (this.data.modeName == 'pre') {
            let preDataObj = this.data.preDataObj
            preDataObj.pageIndex = 1
            preDataObj.lastPage = 0
            preDataObj.isNewShow = false
            this.setData({
                preDataObj: preDataObj
            })
        } else if (this.data.modeName == 'load') {
            let loadDataObj = this.data.loadDataObj
            loadDataObj.pageIndex = 1
            loadDataObj.lastPage = 0
            loadDataObj.isNewShow = false
            this.setData({
                loadDataObj: loadDataObj
            })
        } else if (this.data.modeName == 'has') {
            let hasDataObj = this.data.hasDataObj
            hasDataObj.pageIndex = 1
            hasDataObj.lastPage = 0
            hasDataObj.isNewShow = false
            this.setData({
                hasDataObj: hasDataObj
            })
        }
        this.initPreData()
        this.initLoadData()
        this.initEndData()
        this.setData({
            hight: 1170
        })
    },

    /**
     * 页面上拉触底事件的处理函数
     * @param
     * @return
     */
    onReachBottom: function () {
        if (this.data.modeName == 'pre') {
            if (this.data.preDataObj.lastPage == 1) {
                return
            }
            else {
                let pages = this.data.preDataObj.pageIndex
                pages++
                this.setData({
                    'preDataObj.pageIndex': pages
                })
                this.initPreData()
            }
        } else if (this.data.modeName == 'load') {
            if (this.data.loadDataObj.lastPage == 1) {
                return
            }
            else {
                let pages = this.data.loadDataObj.pageIndex
                pages++
                this.setData({
                    'loadDataObj.pageIndex': pages
                })
                this.initLoadData()
            }
        } else if (this.data.modeName == 'has') {
            if (this.data.hasDataObj.lastPage == 1) {
                return
            }
            else {
                let pages = this.data.hasDataObj.pageIndex
                pages++
                this.setData({
                    'hasDataObj.pageIndex': pages
                })
                this.initEndData()
            }
        }
    },

    /**
     * 切换tab
     * @param {dom} e 切换的tab
     * @return
     */
    changeSwiper: function (e) {
        this.setData({
            modeName: this.data.modeArr[e.detail.current]
        })
    },

    /**
    	微信分享
    	@param
    	@return
     */
	onShareAppMessage() {
		return {
			title: '盆底产康知识，尽在澜渟LIVE。',
			imageUrl: '/images/home/college/logo.png',
		}
	}
})