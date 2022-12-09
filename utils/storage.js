/**
    文件描述：缓存工具类
    创建人：卢信桥
    创建时间：2019-10-08
 */

const live = {
    /**
        存储消息
        @param {String} storageId 缓存id
        @param {Array} msgArr 消息集合
        @return
    */
    saveMsgs: function (storageId, msgArr) {
        let copyArr = JSON.parse(JSON.stringify(msgArr))
        /*
        for (let i = 0; i < copyArr.length; i++) {
            if (copyArr[i].type == 'image') {
                copyArr[i].extend.newUrl = ''
            }
        }
        */
        wx.setStorageSync('cg_live_msg_' + storageId, copyArr)
    },
    /**
        获取所有消息
        @param {String} storageId 缓存id
        @return {Array} 缓存资源
    */
    getMsgs: function (storageId) {
        const arr = wx.getStorageSync('cg_live_msg_' + storageId)
        if (arr == '') {
            return []
        }
        return arr
    },
    /**
        获取单条消息
        @param {String} storageId 缓存id
        @param {String} msgid 消息id
        @return {Object} 消息
    */
    getMsg: function (storageId, msgid) {
        const msgArr = this.getMsgs(storageId)
        for (let i = 0; i < msgArr.length; i++) {
            if (msgArr[i].msgid == msgid) {
                return msgArr[i]
            }
        }
        return {}
    },
    /**
        设置消息的文件地址
        @param {String} storageId 缓存id
        @param {String} msgid 消息id
        @param {String} newUrl 新文件链接
        @return
    */
    setMsgNewUrl: function (storageId, msgid, newUrl) {
        let msgArr = this.getMsgs(storageId)
        for (let i = 0; i < msgArr.length; i++) {
            if (msgArr[i].msgid == msgid) {
                msgArr[i].extend.newUrl = newUrl
                break
            }
        }
        this.saveMsgs(storageId, msgArr)
    },
    /**
        设置消息已读
        @param {String} storageId 缓存id
        @param {String} msgid 消息id
        @return
    */
    setMsgRead: function (storageId, msgid) {
        let msgArr = this.getMsgs(storageId)
        for (let i = 0; i < msgArr.length; i++) {
            if (msgArr[i].msgid == msgid) {
                msgArr[i].extend.isRead = true
                break
            }
        }
        this.saveMsgs(storageId, msgArr)
    },
    /**
        存储昵称&头像
        @param {String} storageId 缓存id
        @param {Array} nickArr 昵称&头像集合
        @return
    */
    saveNicks: function (storageId, nickArr) {
        wx.setStorageSync('cg_live_nick_' + storageId, nickArr)
    },
    /**
        获取所有昵称&头像
        @param {String} storageId 缓存id
        @return {Array} 昵称&头像集合
    */
    getNicks: function (storageId) {
        const arr = wx.getStorageSync('cg_live_nick_' + storageId)
        if (arr == '') {
            return []
        }
        return arr
    },
    /**
        获取单条昵称&头像
        @param {String} storageId 缓存id
        @param {String} from 来源人id
        @return {Object} 昵称&头像
    */
    getNick: function (storageId, from) {
        const nickArr = this.getNicks(storageId)
        for (let i = 0; i < nickArr.length; i++) {
            if (nickArr[i].from == from) {
                return nickArr[i]
            }
        }
        return {}
    }
}

const kegel = {
    /**
        获取异常提交的训练记录
        @param
        @return {Array} 缓存资源
    */
    getTrainRecord: function () {
        const trainRecordArr = wx.getStorageSync('trainRecordArr')
        return trainRecordArr ? trainRecordArr : []
    },
    /**
        保存异常提交的训练记录
        @param {Array} trainRecordArr 异常记录的数组
        @return
    */
    setTrainRecord: function (trainRecordArr) {
        wx.setStorageSync('trainRecordArr', trainRecordArr)
    },
    /**
        保存用户手机号
        @param {String} phone 用户手机号
        @return
    */
    setPhone: function (phone) {
        wx.setStorageSync('phone', phone)
    }
}

const meet = {
    /**
        获取exam_code
        @param
        @return {String} 缓存资源
    */
    getExamCode: function () {
        const exam_code = wx.getStorageSync('exam_code')
        return exam_code ? exam_code : ''
    },
    /**
        保存异常提交的训练记录
        @param {String} exam_code 考试的exam_code
        @return
    */
    setExamCode: function (exam_code) {
        wx.setStorageSync('exam_code', exam_code)
    }
}

const systemInfo = {
    /**
        获取键盘高度
        @param
        @return {Number} 键盘高度
    */
    getKbHeight: function () {
        const kbHeight = wx.getStorageSync('kbHeight')
        return kbHeight ? kbHeight : 0
    },
    /**
        保存键盘高度
        @param {Number} kbHeight 键盘高度
        @return
    */
    setKbHeight: function (kbHeight) {
        wx.setStorageSync('kbHeight', kbHeight)
    }
}

module.exports = {
    live: live,
    kegel: kegel,
    meet: meet,
    systemInfo: systemInfo
}