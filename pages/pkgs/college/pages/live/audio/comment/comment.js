const md_request = require('../../../../../../../utils/request.js')
const md_common = require('../../../../../../../utils/common.js')
const md_dict = require('../../../../../../../utils/dict.js')
const md_app = getApp()
let intervalFun, prePage

Page({
    data: {
        paramObj: {},
        isShowData: false,
        dataArr: [],
        currPage: 1,
        isLast: false,
        comment: '',
        isAllMute: false,
        isMute: false,
        wyimAccid: '',
        isFirstShow: true,
        platform: ''
    },

    /**
        生命周期函数--监听页面加载
        @param {Object} options 页面参数
        @return
    */
    onLoad: function (options) {
        prePage = md_common.getPrePage()
        this.setData({
            paramObj: options,
            wyimAccid: wx.getStorageSync('wyimAccid'),
            isAllMute: prePage.data.isAllMute,
            isMute: prePage.data.isMute,
            platform: md_app.globalData.platform
        }, () => {
            if (this.data.paramObj.isPullHistory == '0') { //获取上页直播间数据
                this.getImHistoryComments()
            } else if (this.data.paramObj.isPullHistory == '1') { //请求直播评论列表
                this.initData()
            }
        })
    },

    /**
        获取网易历史评论
        @param
        @return
    */
    getImHistoryComments: function () {
        prePage.getImHistoryComments({
            timetag: 0,
            limit: 100,
            callback: (err, obj) => {
                if (!err) {
                    for (let i = 0; i < obj.msgs.length; i++) {
                        if (obj.msgs[i].type == 'custom') {
                            obj.msgs[i] = prePage.convertIMData(obj.msgs[i])
                        }
                    }
                    this.setData({
                        dataArr: obj.msgs,
                        isShowData: true
                    })
                }
            }
        })
    },

    /**
        初始化数据
        @param
        @return
    */
    initData: function () {
        md_request.api({
            path: md_request.config.live + '/live/comment',
            data: {
                token: md_app.globalData.token,
                live_code: this.data.paramObj.liveCode,
                pageIndex: this.data.currPage,
                pageLimit: 10
            },
            callback: (err, res) => {
                if (res.data.code == 200) {
                    if (this.data.currPage >= parseInt(res.data.data.pageCount)) {
                        this.setData({
                            isLast: true
                        })
                    }
                    this.setData({
                        dataArr: this.data.dataArr.concat(res.data.data.list),
                        isShowData: true
                    })
                }
            }
        })
    },

    /**
        删除消息
        @param {Dom} e 消息
        @return
    */
    deleteMsg: function (e) {
        this.selectComponent('#mdDialog').confirm('是否删除该条评论？', '取消', () => {

        }, '确定', () => {
            const item = e.currentTarget.dataset.item
            md_request.api({
                path: md_request.config.live + '/live/deleteHistoryMessage',
                data: {
                    token: md_app.globalData.token,
                    fromAcc: item.fromAccount,
                    msgTimetag: item.sendtime,
                    msg: item.msgid,
                    live_code: this.data.paramObj.liveCode
                },
                callback: (err, res) => {

                }
            })
        })
    },

    /**
        发送评论
        @param {dom} e 评论
        @return
    */
    sendComment: function (e) {
		const comment = md_common.trimStr(e.detail)
        if (comment == '') {
            this.selectComponent('#mdDialog').tip('请输入内容')
            return
        }
		prePage.sendComment(e)
		this.setData({
			comment: ''
		})
        prePage.setData({
            comment: comment
        })
    },

    /**
        滚动条触底事件
        @param {Dom} e 滚动条组件
        @return
    */
    scrolltolower: function (e) {
        if (this.data.isLast) {
            return
        }
        if (this.data.paramObj.isPullHistory == '1') { //请求直播评论列表
            this.setData({
                currPage: this.data.currPage + 1
            })
            this.initData()
        }
    },

    /**
        添加评论（直播课堂页调用）
        @param {Object} comment 评论
        @return
    */
    appendComment: function (comment) {
        if (Object.prototype.toString.call(comment) == '[object Object]') {
            if (comment.type == md_dict.liveMsgType.CUSTOM) {
                this.data.dataArr.unshift(comment)
            }
        } else if (Object.prototype.toString.call(comment) == '[object Array]') {
            for (let i = 0; i < comment.length; i++) {
                if (comment[i].type == md_dict.liveMsgType.CUSTOM) {
                    this.data.dataArr.unshift(comment[i])
                }
            }
        }
        if (this.data.dataArr.length > 100) {
            this.data.dataArr.splice(100, this.data.dataArr.length - 100)
        }
        this.setData({
            dataArr: this.data.dataArr
        })
    },

    /**
        移除评论（直播课堂页调用）
        @param {Object} comment 评论
        @return
    */
    removeComment: function (msgId) {
        for (let i = 0; i < this.data.dataArr.length; i++) {
            if (this.data.dataArr[i].msgid == msgId) {
                this.data.dataArr.splice(i, 1)
                break
            }
        }
        this.setData({
            dataArr: this.data.dataArr
        })
    },

    /**
        生命周期函数--监听页面卸载
        @param
        @return
    */
    onUnload: function () {
        clearInterval(intervalFun)
    },

    /**
        生命周期函数--监听页面隐藏
        @param
        @return
    */
    onHide: function () {
        //息屏&退出后台
        prePage.destoryChatroom()
    },
    /**
        生命周期函数--监听页面显示
        @param
        @return
    */
    onShow: function () {
        if (this.data.isFirstShow) { //首次显示
            this.setData({
                isFirstShow: false
            })
        } else { //再次显示
            prePage.initImChatRoom()
        }
    }
})