const md_request = require('../../../../../../../utils/request.js')
const md_storage = require('../../../../../../../utils/storage.js')
const md_common = require('../../../../../../../utils/common.js')
const md_dict = require('../../../../../../../utils/dict.js')
const md_app = getApp()
const md_chatRoom = require('../../../../../../../utils/chatRoom.js')
let intervalFun, scrollTimeoutFun
let currPlayIndex = 0, currPlayTime = 0, currPlayX = 0, currPlayAudio = {}
const bgAudioManager = wx.getBackgroundAudioManager()

Page({
    data: {
        isIphoneX: md_app.globalData.isIphoneX,
        paramObj: {},
        bannerArr: [],
        currBanner: 0,
        isBannerShow: true,
		isActionGuideShow: false,
		isActionGuideTip: false,
        isToTopShow: false,
        scrollTop: 0,
        tmpMsgArr: [],
        msgArr: [],
        isMsgLoad: false,
        isFollow: false,
        isCommentMarkShow: true,
        commentArr: [],
        comment: '',
        isGoComment: true,
        isAllMute: false,
        isMute: false,
        isBlack: false,
        isCurrPage: true,
        isHasConnect: false,
        identityObj: {
            adminArr: [],
            honorArr: [],
            hostArr: []
        },
        storageMsgId: '',
        rpxRatio: '',
        platform: ''
    },

    /**
        生命周期函数--监听页面加载
        @param {Object} options 链接参数
        @return
    */
    onLoad: function (options) {
		this.initPage(options)
		this.initData(options)
    },
	/**
        初始化页面
        @param {Object} options 链接参数
        @return
    */
	initPage: function (options) {
		currPlayIndex = 0
		wx.setNavigationBarTitle({
			title: `${options.liveName.replace('直播', 'LIVE')}`
		})
		this.setData({
			paramObj: options,
			storageMsgId: wx.getStorageSync('token') + '_' + options.roomId,
			rpxRatio: 750 / wx.getSystemInfoSync().screenWidth,
			platform: md_app.globalData.platform,
			isActionGuideShow: !wx.getStorageSync('live_audio_actionGuideTip')
		})
		this.onBgAudioManager()
	},
	/**
        初始化数据
        @param {Object} options 链接参数
        @return
    */
	initData: function (options) {
		this.initBanner('change')
		if (options.isPullHistory == '0') {
			this.initIdentity(() => {
				this.initImChatRoom()
			})
		} else if (options.isPullHistory == '1') {
			this.initHistoryList(1)
		}
		this.initFollow()
		this.initLearn()
	},

    /**
        初始化Banner
        @param {String} type 类型
        @return
    */
    initBanner: function (type) {
		if ((type == 'change') && this.data.paramObj.isInBegintime == '0') { //直播前20分钟banner区展示封面图
            let arr = []
            arr.push(this.data.paramObj.ppt_cover)
            this.setData({
                bannerArr: arr
            })
            return
        }
        md_request.api({
            path: md_request.config.live + '/matter/imageList',
            data: {
                token: md_app.globalData.token,
                live_code: this.data.paramObj.liveCode
            },
            callback: (err, res) => {
                if (res.data.code == 200) {
                    if (res.data.data.images == undefined || res.data.data.images.length == 0) {
                        res.data.data.images = []
                        res.data.data.images.push(this.data.paramObj.ppt_cover)
                    }
                    this.setData({
                        bannerArr: res.data.data.images
                    })
                }
            }
        })
    },

    /**
        初始化身份(IM历史消息的身份不准)
        @param {Function} callback 回调函数
        @return
    */
    initIdentity: function (callback) {
        md_request.api({
            path: md_request.config.live + '/member/teach',
            data: {
                token: md_app.globalData.token,
                live_code: this.data.paramObj.liveCode
            },
            callback: (err, res) => {
                if (res.data.code == 200) {
                    this.setData({
                        'identityObj.adminArr': res.data.data.admin,
                        'identityObj.honorArr': res.data.data.honor,
                        'identityObj.hostArr': res.data.data.host
                    })
                    typeof (callback) == 'function' ? callback() : ''
                }
            }
        })
    },

    /**
        获取IM聊天室
        @param
        @return
    */
    initImChatRoom: function () {
        md_chatRoom.init({
            roomId: this.data.paramObj.roomId,
            onNimConnect: (res) => {
                this.onNimConnect(res)
            },
            onNimDisconnect: (err) => {
                this.onNimDisconnect(err)
            },
            onChatRoomConnect: (res) => {
                this.onChatRoomConnect(res)
            },
            onChatRoomDisconnect: (err) => {
                this.onChatRoomDisconnect(err)
            },
            onChatRoomMsgs: (msgs) => {
                this.onChatRoomMsgs(msgs)
            }
        })
    },
    /**
        监听Nim开始连接
        @param {Object} res 开始连接信息
        @return
    */
    onNimConnect: function (res) {
        if (this.data.isHasConnect) { //再次重连
            // this.selectComponent('#mdDialog').tip('正在连接...')
            // if (this.checkCurrRoute('live/audio/comment/comment')) {
            //     md_common.getCurrPage().selectComponent('#mdDialog').tip('正在连接...')
            // }
        } else { //第一次连接
            this.setData({
                isHasConnect: true
            })
        }
    },
    /**
        监听Nim断开连接
        @param {Object} err 断开连接对象
        @return
    */
    onNimDisconnect: function (err) {
        // this.selectComponent('#mdDialog').tip('连接已断开')
        // if (this.checkCurrRoute('live/audio/comment/comment')) {
        //     md_common.getCurrPage().selectComponent('#mdDialog').tip('连接已断开')
        // }
    },
    /**
        监听聊天室开始连接
        @param {Object} obj 聊天室对象
        @return
    */
    onChatRoomConnect: function (obj) {
        this.setData({
            isAllMute: obj.chatroom.mute == true,
            isMute: obj.member.gaged == true
        })
        this.initRedisMsgs(0)
        if (this.data.paramObj.status != md_dict.roomStatus.END) {
            this.getImHistoryComments({
                timetag: 0,
                limit: 10,
                callback: (err, obj) => {
                    if (!err) {
						let commentArr = []
                        for (let i = 0; i < obj.msgs.length; i++) {
							obj.msgs[i] = this.convertIMData(obj.msgs[i])
							if (obj.msgs[i].type == md_dict.liveMsgType.CUSTOM && obj.msgs[i].ext.type != md_dict.customExtType.GIFT) {
								commentArr.push(obj.msgs[i])
                            }
                        }
						if (commentArr.length > 3) {
							commentArr.length = 3
						}
                        this.setData({
							commentArr: commentArr.reverse()
                        })
                    }
                }
            })
        }
    },
    /**
        监听聊天室断开连接
        @param {Object} err 报错信息
        @return
    */
    onChatRoomDisconnect: function (err) {
        if (err) {
            switch (err.code) {
                //账号或者密码错误, 请跳转到登录页面并提示错误
                case 302:
                    break
                //被踢, 请提示错误后跳转到登录页面
                case 'kicked':
                    if (err.reason == 'blacked') {
                        this.setData({
                            isBlack: true
                        })
                        if (this.checkCurrRoute('live/audio/index/index')) {
                            this.selectComponent('#mdDialog').alertCount('十分抱歉, 因违反课堂纪律, 您已被请出直播课堂。', '确定', () => {
                                wx.navigateBack({
                                    delta: 1
                                })
                            }, 10)
                        } else if (this.checkCurrRoute('live/audio/comment/comment')) {
                            md_common.getCurrPage().selectComponent('#mdDialog').alertCount('十分抱歉,因违反课堂纪律,您已被请出直播课堂。', '确定', () => {
                                wx.navigateBack({
                                    delta: 2
                                })
                            }, 10)
                        }
                    }
                    break
                default:
                    break
            }
        }
    },
    /**
        监听聊天室接收消息
        @param {Array} msgs 消息集
        @return
    */
    onChatRoomMsgs: function (msgs) {
        try {
            let msgArr = [], commentArr = []
            for (let i = 0; i < msgs.length; i++) {
                if (md_common.isInArr(this.data.msgArr, 'msgid', msgs[i].msgid)) {
                    continue
                }
                if (msgs[i].type == 'tip') { //处理tip消息
                    const tipObj = JSON.parse(msgs[i].tip)
                    //0：直播开始，1：ppt更新，3：评论删除，4：直播结束，5：管理员、嘉宾身份转换，6：点赞，7: 开播倒计时20分钟，8：人气增加
                    if (tipObj.type == 0) {
                        this.setData({
                            'paramObj.status': md_dict.roomStatus.BEGIN
                        })
                    } else if (tipObj.type == 1) {
                        this.initBanner('change')
                    } else if (tipObj.type == 3) {
                        this.removeComment(tipObj.content)
                    } else if (tipObj.type == 4) {
                        this.setData({
                            'paramObj.status': md_dict.roomStatus.END
                        })
                    } else if (tipObj.type == 5) {
                        this.initIdentity()
                    } else if (tipObj.type == 7) {
						this.setData({
							'paramObj.isInBegintime': '1'
						}, ()=> {
							this.initBanner('start')
						})
                    } else if (tipObj.type == 8) {
                        this.setData({
                            'paramObj.pop': this.data.paramObj.pop + parseInt(tipObj.content)
                        })
                    }
                    continue
                } else if (msgs[i].type == 'notification') { //处理通知消息
                    //memberEnter：用户进入聊天室，gagMember：被禁言，ungagMember：解除禁言，muteRoom：全体禁言，unmuteRoom：解除全体禁言，blackMember：拉黑，removeManager：移除嘉宾，addManager：添加嘉宾
                    if (msgs[i].attach.type == 'memberEnter') {
                        this.setData({
                            'paramObj.pop': parseInt(this.data.paramObj.pop) + 1
                        })
                    } else if (msgs[i].attach.type == 'gagMember') {
                        for (let j = 0; j < msgs[i].attach.to.length; j++) {
                            if (msgs[i].attach.to[j] == wx.getStorageSync('wyimAccid')) {
                                this.setData({
                                    isMute: true
                                })
                                this.selectComponent('#mdDialog').tip('您已被禁言')
                                if (this.checkCurrRoute('live/audio/comment/comment')) {
                                    md_common.getCurrPage().setData({
                                        isMute: true
                                    })
                                    md_common.getCurrPage().selectComponent('#mdDialog').tip('您已被禁言')
                                }
                            }
                        }
                    } else if (msgs[i].attach.type == 'ungagMember') {
                        for (let j = 0; j < msgs[i].attach.to.length; j++) {
                            if (msgs[i].attach.to[j] == wx.getStorageSync('wyimAccid')) {
                                this.setData({
                                    isMute: false
                                })
                                this.selectComponent('#mdDialog').tip('您已被解除禁言')
                                if (this.checkCurrRoute('live/audio/comment/comment')) {
                                    md_common.getCurrPage().setData({
                                        isMute: false
                                    })
                                    md_common.getCurrPage().selectComponent('#mdDialog').tip('您已被解除禁言')
                                }
                            }
                        }
                    } else if (msgs[i].attach.type == 'muteRoom') {
                        this.setData({
                            isAllMute: true
                        })
						this.selectComponent('#mdDialog').tip('全体禁言开启')
                        if (this.checkCurrRoute('live/audio/comment/comment')) {
                            md_common.getCurrPage().setData({
                                isAllMute: true
                            })
							md_common.getCurrPage().selectComponent('#mdDialog').tip('全体禁言开启')
                        }
                    } else if (msgs[i].attach.type == 'unmuteRoom') {
                        this.setData({
                            isAllMute: false
                        })
						this.selectComponent('#mdDialog').tip('全体禁言关闭')
                        if (this.checkCurrRoute('live/audio/comment/comment')) {
                            md_common.getCurrPage().setData({
                                isAllMute: false
                            })
							md_common.getCurrPage().selectComponent('#mdDialog').tip('全体禁言关闭')
                        }
                    } else if (msgs[i].attach.type == 'blackMember') {
                        //此处可接收他人被拉黑消息，自己被拉黑至onChatRoomDisconnect->kicked->blacked中处理
                    } else if (msgs[i].attach.type == 'removeManager') {
                        this.initIdentity()
                    } else if (msgs[i].attach.type == 'addManager') {
                        this.initIdentity()
                    }
                } else if (msgs[i].type == 'custom') { //数据添加：自定义消息(评论消息)
                    commentArr.push(this.convertIMData(msgs[i]))
                } else {
                    msgArr.push(this.refreshMsgAttr(this.convertIMData(msgs[i])))//数据添加：文本消息、图片消息、语音消息
                }
            }
            if (commentArr.length > 0) {
                this.appendComment(commentArr)
            }
            if (msgArr.length > 0) {
                //判断最后一条语音是否已读
                let isLastAudioRead = false
                for (let i = this.data.msgArr.length - 1; i >= 0; i--) {
                    if (this.data.msgArr[i].type == md_dict.liveMsgType.AUDIO) {
                        isLastAudioRead = this.data.msgArr[i].extend.isRead
                        break
                    }
                }
                //添加数据
                this.setData({
                    msgArr: this.data.msgArr.concat(msgArr)
                })
                //缓存更新数据&下载图片
                md_storage.live.saveMsgs(this.data.storageMsgId, this.data.msgArr)
                this.downloadImages(msgArr)
                //播放器暂停或停止&&最后一条语音已读，则自动播放最新语音
                if ((bgAudioManager.paused != false) && isLastAudioRead) {
                    for (let i = 0; i < msgArr.length; i++) {
                        if (msgArr[i].type != md_dict.liveMsgType.AUDIO) {
                            continue
                        }
                        for (let j = this.data.msgArr.length - 1; j >= 0; j++) {
                            if (this.data.msgArr[j].msgid == msgArr[i].msgid) {
                                //播放最新语音
                                this.tapAudio({
                                    currentTarget: {
                                        dataset: {
                                            data: this.data.msgArr[j],
                                            i: j
                                        }
                                    }
                                })
                                //滚动条置底
                                this.goBottom()
                                break
                            }
                        }
                    }
                }
            }
        }
        catch (err) {

        }
    },

    /**
        转换IM数据
        @param {Object} obj IM数据
        @return {Object} 规范数据
    */
    convertIMData: function (obj) {
        let resObj = {
            msgid: obj.idClient,
            fromAccount: obj.from,
            user_avatar: obj.fromAvatar,
            user_name: obj.fromNick,
            sendtime: obj.time,
            create_at: md_common.dateFormat(obj.time, 'YYYY-MM-DD hh:mm:ss'),
            ext: JSON.parse(obj.custom)
        }
        if (obj.type == 'text') {
            resObj.type = md_dict.liveMsgType.TEXT
            resObj.content = {
                msg: obj.text
            }
        } else if (obj.type == 'image') {
            resObj.type = md_dict.liveMsgType.IMAGE
            resObj.content = {
                h: obj.file.h,
                w: obj.file.w,
                url: obj.file.url
            }
        } else if (obj.type == 'audio') {
            resObj.type = md_dict.liveMsgType.AUDIO
            resObj.content = {
                dur: obj.file.dur,
                url: obj.file.url
            }
        } else if (obj.type == 'custom') {
            resObj.type = md_dict.liveMsgType.CUSTOM
            resObj.content = JSON.parse(obj.content)
        }
        return resObj
    },

    /**
        初始化Redis消息（文本、图片、语音）
        @param {String} timetag 时间戳
        @return
    */
    initRedisMsgs: function (timetag) {
        md_request.api({
            path: md_request.config.lesson + '/live/read',
            data: {
                token: md_app.globalData.token,
                live_code: this.data.paramObj.liveCode
            },
            callback: (err, res) => {
                if (res.data.code == 200) {
                    let resArr = res.data.data.list
                    if (resArr.length == 0) { //拉网易历史
                        this.getImHistoryMsgs(0)
                    } else { //拉后端redis历史
                        for (let i = 0; i < resArr.length; i++) {
                            resArr[i] = this.refreshMsgAttr(resArr[i])
                        }
                        resArr = this.mergeMsgs(resArr)
                        this.setData({
                            isMsgLoad: true,
                            msgArr: resArr
                        }, () => {
                            md_storage.live.saveMsgs(this.data.storageMsgId, this.data.msgArr)
                            this.downloadImages()
                        })
                    }
                }
            }
        })
    },

    /**
        获取IM历史消息（文本、图片、语音）
        @param {String} timetag 时间戳
        @return
    */
    getImHistoryMsgs: function (timetag) {
        if (timetag == 0) {
            this.data.tmpMsgArr = []
        }
        md_chatRoom.getHistoryMsgs({
            timetag: timetag,
            limit: 100,
            reverse: true,
            msgTypes: ['text', 'image', 'audio'],
            done: (error, obj) => {
                if (!error && obj.msgs.length > 0) {
                    for (let i = 0; i < obj.msgs.length; i++) {
                        obj.msgs[i] = this.refreshMsgAttr(this.convertIMData(obj.msgs[i]))
                    }
                    this.setData({
                        tmpMsgArr: this.data.tmpMsgArr.concat(obj.msgs)
                    })
                    this.getImHistoryMsgs(obj.msgs[obj.msgs.length - 1].sendtime)
                } else {
                    this.data.tmpMsgArr = this.mergeMsgs(this.data.tmpMsgArr)
                    this.setData({
                        isMsgLoad: true,
                        msgArr: this.data.tmpMsgArr
                    }, () => {
                        md_storage.live.saveMsgs(this.data.storageMsgId, this.data.msgArr)
                        this.downloadImages()
                    })
                }
            }
        })
    },

    /**
        获取IM历史消息（自定义评论）
        @param {Object} param 参数
        @return
    */
    getImHistoryComments: function (param) {
        md_chatRoom.getHistoryMsgs({
            timetag: param.timetag,
            limit: param.limit,
            reverse: false,
            msgTypes: ['custom'],
            done: (err, obj) => {
                param.callback(err, obj)
            }
        })
    },

    /**
        刷新消息属性（扩展属性、自定义属性（身份））
        @param {Object} msg 消息
        @return {Object} 刷新后的消息
    */
    refreshMsgAttr: function (msg) {
        msg.extend = this.getExtendAttr(msg.msgid) //扩展字段：已读状态、播放状态等
        msg.ext = this.getExtIdentity(msg) //自定义字段：刷新身份
        return msg
    },

    /**
        获取扩展属性
        @param {String} msgId 消息id
        @return {Object} 扩展属性
    */
    getExtendAttr: function (msgId) {
        const isCurrPlay = currPlayIndex > 0 && this.data.msgArr[currPlayIndex].msgid == msgId
        let storageMsg = md_storage.live.getMsg(this.data.storageMsgId, msgId)
        if (md_common.isEmpty(storageMsg) || md_common.isEmpty(storageMsg.extend)) {
            if (isCurrPlay) {
                return currPlayAudio.extend
            } else {
                return {
                    isRead: false,
                    isFirst: true,
                    playStatus: 'stop',
                    totalTime: 0,
                    currTime: 0,
                    percent: 0,
                    newUrl: ''
                }
            }
        } else {
            if (isCurrPlay) {
                storageMsg.extend.isFirst = currPlayAudio.extend.isFirst
                storageMsg.extend.playStatus = currPlayAudio.extend.playStatus
                storageMsg.extend.currTime = currPlayAudio.extend.currTime
                storageMsg.extend.percent = currPlayAudio.extend.percent
                return storageMsg.extend
            } else {
                storageMsg.extend.isFirst = true
                storageMsg.extend.playStatus = 'stop'
                storageMsg.extend.currTime = 0
                storageMsg.extend.percent = 0
                return storageMsg.extend
            }
        }
    },

    /**
        获取自定义身份
        @param {Object} msg 消息
        @return {String} 自定义身份
    */
    getExtIdentity: function (msg) {
        if (msg.type == md_dict.liveMsgType.CUSTOM) {
            return msg.ext
        }
        if (msg.ext == undefined) {
            msg.ext = {}
        }
        for (let i = 0; i < this.data.identityObj.adminArr.length; i++) {
            if (msg.fromAccount == this.data.identityObj.adminArr[i].uuid) {
                msg.ext.identity = md_dict.roomIdentity.ADMIN
                return msg.ext
            }
        }
        for (let i = 0; i < this.data.identityObj.honorArr.length; i++) {
            if (msg.fromAccount == this.data.identityObj.honorArr[i].uuid) {
                msg.ext.identity = md_dict.roomIdentity.HONOR
                return msg.ext
            }
        }
        for (let j = 0; j < this.data.identityObj.hostArr.length; j++) {
            if (msg.fromAccount == this.data.identityObj.hostArr[j].uuid) {
                msg.ext.identity = md_dict.roomIdentity.HOST
                return msg.ext
            }
        }
        msg.ext.identity = md_dict.roomIdentity.USER
        return msg.ext
    },

    /**
        消息合并（拉redis消息/拉网易历史消息的空隙，网易实时收到的消息需要去重后添加至主体消息中）
        @param {Object} param 参数
        @return
    */
    mergeMsgs: function (arr) {
        for (let i = 0; i < this.data.msgArr.length; i++) {
            if (!md_common.isInArr(arr, 'msgid', this.data.msgArr[i].msgid)) {
                arr.push(this.data.msgArr[i])
            }
        }
        return arr
    },

    /**
        移除评论
        @param {String} msgId 消息id
        @return
    */
    removeComment: function (msgId) {
        for (let i = 0; i < this.data.commentArr.length; i++) {
            if (this.data.commentArr[i].msgid == msgId) {
                this.data.commentArr.splice(i, 1)
                break
            }
        }
        this.setData({
            commentArr: this.data.commentArr
        })
        if (this.checkCurrRoute('live/audio/comment/comment')) {
            md_common.getCurrPage().removeComment(msgId)
        }
    },

    /**
        下载图片
        @param
        @return
    */
    downloadImages: function (msgs) {
        if (msgs == undefined) {
            for (let i = 0; i < this.data.msgArr.length; i++) {
                if (this.data.msgArr[i].type != md_dict.liveMsgType.IMAGE) {
                    continue
                }
                this.downloadFile(i, (newUrl) => {
                    this.setData({
                        ['msgArr[' + i + '].extend.newUrl']: newUrl
                    })
                    md_storage.live.setMsgNewUrl(this.data.storageMsgId, this.data.msgArr[i].msgid, newUrl)
                })
            }
        } else {
            for (let i = 0; i < msgs.length; i++) {
                if (msgs[i].type != md_dict.liveMsgType.IMAGE) {
                    continue
                }
                for (let j = 0; j < this.data.msgArr.length; j++) {
                    if (this.data.msgArr[j].msgid == msgs[i].msgid) {
                        this.downloadFile(j, (newUrl) => {
                            this.setData({
                                ['msgArr[' + j + '].extend.newUrl']: newUrl
                            })
                            md_storage.live.setMsgNewUrl(this.data.storageMsgId, this.data.msgArr[j].msgid, newUrl)
                        })
                    }
                }
            }
        }
    },

    /**
        下载资源（图片和音频）
        @param {Number} i 资源序号
        @param {Function} callback 回调函数
        @return
    */
    downloadFile: function (i, callback) {
        this.setData({
            ['msgArr[' + i + '].extend.playStatus']: 'loading'
        })
        const msgObj = this.data.msgArr[i]
        if ((msgObj.type == md_dict.liveMsgType.AUDIO || msgObj.type == md_dict.liveMsgType.IMAGE)) {
            const storageMsg = md_storage.live.getMsg(this.data.storageMsgId, msgObj.msgid)
            if (md_common.isEmpty(storageMsg) || md_common.isEmpty(storageMsg.extend.newUrl)) {
                this.wxDownloadFile(msgObj.content.url, callback)
            } else {
                wx.getFileInfo({
                    filePath: storageMsg.extend.newUrl,
                    success: (res) => {
                        typeof (callback) == 'function' ? callback(storageMsg.extend.newUrl) : ''
                    },
                    fail: (res) => {
                        this.wxDownloadFile(msgObj.content.url, callback)
                    }
                })
            }
        }
    },
    /**
        微信下载资源
        @param {String} oldUrl 原链接
        @param {Function} callback 回调函数
        @return
    */
    wxDownloadFile: function (oldUrl, callback) {
        wx.downloadFile({
            url: oldUrl,
            success: (res) => {
                if (res.statusCode == 200) {
                    typeof (callback) == 'function' ? callback(res.tempFilePath) : ''
                } else {
                    this.selectComponent('#mdDialog').tip('文件下载失败,请检查网络设置')
                }
            }
        })
    },

    /**
        banner切换完成
        @param {Dom} e banner
        @return
    */
    finishCurrBanner: function (e) {
        this.setData({
            currBanner: e.detail.current
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
        this.setData({
            comment: ''
        })
        md_chatRoom.sendCustomMsg({
            content: JSON.stringify({
                type: 8,
                text: comment
            }),
            custom: JSON.stringify({
                identity: md_dict.roomIdentity.USER
            }),
            callback: (err, msg) => {
                if (!err) {
                    this.appendComment(this.convertIMData(msg))
                }
            }
        })
    },

    /**
        添加评论
        @param {Object} comment 评论
        @return
    */
    appendComment: function (comment) {
        if (Object.prototype.toString.call(comment) == '[object Object]') {
            if (comment.type == md_dict.liveMsgType.CUSTOM) {
                this.data.commentArr.push(comment)
            }
        } else if (Object.prototype.toString.call(comment) == '[object Array]') {
            for (let i = 0; i < comment.length; i++) {
                if (comment[i].type == md_dict.liveMsgType.CUSTOM) {
                    this.data.commentArr.push(comment[i])
                }
            }
        }
        if (this.data.commentArr.length > 3) {
            this.data.commentArr.splice(0, this.data.commentArr.length - 3)
        }
        this.setData({
            commentArr: this.data.commentArr
        })
        if (this.checkCurrRoute('live/audio/comment/comment')) {
            md_common.getCurrPage().appendComment(comment)
        }
    },

    /**
        初始化历史记录
        @param {Number} currPage 当前页
        @return
    */
    initHistoryList: function (currPage) {
        md_request.api({
            path: md_request.config.live + '/live/content',
            data: {
                token: md_app.globalData.token,
                live_code: this.data.paramObj.liveCode,
                pageIndex: currPage,
                pageLimit: '100',
                sendtime: ''
            },
            callback: (err, res) => {
                if (res.data.code == 200) {
                    let resArr = res.data.data.list
                    for (let i = 0; i < resArr.length; i++) {
                        let url = resArr[i].content.url
                        if (url != undefined && url.indexOf('http:') > -1) {
                            resArr[i].content.url = url.replace('http:', 'https:')
                        }
                        resArr[i].extend = this.getExtendAttr(resArr[i].msgid)
                    }
                    this.setData({
                        tmpMsgArr: this.data.tmpMsgArr.concat(resArr)
                    })
                    if (res.data.data.list.length > 0) {
                        this.initHistoryList(++currPage)
                    } else {
                        this.setData({
                            isMsgLoad: true,
                            msgArr: this.data.tmpMsgArr
                        }, () => {
                            md_storage.live.saveMsgs(this.data.storageMsgId, this.data.msgArr)
                            this.downloadImages()
                        })
                    }
                }
            }
        })
    },
    /**
        初始化关注状态
        @param
        @return
    */
    initFollow: function () {
        md_request.api({
            path: md_request.config.lesson + '/live/isFollow',
            data: {
                token: md_app.globalData.token,
                room_code: this.data.paramObj.room_code
            },
            callback: (err, res) => {
                if (res.data.code == 200) {
                    this.setData({
                        isFollow: res.data.data.is_follow == '0' ? false : true
                    })
                }
            }
        })
    },

	/**
        添加/取消关注
        @param
        @return
    */
	setFollow: function () {
		const setFun = (isFollow) => {
			md_request.api({
				path: md_request.config.live + '/room/setfollow',
				data: {
					token: md_app.globalData.token,
					room_code: this.data.paramObj.room_code,
					status: this.data.isFollow ? '0' : '1'
				},
				callback: (err, res) => {
					if (res.data.code == 200) {
						this.setData({
							isFollow: isFollow
						})
						md_common.refreshPrePage()
					}
				}
			})
		}
		if (this.data.isFollow) {
			this.selectComponent('#mdDialog').confirm('是否取消关注？', '确定', () => {
				setFun(false)
			}, '再想想', () => {

			})
		} else {
			setFun(true)
		}
	},

    /**
        初始化同步学习
        @param
        @return
    */
    initLearn: function () {
        md_request.api({
            path: md_request.config.lesson + '/learn/add',
            data: {
                token: md_app.globalData.token,
                source_code: this.data.paramObj.liveCode,
                source_type: md_dict.resourceType.LIVE,
                rote_code: 0,
                rote_time: 0
            },
            callback: (err, res) => {

            }
        })
    },

    /**
        监听背景音频
        @param
        @return
    */
    onBgAudioManager: function () {
        bgAudioManager.onPrev(() => {
            this.onPrevAudio()
        })
        bgAudioManager.onNext(() => {
            this.onNextAudio()
        })
        bgAudioManager.onPlay(() => {
            this.playAudio()
        })
        bgAudioManager.onPause(() => {
            this.setData({
                ['msgArr[' + currPlayIndex + '].extend.playStatus']: 'stop'
            })
            clearInterval(intervalFun)
        })
        bgAudioManager.onStop(() => {

        })
        bgAudioManager.onEnded(() => {
            this.onEndedAudio()
        })
        bgAudioManager.onError(() => {

        })
        bgAudioManager.onTimeUpdate(() => {

        })
    },

    /**
        点击播放音频
        @param {Dom} e 音频
        @return
    */
    tapAudio: function (e) {
        const data = e.currentTarget.dataset.data, i = e.currentTarget.dataset.i
        const lastPlayIndex = currPlayIndex
        currPlayIndex = i
        currPlayAudio = this.data.msgArr[i]
        if (data.extend.isFirst) { //首次播放-新语音
            this.setData({
                ['msgArr[' + i + '].extend.isFirst']: false,
                ['msgArr[' + i + '].extend.totalTime']: data.content.dur
            })
            this.clearAudio(lastPlayIndex)
            bgAudioManager.stop()
            this.downloadFile(i, (newUrl) => {
                if (this.data.msgArr[i].extend.newUrl != newUrl) {
                    this.setData({
                        ['msgArr[' + i + '].extend.newUrl']: newUrl
                    })
                }
                //下载完成前退出聊天室：语音不播；下载完成前进入评论页，语音继续
                if (!this.checkCurrRoute('live/audio/index/index') && !this.checkCurrRoute('live/audio/comment/comment')) {
                    return
                }
                const msgObj = this.data.msgArr[i]
                //下载完成前播放新语音，本语音不播放
                if (i != currPlayIndex) {
                    return
                }
                md_storage.live.setMsgNewUrl(this.data.storageMsgId, msgObj.msgid, newUrl)
				this.attrAudioSrc(newUrl, msgObj.user_avatar, this.data.paramObj.roomName, msgObj.user_name, this.getIdentity(msgObj.ext))
            })
        } else if (data.extend.playStatus == 'play') { //播放->暂停
            bgAudioManager.pause()
        } else if (data.extend.percent > 0) { //暂停->播放
            bgAudioManager.play()
        } else { //再次播放-老语音
            this.clearAudio(lastPlayIndex)
            bgAudioManager.stop()
			this.attrAudioSrc(data.extend.newUrl, data.user_avatar, this.data.paramObj.roomName, data.user_name, this.getIdentity(data.ext))
        }
    },

    /**
        赋值语音链接
        @param {String} src 音频链接
        @param {String} coverImgUrl 封面图
        @param {String} title 标题
        @param {String} singer 歌手
        @param {String} epname 专辑
        @return
    */
    attrAudioSrc: function (src, coverImgUrl, title, singer, epname) {
        bgAudioManager.src = src
        bgAudioManager.coverImgUrl = md_common.convertAvatar(coverImgUrl)
        bgAudioManager.title = title
        bgAudioManager.singer = singer
        bgAudioManager.epname = ' - ' + epname
    },

    /**
        清空音频
        @param {Number} index 索引
        @return
    */
    clearAudio: function (index) {
        currPlayTime = 0
        this.setData({
            ['msgArr[' + index + '].extend.playStatus']: 'stop',
            ['msgArr[' + index + '].extend.currTime']: 0,
            ['msgArr[' + index + '].extend.percent']: 0
        })
        clearInterval(intervalFun)
    },

    /**
        获取身份
        @param {Object} ext 扩展身份
        @return {String} 身份
    */
    getIdentity: function (ext) {
        if (ext == undefined) {
            return md_dict.roomIdentity.USER
        }
        return md_dict.getRoomIdentity(ext.identity)
    },

    /**
        播放音频
        @param
        @return
    */
    playAudio: function () {
        //播放音频
        this.setData({
            ['msgArr[' + currPlayIndex + '].extend.playStatus']: 'play'
        })
        //刷新音频进度
        clearInterval(intervalFun)
        let interval
        const totalTime = this.data.msgArr[currPlayIndex].content.dur
        if (totalTime < 20 * 1000) {
            interval = 300
        } else {
            interval = 500
        }
        const playFun = () => {
            currPlayTime += interval
            this.setData({
                ['msgArr[' + currPlayIndex + '].extend.currTime']: currPlayTime,
                ['msgArr[' + currPlayIndex + '].extend.percent']: parseInt(currPlayTime / totalTime * 10000) / 100
            })
            //解决bug：后台切换上一首/下一首后关闭播放器，不会调用onStop监听函数（实际音频已停止，但进度条未停止，需主动停止进度条）
            if (bgAudioManager.paused || this.data.msgArr[currPlayIndex].extend.percent >= 100) {
                this.clearAudio(currPlayIndex)
            }
        }
        playFun()
        intervalFun = setInterval(() => {
            playFun()
        }, interval)
        //切换banner(ppt索引)
        const pptUrl = this.data.msgArr[currPlayIndex].ext.PPT_URL
        for (let i = 0; i < this.data.bannerArr.length; i++) {
            if (this.data.bannerArr[i] == pptUrl) {
                this.setData({
                    currBanner: i
                })
                break
            }
        }
        //状态设置已播放
        this.setData({
            ['msgArr[' + currPlayIndex + '].extend.isRead']: true
        })
        md_storage.live.setMsgRead(this.data.storageMsgId, this.data.msgArr[currPlayIndex].msgid)
    },

    /**
        监听音频结束
        @param
        @return
    */
    onEndedAudio: function () {
        //播放结束：状态为100%
        this.setData({
            ['msgArr[' + currPlayIndex + '].extend.currTime']: this.data.msgArr[currPlayIndex].extend.totalTime,
            ['msgArr[' + currPlayIndex + '].extend.percent']: 100
        })
        //状态设为0% && 自动播放下一条
        setTimeout(() => {
            this.setData({
                ['msgArr[' + currPlayIndex + '].extend.playStatus']: 'stop',
                ['msgArr[' + currPlayIndex + '].extend.currTime']: 0,
                ['msgArr[' + currPlayIndex + '].extend.percent']: 0
            })
            this.onNextAudio()
        }, 100)
        //清除定时器
        clearInterval(intervalFun)
    },

    /**
        监听切换上一个音频
        @param
        @return
    */
    onPrevAudio: function () {
        for (let i = currPlayIndex - 1; i >= 0; i--) {
            if (this.data.msgArr[i].type == md_dict.liveMsgType.AUDIO) {
                this.tapAudio({
                    currentTarget: {
                        dataset: {
                            data: this.data.msgArr[i],
                            i: i
                        }
                    }
                })
                break
            }
        }
    },
    /**
        监听切换下一个音频
        @param
        @return
    */
    onNextAudio: function () {
        for (let i = currPlayIndex + 1; i < this.data.msgArr.length; i++) {
            if (this.data.msgArr[i].type == md_dict.liveMsgType.AUDIO) {
                this.tapAudio({
                    currentTarget: {
                        dataset: {
                            data: this.data.msgArr[i],
                            i: i
                        }
                    }
                })
                break
            }
        }
    },

    /**
        语音进度条触摸开始事件
        @param {Object} e 进度条
        @return
    */
    audioXTouchStart: function (e) {
        clearInterval(intervalFun)
    },

    /**
        语音进度条移动监听事件
        @param {Object} x 横坐标
        @param {Object} y 纵坐标
        @return
    */
    audioXChange: function (x, y) {
        if (x.detail.source == 'touch') {
            currPlayX = x.detail.x
        }
    },

    /**
        语音进度条触摸结束事件
        @param {Object} e 进度条
        @return
    */
    audioXTouchEnd: function (e) {
        const totalTime = this.data.msgArr[currPlayIndex].content.dur
        const audioWidth = 240 + totalTime / 1000 / 60 * 180 - 130  //290
        currPlayTime = currPlayX * this.data.rpxRatio / audioWidth * totalTime
        bgAudioManager.seek(Math.round(currPlayTime) / 1000)
    },

    /**
        预览PPT
        @param {Dom} e PPT图片
        @return
    */
    previewPpt: function (e) {
        wx.previewImage({
            current: e.currentTarget.dataset.url,
            urls: this.data.bannerArr
        })
    },
    /**
        预览图片
        @param {Dom} e 图片
        @return
    */
    previewImg: function (e) {
        let arr = []
        for (let i = 0; i < this.data.msgArr.length; i++) {
            if (this.data.msgArr[i].type == md_dict.liveMsgType.IMAGE) {
                arr.push(this.data.msgArr[i].extend.newUrl)
            }
        }
        wx.previewImage({
            current: e.currentTarget.dataset.url,
            urls: arr
        })
    },

	/**
        切换操作指南提醒
        @param
        @return
    */
	checkActionGuide: function () {
		this.setData({
			isActionGuideTip: !this.data.isActionGuideTip
		})
	},
	/**
        隐藏操作指南
        @param
        @return
    */
	hideActionGuide: function () {
		wx.setStorageSync('live_audio_actionGuideTip', this.data.isActionGuideTip)
		this.setData({
			isActionGuideShow: false
		})
	},
    /**
        切换banner显示
        @param
        @return
    */
    changeBannerShow: function () {
        this.setData({
            isBannerShow: !this.data.isBannerShow
        })
    },
    /**
        切换评论显示
        @param
        @return
    */
    changeCommentShow: function () {
        this.setData({
            isCommentMarkShow: !this.data.isCommentMarkShow
        })
    },
    /**
        跳转-评论
        @param
        @return
    */
    goComment: function () {
        if (!this.data.isGoComment) {
            return
        }
        this.setData({
            isCurrPage: false,
            isGoComment: false
        }, () => {
            wx.navigateTo({
                url: '../comment/comment?isPullHistory=' + this.data.paramObj.isPullHistory + '&roomId=' + this.data.paramObj.roomId + '&liveCode=' + this.data.paramObj.liveCode + '&isAllMute=' + this.data.isAllMute + '&isMute=' + this.data.isMute + '&status=' + this.data.paramObj.status
            })
        })
    },

    /**
        监听内容区域滚动条滚动
        @param
        @return
    */
    scrollContent: function () {
        clearTimeout(scrollTimeoutFun)
        this.setData({
            isToTopShow: true
        })
        scrollTimeoutFun = setTimeout(() => {
            clearTimeout(scrollTimeoutFun)
            this.setData({
                isToTopShow: false
            })
        }, 5000)
    },
    /**
        置顶
        @param
        @return
    */
    goTop: function () {
        this.setData({
            scrollTop: 0
        })
    },
    /**
        置底
        @param
        @return
    */
    goBottom: function () {
        this.setData({
            scrollTop: 999999
        })
    },

    /**
        检验当前路由
        @param {String} route 路由
        @return {Boolean} 是否当前路由
    */
    checkCurrRoute: function (route) {
        if (md_common.getCurrPage().route.indexOf(route) > -1) {
            return true
        }
        return false
    },

	/**
    	微信分享
    	@param
    	@return
     */
	onShareAppMessage: function () {
		const prePage = md_common.getPrePage()
		return {
			title: prePage.data.liveDataObj.name,
			imageUrl: prePage.data.liveDataObj.poster,
			path: `/pages/pkgs/college/pages/liveDetail/liveDetail?code=${prePage.options.code}&type=${prePage.options.type}`
		}
	},

    /**
        生命周期函数--监听页面卸载
        @param
        @return
    */
    onUnload: function () {
        //背景音频注销
        bgAudioManager.stop()
        if (this.data.paramObj.isPullHistory == '0') {
            this.destoryChatroom()
        }
        //清除定时器
        clearInterval(intervalFun)
        //刷新历史页面-学习中心排序
        getCurrentPages().map((item) => {
            if (item.route.indexOf('menuList/studyCenter/studyCenter') > -1) {
                item.onLoad(item.options)
            }
        })
    },
    /**
        生命周期函数--监听页面隐藏
        @param
        @return
    */
    onHide: function () {
        //息屏&退出后台(排除:跳转评论区) && 直播中
        if (this.data.isCurrPage && this.data.paramObj.isPullHistory == '0') {
            this.destoryChatroom()
        }
    },

    /**
        销毁chatroom和nim
        @param
        @return
    */
    destoryChatroom: function () {
        md_chatRoom.destory()
    },

    /**
        生命周期函数--监听页面显示
        @param
        @return
    */
    onShow: function () {
        //亮屏&评论区返回(排除:直播详情进入) && 直播详情进入&亮屏(排除:评论区返回) && 直播中
        if (this.data.isHasConnect && this.data.isCurrPage && this.data.paramObj.isPullHistory == '0') {
            this.initImChatRoom()
        }
        this.setData({
            isCurrPage: true,
            isGoComment: true
        })
    }
})