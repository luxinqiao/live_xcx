var md_request = require('../../../../../utils/request.js')
var md_common = require('../../../../../utils/common.js')

var md_app = getApp()

Page({
    data: {
        messageListObj: {},
        pageIndex: 1,
        isNewShow: false,
        currentDate: '',
        currentTime: ''
    },

    /**
     * 生命周期函数--监听页面加载
     * @param
     * @return
     */
    onLoad: function() {
        this.initDate()
        this.isAllRead()
    },

    /**
     * 初始化数据
     * @param 
     * @return
     */
    initDate: function() {
        md_request.api({
            path: md_request.config.common + '/note/records',
            data: {
                "token": md_app.globalData.token,
                "page": this.data.pageIndex,
                "type": '1'
            },
            callback: (err, res) => {
                if (res.data.code == '200') {
                    if (res.data.data.length <= 0) {
                        this.setData({
                            pageIndex: 0
                        })
                    }
                    let temList = this.data.messageListObj
                    let temPageIndex = this.data.pageIndex
                    if (this.data.pageIndex == 1) {
                        temList = res.data.data.map((item)=>{
                            item.currentDate = `${parseInt(item.gmt_create.substring(5,7))}月${parseInt(item.gmt_create.substring(8,10))}日`
                            item.currentTime = `${(item.gmt_create.substring(11,16))}`
                            return item
                        })
                        temPageIndex = 1
                    } else {
                        temList = temList.concat(res.data.data.map((item)=>{
                            item.currentDate = `${parseInt(item.gmt_create.substring(5,7))}月${parseInt(item.gmt_create.substring(8,10))}日`
                            item.currentTime = `${(item.gmt_create.substring(11,16))}`
                            return item
                        }))
                    }
                    if (this.data.isNewShow) {
                        wx.stopPullDownRefresh()
                    }
                    this.setData({
                        messageListObj: temList,
                        pageIndex: temPageIndex,
                    })
                }
            }
        });
    },

    /**
     * 已读
     * @param 
     * @return
     */
    isAllRead() {
        md_request.api({
            path: md_request.config.common + '/note/read',
            data: {
                "token": md_app.globalData.token,
                "type": 1
            }
        });
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     * @param
     * @return
     */
    onPullDownRefresh: function() {
        this.setData({
            pageIndex: 1,
            isNewShow: true
        })
        this.initDate()
    },

    /**
     * 页面上拉触底事件的处理函数
     * @param
     * @return
     */
    onReachBottom: function() {
        if (this.data.pageIndex == 0) {
            return
        } else {
            let pages = this.data.pageIndex
            pages++
            this.setData({
                pageIndex: pages
            })
            this.initDate()
        }
    }
})