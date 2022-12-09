/**
    文件描述：聊天室工具类(集成网易IM)
    创建人：卢信桥
    创建时间：2020-02-08
 */
const md_common = require('./common.js')
const md_request = require('./request.js')
const md_dict = require('./dict.js')
const md_nimSdk = require('../third/nim/NIM_Web_SDK_weixin_v7.2.0.js')
const md_app = getApp()
let nim, chatroom
let paramObj = {
    roomId: '', //直播间id
    onNimConnect: () => {},
    onNimDisconnect: ()=> {}, 
    onChatRoomConnect: ()=> {}, //IM连接成功回调（回调需主动触发获取IM历史消息）
    onChatRoomDisconnect: ()=> {}, //IM连接失败回调
    onChatRoomMsgs: ()=> {} //IM接收消息回调
}

/**
    初始化获取IM所需账户信息
    @param
    @return
 */
const init = (param)=> {
    paramObj = param
    const wyimAccid = wx.getStorageSync('wyimAccid'), wyimToken = wx.getStorageSync('wyimToken')
    if (md_common.isEmpty(wyimAccid) || md_common.isEmpty(wyimToken)) {
        //获取身份
        md_request.api({
            path: md_request.config.rih + '/Login/getUserInfo',
            data: {
                token: md_app.globalData.token
            },
            callback: (err, res) => {
                if (res.data.code == '200') {
                    wx.setStorageSync('wyimAccid', res.data.data.UserInfo.wyimAccid)
                    wx.setStorageSync('wyimToken', res.data.data.UserInfo.wyimToken)
                    initNim()
                }
            }
        })
    } else {
        initNim()
    }
}

/**
    初始化网易IM
    @param
    @return
 */
const initNim = ()=> {
    nim = md_nimSdk.NIM.getInstance({
        appKey: md_request.config.appKey,
        account: wx.getStorageSync('wyimAccid'),
        token: wx.getStorageSync('wyimToken'),
        onconnect: (res) => {
            paramObj.onNimConnect(res)
            nim.getChatroomAddress({
                chatroomId: paramObj.roomId,
                done: (err, obj) => {
                    if (!err) {
                        initChatRoom(obj.address)
                    }
                }
            })
        },
        onwillreconnect: () => {

        },
        ondisconnect: (err) => {
            paramObj.onNimDisconnect(err)
        },
        onerror: () => {

        }
    })
}

/**
    初始化直播室（获取聊天室历史记录）
    @param {Array} addressArr 地址
    @return
*/
const initChatRoom = (addressArr)=> {
    chatroom = md_nimSdk.Chatroom.getInstance({
        appKey: md_request.config.appKey,
        account: wx.getStorageSync('wyimAccid'),
        token: wx.getStorageSync('wyimToken'),
        chatroomId: paramObj.roomId,
        chatroomAddresses: addressArr,
        onconnect: (obj) => {
            paramObj.onChatRoomConnect(obj)
        },
        onerror: (err, obj) => {

        },
        onwillreconnect: (obj) => {

        },
        ondisconnect: (err) => {
            paramObj.onChatRoomDisconnect(err)
        },
        onmsgs: (msgs) => {
            paramObj.onChatRoomMsgs(msgs)
        }
    })
}

/**
    获取IM历史消息
    @param {Object} param 参数
    @return
 */
const getHistoryMsgs = (param) => {
    chatroom.getHistoryMsgs(param)
}

/**
    销毁IM实例
    @param
    @return
 */
const destory = () => {
    chatroom.destroy()
    nim.destroy()
}

/**
    发送文本消息
    @param {Object} param 参数
    @return
 */
const sendText = (param) => {
    chatroom.sendText({
        text: param.text,
        done: (err, msg) => {
            param.callback(err, msg)
        }
    })
}

/**
    发送自定义消息
    @param {Object} param 参数
    @return
 */
const sendCustomMsg = (param) => {
    chatroom.sendCustomMsg({
        content: param.content,
        custom: param.custom,
        done: (err, msg) => {
            param.callback(err, msg)
        }
    })
}

/**
	转换IM数据
	@param {Object} obj IM数据
	@return {Object} 规范数据
*/
const convertIMData = (obj) => {
	let resObj = {
		msgid: obj.idClient,
		fromAccount: obj.from,
		user_avatar: obj.fromAvatar,
		user_name: obj.fromNick,
		sendtime: obj.time,
		create_at: md_common.dateFormat(obj.time, 'YYYY-MM-DD hh:mm:ss'),
		ext: obj.custom == undefined ? {} : JSON.parse(obj.custom)
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
}

/**
    刷新昵称&头像(根据最后一条消息头像&昵称刷新历史消息头像&昵称)
    @param {Array} msgs 消息集
    @return {Array} 刷新昵称&头像后的消息集
*/
const refreshNick = (param) => {
    let msgs = JSON.parse(JSON.stringify(param.msgs))
    if (param.isReverse) {
        msgs = msgs.reverse()
    }
    //1.缓存记录最新昵称&头像
    let nickArr = []
    for (let i = 0; i < msgs.length; i++) {
        let isIn = false
        for (let j = 0; j < nickArr.length; j++) {
            if (nickArr[j].from == msgs[i].from) {
                if (nickArr[j].i <= i) {
                    nickArr[j].i = i
                    nickArr[j].fromAvatar = msgs[i].fromAvatar
                    nickArr[j].fromNick = msgs[i].fromNick
                }
                isIn = true
                break
            }
        }
        if (!isIn) {
            nickArr.push({
                i: i,
                from: msgs[i].from,
                fromAvatar: msgs[i].fromAvatar,
                fromNick: msgs[i].fromNick
            })
        }
    }
    //2.刷新历史消息的昵称&头像
    for (let i = 0; i < param.msgs.length; i++) {
        for (let j = 0; j < nickArr.length; j++) {
            if (nickArr[j].from == param.msgs[i].from) {
                param.msgs[i].fromAvatar = nickArr[j].fromAvatar,
                param.msgs[i].fromNick = nickArr[j].fromNick
                break
            }
        }
    }
    return param.msgs
}

/**
    获取自定义身份
    @param {Object} msg 消息
	@param {Object} identityObj 身份
    @return {String} 自定义身份
 */
const getExtIdentity = (msg, identityObj) => {
	if (msg.type == md_dict.liveMsgType.CUSTOM) {
		return msg.ext
	}
	if (msg.ext == undefined) {
		msg.ext = {}
	}
	for (let i = 0; i < identityObj.adminArr.length; i++) {
		if (msg.fromAccount == identityObj.adminArr[i].uuid) {
			msg.ext.identity = md_dict.roomIdentity.ADMIN
			return msg.ext
		}
	}
	for (let i = 0; i < identityObj.honorArr.length; i++) {
		if (msg.fromAccount == identityObj.honorArr[i].uuid) {
			msg.ext.identity = md_dict.roomIdentity.HONOR
			return msg.ext
		}
	}
	for (let j = 0; j < identityObj.hostArr.length; j++) {
		if (msg.fromAccount == identityObj.hostArr[j].uuid) {
			msg.ext.identity = md_dict.roomIdentity.HOST
			return msg.ext
		}
	}
	msg.ext.identity = md_dict.roomIdentity.USER
	return msg.ext
}

/**
	下载资源
	@param {Object} storageMsg 缓存资源
	@param {String} oldUrl 原文件路径
	@param {Function} successFun 成功回调函数
	@param {Function} failFun 失败回调函数
	@return
*/
const downloadFile = (storageMsg, oldUrl, successFun, failFun) => {
	if (md_common.isEmpty(storageMsg) || md_common.isEmpty(storageMsg.extend.newUrl)) {
		wxDownloadFile(oldUrl, successFun, failFun)
	} else {
		wx.getFileInfo({
			filePath: storageMsg.extend.newUrl,
			success: (res) => {
				typeof (successFun) == 'function' ? successFun(storageMsg.extend.newUrl) : ''
			},
			fail: (res) => {
				wxDownloadFile(oldUrl, successFun, failFun)
			}
		})
	}
}

/**
	微信下载资源（内部方法）
	@param {String} oldUrl 原文件路径
	@param {Function} successFun 成功回调函数
	@param {Function} failFun 失败回调函数
	@return
*/
const wxDownloadFile = (oldUrl, successFun, failFun) => {
	wx.downloadFile({
		url: oldUrl,
		success: (res) => {
			if (res.statusCode == 200) {
				typeof (successFun) == 'function' ? successFun(res.tempFilePath) : ''
			} else {
				typeof (failFun) == 'function' ? failFun() : ''
			}
		}
	})
}

//模块化导出
module.exports = {
    init: init,
    getHistoryMsgs: getHistoryMsgs,
    destory: destory,
    sendText: sendText,
    sendCustomMsg: sendCustomMsg,
	convertIMData: convertIMData,
    refreshNick: refreshNick,
	getExtIdentity: getExtIdentity,
	downloadFile: downloadFile
}