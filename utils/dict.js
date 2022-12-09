/**
    文件描述：字节处理
    创建人：赵志银
    创建时间：2019-08-15
*/

//资源类型
var resourceType = {
    COURSE: '0', //课程
    COLUMN: '1', //专栏
    LIVE: '2' //直播
}
//直播状态
var liveStatus = {
    NOSTART: '0', //预告
    INPROGRESS: '1', //直播中
    END: '2' //结束
}
//直播消息类型
var liveMsgType = {
    TEXT: '0', //文本
    IMAGE: '1', //图片
    AUDIO: '2', //语音
    CUSTOM: '100' //自定义
}
//自定义消息Ext类型
var customExtType = {
	COMMENT: '0', //评论
	GIFT: '1' //礼物
}
//直播间状态
var roomStatus = {
    PRE: '0', //未开始
    BEGIN: '1', //直播中
    END: '2' //已结束
}
//直播间推流状态
var pushStatus = {
	PRE: '0', //未开始
	BEGIN: '1', //直播中
	END: '2', //直播结束
	BACK: '3' //回放中
}
//直播间身份
var roomIdentity = {
    USER: '0', //普通用户
    HOST: '1', //主持人
    HONOR: '2', //嘉宾
    ADMIN: '3' //管理员
}
//直播类型
var liveType = {
    AUDIO: '0', //音频
    VIDEO: '1' //视频
}
// 分娩次数
var deliverCount = {
    NOFILED: '-1', //未填写
    UNFERTILITY: '0', //未生育
    TIRE: '1', //一胎
    CHILDSECOND: '2', //二胎
    TRIPLET: '3' //三胎及以上
}

// 分娩次数文案
var deliverText = ['未生育','一胎','二胎','三胎及以上']

// 流产次数
var abortionCount = {
    NOFILED: '-1', //未填写
    NONABORTION: '0', //0次
    ONCEABORTION: '1', //1次
    TWICEABORTION: '2', //2次
    MULTIPABORTION: '3' //3次及以上
}

// 流产次数文案
var abortionText = ['0次', '1次', '2次', '3次及以上']

// 性别文案
var sexText = ['男', '女']

// 实名认证
var realName = {
    REALNAMENEVER: '0', //未实名认证
    REALNAMEIN: '1', //实名认证中
    REALNAMEHAS: '2', //已实名认证
    REALNAMEFAIL: '3', //实名认证失败
}
//机构认证
var agency = {
    AGENCYNEVER: '0', //未认证
    AGENCYIN: '1', //认证中
    AGENCYHAS: '2', //已认证
    AGENCYFAIL: '3' //认证失败
}
//订单状态
var orderStatus = {
    UNPAY: '0', //未支付
    HASPAY: '1', //已支付
    HASCANCEL: '2', //已取消
    APPLYREFUND: '3', //申请退款
    HASREFUND: '4', //已退款
}
//订单类型
var orderType = {
    VIRTUAL: '0', //虚拟订单
    ENTITY: '1' //实物订单
}
//支付方式
var payMethod = {
    ALI: '0', //支付宝
    WeChat: '1', //微信
    UnionPay: '2', //银联
    ApplePay: '3', //Apple Pay
    Free: '4', //免费
    Wrightin: '5', //澜渟币
    ALIWrightin: '50', //支付宝+澜渟币
    WeChatWrightin: '51', //微信+澜渟币
    ApplePayWrightin: '53' //Apple Pay+澜渟币
}
//商品类型
var productType = {
    UNKNOWN: '0', //未知
    EXAM: '1', //考试
    COURSE: '2', //课程
    COLUMN: '3', //专栏
    MEETINGTICKET: '4', //会议门票
    MEETINGNOTE: '5', //会议讲义
    ASSESS: '6', //评估
    COIN: '7', //澜渟币
    PLAN: '8', //方案
}
//发票抬头类型
var invoiceHead = {
    PERSON: '0', //个人
    COMPANY: '1' //单位
}
//发票类型
var invoiceType = {
    COMMON: '0', //普通发票
    VAT: '1' //增值税专用发票
}
//发票状态
var invoiceStatus = {
    UNAPPLY: '0', //待申请
    CHECKING: '1', //审核中
    CHECKPASS: '2', //审核通过
    GRANTING: '3', //开票中
    HASGRANT: '4', //已开票
    OVERTIME: '5' //已过期
}

/**
    获取资源类型
    @param {Number}val 字典值
    @return {String} 字典描述
*/
var getResourceType = function (val) {
    if (val == resourceType.COURSE) {
        return '课程'
    } else if (val == resourceType.COLUMN) {
        return '专栏'
    } else if (val == resourceType.LIVE) {
        return '直播'
    }
    return val
}
/**
    获取直播状态
    @param {Number}val 字典值
    @return {String} 字典描述
*/
var getLiveStatus = function (val) {
    if (val == liveStatus.NOSTART) {
        return '预告'
    } else if (val == liveStatus.INPROGRESS) {
        return '直播中'
    } else if (val == liveStatus.END) {
        return '结束'
    }
    return val
}
/**
    获取直播状态
    @param {Number}val 字典值
    @return {String} 字典描述
*/
var getLiveStatus_2 = function (val) {
    if (val == liveStatus.NOSTART) {
        return '预告'
    } else if (val == liveStatus.INPROGRESS) {
        return '直播中'
    } else if (val == liveStatus.END) {
        return '已结束'
    }
    return val
}
/**
    获取直播间状态
    @param {Number}val 字典值
    @return {String} 字典描述
*/
var getRoomStatus = function (val) {
    if (val == roomStatus.PRE) {
        return '未开始'
    } else if (val == roomStatus.BEGIN) {
        return '直播中'
    } else if (val == roomStatus.END) {
        return '已结束'
    }
    return val
}
/**
    获取直播间身份
    @param {Number}val 字典值
    @return {String} 字典描述
*/
var getRoomIdentity = function (val) {
    if (val == roomIdentity.HOST) {
        return '主持人'
    } else if (val == roomIdentity.HONOR) {
        return '嘉宾'
    } else if (val == roomIdentity.ADMIN) {
        return '管理员'
    }
    return '普通用户'
}
/**
    获取直播类型
    @param {Number}val 字典值
    @return {String} 字典描述
*/
var getLiveType = function (val) {
    if (val == liveType.AUDIO) {
        return '音频'
    } else if (val == liveType.VIDEO) {
        return '视频'
    } 
    return val
}

/**
    获取分娩次数
    @param {Number}val 字典值
    @return {String} 字典描述
*/
var getDeliverCount = function (val) {
    if (val == deliverCount.NOFILED) {
        return ''
    } else if (val == deliverCount.UNFERTILITY) {
        return '未生育'
    } else if (val == deliverCount.TIRE) {
        return '一胎'
    } else if (val == deliverCount.CHILDSECOND) {
        return '二胎'
    } else if (val == deliverCount.TRIPLET) {
        return '三胎及以上'
    }
    return val
}

/**
    获取分娩次数文案
    @param
    @return {String} 字典描述
*/
var getDeliverText = function () {
	return deliverText
}

/**
    获取流产次数
    @param {Number}val 字典值
    @return {String} 字典描述
*/
var getAbortionCount = function (val) {
    if (val == abortionCount.NOFILED) {
        return ''
    } else if (val == abortionCount.NONABORTION) {
        return '0次'
    } else if (val == abortionCount.ONCEABORTION) {
        return '1次'
    } else if (val == abortionCount.TWICEABORTION) {
        return '2次'
    } else if (val == abortionCount.MULTIPABORTION) {
        return '3次及以上'
    }
    return val
}

/**
    获取流产次数文案
    @param 
    @return {String} 字典描述
*/
var getAbortionText = function () {
	return abortionText
}

/**
    获取流产次数文案
    @param 
    @return {String} 字典描述
*/
var getSexText = function () {
	return sexText
}

/**
    获取实名认证
    @param {Number}val 字典值
    @return {String} 字典描述
*/
var getRealName = function (val) {
    if (val == realName.REALNAMENEVER) {
        return '未认证'
    } else if (val == realName.REALNAMEIN) {
        return '认证中'
    } else if (val == realName.REALNAMEHAS) {
        return '已认证'
    } else if (val == realName.REALNAMEFAIL) {
        return '认证失败'
    }
    return val
}
/**
    获取机构认证
    @param {Number}val 字典值
    @return {String} 字典描述
*/
var getAgency = function (val) {
    if (val == agency.AGENCYNEVER) {
        return '未认证'
    } else if (val == agency.AGENCYIN) {
        return '认证中'
    } else if (val == agency.AGENCYHAS) {
        return '已认证'
    } else if (val == agency.AGENCYFAIL) {
        return '认证失败'
    }
}
/**
    获取订单状态
    @param {Number}val 字典值
    @return {String} 字典描述
*/
var getOrderStatus = function (val) {
    if (val == orderStatus.UNPAY) {
        return '未支付'
    } else if (val == orderStatus.HASPAY) {
        return '购买成功'
    } else if (val == orderStatus.HASCANCEL) {
        return '已取消'
    } else if (val == orderStatus.APPLYREFUND) {
        return '申请退款'
    } else if (val == orderStatus.HASREFUND) {
        return '已退款'
    }
    return val
}
/**
    获取订单类型
    @param {Number}val 字典值
    @return {String} 字典描述
*/
var getOrderType = function (val) {
    if (val == orderType.VIRTUAL) {
        return '虚拟订单'
    } else if (val == orderType.ENTITY) {
        return '实物订单'
    }
    return val
}
/**
    获取支付方式
    @param {Number}val 字典值
    @return {String} 字典描述
*/
var getPayMethod = function (val) {
    if (val == payMethod.ALI) {
        return '支付宝'
    } else if (val == payMethod.WeChat) {
        return '微信'
    } else if (val == payMethod.UnionPay) {
        return '银联'
    } else if (val == payMethod.ApplePay) {
        return 'Apple Pay'
    } else if (val == payMethod.Free) {
        return '免费支付'
    } else if (val == payMethod.Wrightin) {
        return '澜渟币'
    } else if (val == payMethod.ALIWrightin) {
        return '澜渟币+支付宝'
    } else if (val == payMethod.WeChatWrightin) {
        return '澜渟币+微信'
    } else if (val == payMethod.ApplePayWrightin) {
        return '澜渟币+Apple Pay'
    }
    return val
}
/**
    获取商品类型
    @param {Number}val 字典值
    @return {String} 字典描述
*/
var getProductType = function (val) {
    if (val == productType.UNKNOWN) {
        return '未知'
    } else if (val == productType.EXAM) {
        return '考试'
    } else if (val == productType.COURSE) {
        return '课程'
    } else if (val == productType.COLUMN) {
        return '专栏'
    } else if (val == productType.MEETINGTICKET) {
        return '会议门票'
    } else if (val == productType.MEETINGNOTE) {
        return '会议讲义'
    } else if (val == productType.ASSESS) {
        return '评估'
    } else if (val == productType.COIN) {
        return '澜渟币'
    } else if (val == productType.PLAN) {
        return '方案'
    }
    return val
}
/**
    获取发票抬头类型
    @param {Number}val 字典值
    @return {String} 字典描述
*/
var getInvoiceHead = function (val) {
    if (val == invoiceHead.PERSON) {
        return '个人'
    } else if (val == invoiceHead.COMPANY) {
        return '单位'
    }
    return val
}
/**
    获取发票类型
    @param {Number}val 字典值
    @return {String} 字典描述
*/
var getInvoiceType = function (val) {
    if (val == invoiceType.COMMON) {
        return '普通发票'
    } else if (val == invoiceType.VAT) {
        return '增值税专用发票'
    }
    return val
}
/**
    获取发票状态
    @param {Number}val 字典值
    @return {String} 字典描述
*/
var getInvoiceStatus = function (val) {
    if (val == invoiceStatus.UNAPPLY) {
        return '待申请'
    } else if (val == invoiceStatus.CHECKING) {
        return '审核中'
    } else if (val == invoiceStatus.CHECKPASS) {
        return '审核通过'
    } else if (val == invoiceStatus.GRANTING) {
        return '开票中'
    } else if (val == invoiceStatus.HASGRANT) {
        return '已开票'
    } else if (val == invoiceStatus.OVERTIME) {
        return '已过期'
    }
    return val
}

module.exports = {
    resourceType: resourceType,
    liveStatus: liveStatus,
    liveMsgType: liveMsgType,
	customExtType: customExtType,
    roomStatus: roomStatus,
	pushStatus: pushStatus,
    roomIdentity: roomIdentity,
    liveType: liveType,
    deliverCount: deliverCount,
    abortionCount: abortionCount,
    realName: realName,
    agency: agency,
    orderStatus: orderStatus,
    orderType: orderType,
    payMethod: payMethod,
    productType: productType,
    invoiceHead: invoiceHead,
    invoiceType: invoiceType,
    invoiceStatus: invoiceStatus,
    getResourceType: getResourceType,
    getLiveStatus: getLiveStatus,
    getLiveStatus_2: getLiveStatus_2,
    getRoomStatus: getRoomStatus,
    getLiveType: getLiveType,
    getRoomIdentity: getRoomIdentity,
    getDeliverCount: getDeliverCount,
	getDeliverText: getDeliverText,
    getAbortionCount: getAbortionCount,
	getAbortionText: getAbortionText,
	getSexText: getSexText,
    getRealName: getRealName,
    getAgency: getAgency,
    getOrderStatus: getOrderStatus,
    getPayMethod: getPayMethod,
    getProductType: getProductType,
    getOrderType: getOrderType,
    getInvoiceHead: getInvoiceHead,
    getInvoiceType: getInvoiceType,
    getInvoiceStatus: getInvoiceStatus
}