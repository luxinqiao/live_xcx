const md_request = require('../../../../../../utils/request.js')
const md_storage = require('../../../../../../utils/storage.js')
const md_common = require('../../../../../../utils/common.js')
const md_dict = require('../../../../../../utils/dict.js')
const md_chatRoom = require('../../../../../../utils/chatRoom.js')
const md_app = getApp()
let scrollTimeoutFun, dialogIntervalFun

Page({
    data: {
        paramObj: {},
		liveObj: {
			textArr: ['原画', '高清', '流畅'],
			currIndex: 1,
			currSrc: ''
		},
        isToTopShow: false,
        scrollTop: 0,
        msgArr: [],
		currPage: 1,
		isLast: false,
        isMsgLoad: false,
		isLoading: true,
		scrollPos: 0,
        isFollow: false,
        isAllMute: false,
        isMute: false,
        isBlack: false,
        isFirstShow: true,
        identityObj: {
            adminArr: [],
            honorArr: [],
            hostArr: []
        },
        storageMsgId: '',
        platform: '',
		isIphoneX: md_app.globalData.isIphoneX,
        playBackUrl: '',
        isLiveFull: false,
		liveDialogObj: {
			isShow: false,
			type: 'alertCount',
			alertCount: 10,
			alertCountMsg: '',
			tip: ''
		}
    },

    /**
        生命周期函数--监听页面加载
        @param {Object} options 页面参数
        @return
    */
    onLoad: function (options) {
		this.initPage(options)
		this.initData(options)
    },

	/**
        初始化页面
        @param {Object} options 页面参数
        @return
    */
	initPage: function (options) {
		wx.setNavigationBarTitle({
			title: `${options.liveName.replace('直播', 'LIVE')}`
		})
		this.setData({
			paramObj: options,
			'liveObj.currSrc': decodeURIComponent(options.currLive),
			storageMsgId: wx.getStorageSync('token') + '_' + options.roomId,
			platform: md_app.globalData.platform
		})
		if (options.status == md_dict.roomStatus.END && options.pushStatus == md_dict.pushStatus.BACK) {
			this.getPlayBackUrl(options.vid)
		}
	},
	/**
        初始化数据
        @param {Object} options 页面参数
        @return
    */
	initData: function (options) {
		if (options.isPullHistory == '0') {
			this.initIdentity(() => {
				this.initImChatRoom()
			})
		} else if (options.isPullHistory == '1') {
			this.initIdentity(() => {
				this.initHistoryList()
			})
		}
		this.initFollow()
		this.initLearn()
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
		
    },
    /**
        监听Nim断开连接
        @param {Object} err 断开连接对象
        @return
    */
    onNimDisconnect: function (err) {
        
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
		this.getImHistoryMsgs(0)
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
						this.alertCountDialog('十分抱歉, 因违反课堂纪律, 您已被请出直播课堂。')
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
            let msgArr = []
            for (let i = 0; i < msgs.length; i++) {
                if (md_common.isInArr(this.data.msgArr, 'msgid', msgs[i].msgid)) {
                    continue
                }
                if (msgs[i].type == 'tip') {
					this.doTipAction(JSON.parse(msgs[i].tip))
                } else if (msgs[i].type == 'notification') {
					this.doNotifiAction(msgs[i].attach)
				} else if (msgs[i].type == 'text' || msgs[i].type == 'image'){
					msgArr.push(this.refreshMsgAttr(md_chatRoom.convertIMData(msgs[i])))
                }
            }
            if (msgArr.length > 0) {
                this.setData({
					msgArr: this.filterMsgs(this.data.msgArr.concat(msgArr))
                }, ()=> {
					md_storage.live.saveMsgs(this.data.storageMsgId, this.data.msgArr)
					this.downloadImages(msgArr)
				})
            }
        } catch (err) {

        }
    },

	/**
        处理tip消息
        @param {Object} tipObj tip消息
        @return
    */
	doTipAction: function (tipObj) {
		//0：直播开始，1：ppt更新，2：ppt滑动，3：评论删除，4：直播结束，5：管理员、嘉宾身份转换，6：点赞，7: 开播倒计时20分钟，8：人气增加，9：针对嘉宾的过滤词，10：针对嘉宾的过滤切换，11：嘉宾开始直播，12：嘉宾结束直播
		if (tipObj.type == 0) {
			this.setData({
				'paramObj.status': md_dict.roomStatus.BEGIN
			})
		} else if (tipObj.type == 3) {
			for (let i = 0; i < this.data.msgArr.length; i++) {
				if (this.data.msgArr[i].msgid == tipObj.content) {
					this.data.msgArr.splice(i, 1)
					this.setData({
						msgArr: this.data.msgArr
					})
					break
				}
			}
		} else if (tipObj.type == 4) {
			this.setData({
				'paramObj.status': md_dict.roomStatus.END
			})
		} else if (tipObj.type == 5) {
			this.initIdentity()
		} else if (tipObj.type == 8) {
			this.setData({
				'paramObj.pop': this.data.paramObj.pop + parseInt(tipObj.content)
			})
		} else if (tipObj.type == 11) {
			this.setData({
				'paramObj.status': md_dict.roomStatus.BEGIN,
				'liveObj.currSrc': tipObj.content.full,
				'paramObj.pushStatus': md_dict.pushStatus.BEGIN
			})
		} else if (tipObj.type == 12) {
			this.setData({
				'paramObj.pushStatus': md_dict.pushStatus.END,
				isLiveFull: false
			})
		}
	},

	/**
        处理通知消息
        @param {Object} attachObj 通知消息
        @return
    */
	doNotifiAction: function (attachObj){
		//memberEnter：用户进入聊天室，gagMember：被禁言，ungagMember：解除禁言，muteRoom：全体禁言，unmuteRoom：解除全体禁言，blackMember：拉黑，removeManager：移除嘉宾，addManager：添加嘉宾
		if (attachObj.type == 'memberEnter') {
			this.setData({
				'paramObj.pop': parseInt(this.data.paramObj.pop) + 1
			})
		} else if (attachObj.type == 'gagMember') {
			for (let j = 0; j < attachObj.to.length; j++) {
				if (attachObj.to[j] == wx.getStorageSync('wyimAccid')) {
					this.setData({
						isMute: true
					})
					this.tipDialog('您已被禁言')
				}
			}
		} else if (attachObj.type == 'ungagMember') {
			for (let j = 0; j < attachObj.to.length; j++) {
				if (attachObj.to[j] == wx.getStorageSync('wyimAccid')) {
					this.setData({
						isMute: false
					})
					this.tipDialog('您已被解除禁言')
				}
			}
		} else if (attachObj.type == 'muteRoom') {
			this.setData({
				isAllMute: true
			})
			this.tipDialog('全体禁言开启')
		} else if (attachObj.type == 'unmuteRoom') {
			this.setData({
				isAllMute: false
			})
			this.tipDialog('全体禁言关闭')
		} else if (attachObj.type == 'blackMember') {
			//此处可接收他人被拉黑消息，自己被拉黑至onChatRoomDisconnect->kicked->blacked中处理
		} else if (attachObj.type == 'removeManager') {
			this.initIdentity()
		} else if (attachObj.type == 'addManager') {
			this.initIdentity()
		}
	},

    /**
        获取IM历史消息（文本、图片）
        @param {String} timetag 时间戳
        @return
    */
    getImHistoryMsgs: function (timetag) {
        md_chatRoom.getHistoryMsgs({
            timetag: timetag,
            limit: 100,
            reverse: false,
            msgTypes: ['text', 'image'],
            done: (error, obj) => {
                if (!error) {
					if (obj.msgs.length == 0) {
						this.setData({
							isLast: true
						})
					}
					obj.msgs = obj.msgs.reverse()
                    for (let i = 0; i < obj.msgs.length; i++) {
						obj.msgs[i] = this.refreshMsgAttr(md_chatRoom.convertIMData(obj.msgs[i]))
                    }
					if (timetag == 0) {
						this.setData({
							msgArr: obj.msgs,
							isMsgLoad: true,
							isLoading: false
						}, () => {
							md_storage.live.saveMsgs(this.data.storageMsgId, this.data.msgArr)
							this.downloadImages(obj.msgs)
							if (this.data.isFirstShow) {
								this.goBottom()
							}
						})
					} else {
						this.setData({
							msgArr: obj.msgs.concat(this.data.msgArr)
						}, () => {
							this.setData({
								isLoading: false
							})
							if (obj.msgs.length > 0) {
								this.setData({
									scrollPos: obj.msgs.length
								})
							}
							md_storage.live.saveMsgs(this.data.storageMsgId, this.data.msgArr)
							this.downloadImages(obj.msgs)
						})
					}
                }
            }
        })
    },

	/**
        过滤消息（保留100条）
        @param {Array} msgArr 消息
        @return {Array} 过滤后消息
    */
	filterMsgs: function (msgArr) {
		if (msgArr.length > 100) {
			msgArr.splice(0, msgArr.length - 100)
		}
		return msgArr
	},

    /**
        刷新消息属性（扩展属性、自定义属性（身份））
        @param {Object} msg 消息
        @return {Object} 刷新后的消息
    */
    refreshMsgAttr: function (msg) {
		const storageMsg = md_storage.live.getMsg(this.data.storageMsgId, msg.msgid)
		if (md_common.isEmpty(storageMsg) || md_common.isEmpty(storageMsg.extend)) {
			msg.extend = {
				newUrl: ''
			}
		} else {
			msg.extend = storageMsg.extend
		}
		msg.ext = md_chatRoom.getExtIdentity(msg, this.data.identityObj)
        return msg
    },
    
    /**
        下载图片
        @param {Array} msgs 消息集
        @return
    */
    downloadImages: function (msgs) {
		for (let i = 0; i < msgs.length; i++) {
			if (msgs[i].type != md_dict.liveMsgType.IMAGE) {
				continue
			}
			for (let j = 0; j < this.data.msgArr.length; j++) {
				if (this.data.msgArr[j].msgid == msgs[i].msgid) {
					const storageMsg = md_storage.live.getMsg(this.data.storageMsgId, this.data.msgArr[j].msgid)
					md_chatRoom.downloadFile(storageMsg, this.data.msgArr[j].content.url, (newUrl) => {
						this.setData({
							['msgArr[' + j + '].extend.newUrl']: newUrl
						})
						md_storage.live.setMsgNewUrl(storageMsg, this.data.msgArr[j].msgid, newUrl)
					}, () => {
						this.selectComponent('#mdDialog').tip('图片下载失败,请检查网络设置')
					})
					break
				}
			}
		}
    },
    
	/**
        切换直播清晰度（直播组件绑定）
        @param {Dom} e 清晰度
        @return
    */
	changeLive: function (e) {
		this.setLiveUrls(e.detail.currentTarget.dataset.index)
	},
	/**
        自动降低直播清晰度（直播组件绑定）
        @param
        @return
    */
	autoLowerLive: function () {
		let lowerIndex = this.data.liveObj.currIndex + 1
		if (lowerIndex > this.data.liveObj.textArr.length - 1) {
			lowerIndex = this.data.liveObj.textArr.length - 1
		}
		this.setLiveUrls(lowerIndex)
	},
	/**
        设置直播链接
        @param
        @return
    */
	setLiveUrls: function (index) {
		md_request.api({
			path: md_request.config.lesson + '/live/pull-url',
			data: {
				token: md_app.globalData.token,
				live_code: this.data.paramObj.liveCode
			},
			callback: (err, res) => {
				if (res.data.code == 200) {
					let url = ''
					if (index == 0) {
						url = res.data.data.full
					} else if (index == 1) {
						url = res.data.data.lhd
					} else if (index == 2) {
						url = res.data.data.lld
					}
					this.setData({
						'liveObj.currIndex': index,
						'liveObj.currSrc': url
					})
				}
			}
		})
	},

    /**
        发送消息
        @param
        @return
    */
    sendMsg: function (e) {
		const msg = md_common.trimStr(e.detail)
		if (msg == '') {
            this.selectComponent('#mdDialog').tip('请输入内容')
            return
        }
        md_chatRoom.sendText({
			text: msg,
			callback: (err, resMsg) => {
                if (!err) {
					this.data.msgArr.push(this.refreshMsgAttr(md_chatRoom.convertIMData(resMsg)))
                    this.setData({
						msgArr: this.filterMsgs(this.data.msgArr)
                    }, ()=> {
						this.goBottom()
					})
                }
            }
        })
    },

    /**
        初始化历史记录
        @param
        @return
    */
    initHistoryList: function () {
        md_request.api({
            path: md_request.config.live + '/live/content',
            data: {
                token: md_app.globalData.token,
                live_code: this.data.paramObj.liveCode,
				pageIndex: this.data.currPage,
                pageLimit: 100
            },
            callback: (err, res) => {
                if (res.data.code == 200) {
					if (this.data.currPage >= parseInt(res.data.data.pageCount)) {
						this.setData({
							isLast: true
						})
					}
                    let resArr = res.data.data.list.reverse()
                    for (let i = 0; i < resArr.length; i++) {
                        let url = resArr[i].content.url
                        if (url != undefined && url.indexOf('http:') > -1) {
                            resArr[i].content.url = url.replace('http:', 'https:')
                        }
						resArr[i] = this.refreshMsgAttr(resArr[i])
                    }
					if (this.data.currPage == 1) {
						this.setData({
							msgArr: resArr.concat(this.data.msgArr),
							isLoading: false,
							isMsgLoad: true
						}, () => {
							md_storage.live.saveMsgs(this.data.storageMsgId, this.data.msgArr)
							this.downloadImages(resArr)
							this.goBottom()
						})
					} else {
						this.setData({
							msgArr: resArr.concat(this.data.msgArr)
						}, () => {
							this.setData({
								isLoading: false,
								scrollPos: resArr.length
							})
							md_storage.live.saveMsgs(this.data.storageMsgId, this.data.msgArr)
							this.downloadImages(resArr)
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
		const setFun = (isFollow)=> {
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
    	获取回放地址
    	@param {String} vid  媒体的 vod 编号
    	@param {Number} index 回放的下标
    	@return
     */
	getPlayBackUrl(vid) {
		md_request.api({
			path: md_request.config.lesson + '/live/vod-auth',
			data: {
				token: md_app.globalData.token,
				live_code: this.data.paramObj.liveCode,
				vid: vid
			},
			callback: (err, res) => {
				if (res.data.code != '200') {
					this.selectComponent('#mdDialog').tip(res.data.note)
					return
				}
				this.setData({
					playBackUrl: res.data.data.fileinfo.FileURL
				})
			},
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
			current: e.currentTarget.dataset.src,
			urls: arr
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
        滚动条触顶事件（上滑分页）
        @param {Dom} e 滚动条
        @return
    */
	scrolltoupper: function (e) {
		if (this.data.isLast || this.data.isLoading) {
			return
		}
		if (this.data.paramObj.isPullHistory == '0' && this.data.paramObj.status == md_dict.roomStatus.END) { //直播结束，拉网易历史消息
			this.setData({
				isLoading: true
			}, () => {
				this.getImHistoryMsgs(this.data.msgArr[0].sendtime)
			})
		} else if (this.data.paramObj.isPullHistory == '1') { //拉后端历史消息
			this.setData({
				isLoading: true,
				currPage: this.data.currPage + 1
			}, ()=> {
				this.initHistoryList()
			})
		}
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
    	切换直播视频全屏
    	@param {object} e 组件传的值
    	@return
     */
	changeFullScreen:function (e) {
        this.setData({
			isLiveFull: e.detail
        })
    },

	/**
	    弹出框点击确定
        @param
        @return
    */
	tapAlertCount: function () {
		clearInterval(dialogIntervalFun)
		wx.navigateBack({
			delta: 1
		})
	},
	/**
        消息提示框
        @param {String} msg 提示消息
        @return
    */
	tipDialog: function (msg) {
		if (this.selectComponent('#mdLive') == null || !this.selectComponent('#mdLive').checkFullScreen()) {
			this.selectComponent('#mdDialog').tip(msg)
		} else {
			this.setData({
				'liveDialogObj.isShow': true,
				'liveDialogObj.type': 'tip',
				'liveDialogObj.tip': msg
			})
			setTimeout(() => {
				this.setData({
					'liveDialogObj.isShow': false
				})
			}, 2000)
		}
	},
	/**
        倒计时框
        @param {String} msg 倒计时消息
        @return
    */
	alertCountDialog: function (msg) {
		if (this.selectComponent('#mdLive') == null || !this.selectComponent('#mdLive').checkFullScreen()) {
			this.selectComponent('#mdDialog').alertCount(msg, '确定', () => {
				wx.navigateBack({
					delta: 1
				})
			}, 10)
		} else {
			this.setData({
				'liveDialogObj.isShow': true,
				'liveDialogObj.type': 'alertCount',
				'liveDialogObj.alertCountMsg': msg
			})
			dialogIntervalFun = setInterval(() => {
				this.setData({
					'liveDialogObj.alertCount': this.data.liveDialogObj.alertCount - 1
				})
				if (this.data.liveDialogObj.alertCount == 0) {
					clearInterval(dialogIntervalFun)
					wx.navigateBack({
						delta: 1
					})
				}
			}, 1000)
		}
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
        if (this.data.paramObj.isPullHistory == '0') {
			md_chatRoom.destory()
        }
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
		if (this.data.isFirstShow) {
			this.setData({
				isFirstShow: false
			})
		}
        //息屏&退出后台 && 直播中
        if (this.data.paramObj.isPullHistory == '0') {
			md_chatRoom.destory()
        }
    },

    /**
        生命周期函数--监听页面显示
        @param
        @return
    */
    onShow: function () {
		//亮屏(排除:直播详情进入) && 直播中
		if (!this.data.isFirstShow && this.data.paramObj.isPullHistory == '0') {
			this.initImChatRoom()
		}
    }
})