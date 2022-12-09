const md_request = require('../../../../../utils/request.js')
const md_common = require('../../../../../utils/common.js')
const md_reg = require('../../../../../utils/reg.js')
const md_app = getApp()

Page({
    data: {
        code: '',
        name: '',
        phone: '',
        addr: '',
        zoneObj: {
            selectText: '请选择省市区',
            dataArr: [],
            indexArr: [0, 0, 0],
            provinceArr: [],
            cityArr: [],
            areaArr: []
        }
    },

    /**
        生命周期函数--监听页面加载
        @param {Object} options 链接参数
        @return
     */
    onLoad: function (options) {
        this.setData({
            code: options.code,
            name: options.name,
            phone: options.call,
            addr: options.addr,
            isDefault: options.is_default=="1",
            'zoneObj.selectText': options.zone
        })
        this.initProvince()
    },

    /**
        初始化省
        @param
        @return
     */
    initProvince: function () {
        md_request.api({
            path: md_request.config.live + '/cn/province',
            data: {},
            callback: (err, res) => {
                if (res.data.code == 200) {
                    this.setData({
                        'zoneObj.provinceArr': res.data.data,
                        'zoneObj.cityArr': [],
                        'zoneObj.areaArr': [],
                        'zoneObj.dataArr[0]': this.convertNameArr(res.data.data),
                        'zoneObj.dataArr[1]': [],
                        'zoneObj.dataArr[2]': []
                    })
                    if (res.data.data.length > 0) {
                        this.initCity(res.data.data[0].code)
                    }
                }
            }
        })
    },
    /**
        初始化市
        @param {String} provinceCode 省编码
        @return
     */
    initCity: function (provinceCode) {
        md_request.api({
            path: md_request.config.live + '/cn/city',
            data: {
                pcode: provinceCode
            },
            callback: (err, res) => {
                if (res.data.code == 200) {
                    this.setData({
                        'zoneObj.cityArr': res.data.data,
                        'zoneObj.areaArr': [],
                        'zoneObj.dataArr[1]': this.convertNameArr(res.data.data),
                        'zoneObj.dataArr[2]': []
                    })
                    if (res.data.data.length > 0) {
                        this.initArea(res.data.data[0].code)
                    }
                }
            }
        })
    },

    /**
        初始化区
        @param {String} cityCode 市编码
        @return
     */
    initArea: function (cityCode) {
        md_request.api({
            path: md_request.config.live + '/cn/area',
            data: {
                pcode: cityCode
            },
            callback: (err, res) => {
                if (res.data.code == 200) {
                    this.setData({
                        'zoneObj.areaArr': res.data.data,
                        'zoneObj.dataArr[2]': this.convertNameArr(res.data.data)
                    })
                }
            }
        })
    },
    /**
        抽离出名称数组
        @param {Array} arr 全数据数组
        @return {Array} 名称数组
     */
    convertNameArr: function (arr) {
        let nameArr = []
        for (let i = 0; i < arr.length; i++) {
            nameArr.push(arr[i].name)
        }
        return nameArr
    },

    /**
        省市区切换
        @param {Dom} e 所在地区
        @return
     */
    zoneChange: function (e) {
        const col = e.detail.column, row = e.detail.value
        if (col == 0) {
            this.setData({
                'zoneObj.indexArr[0]': row,
                'zoneObj.indexArr[1]': 0,
                'zoneObj.indexArr[2]': 0
            })
            this.initCity(this.data.zoneObj.provinceArr[row].code)
        } else if (col == 1) {
            this.setData({
                'zoneObj.indexArr[1]': row,
                'zoneObj.indexArr[2]': 0
            })
            this.initArea(this.data.zoneObj.cityArr[row].code)
        } else if (col == 2) {
            this.setData({
                'zoneObj.indexArr[2]': row
            })
        }
    },
    /**
        省市区确定
        @param {Dom} e 所在地区
        @return
     */
    zoneConfirm: function (e) {
        let zone = ''
        const provinceObj = this.data.zoneObj.provinceArr[this.data.zoneObj.indexArr[0]]
        if (!md_common.isEmpty(provinceObj)) {
            zone += provinceObj.name
        }
        const cityObj = this.data.zoneObj.cityArr[this.data.zoneObj.indexArr[1]]
        if (!md_common.isEmpty(cityObj)) {
            zone += cityObj.name
        }
        const areaObj = this.data.zoneObj.areaArr[this.data.zoneObj.indexArr[2]]
        if (!md_common.isEmpty(areaObj)) {
            zone += areaObj.name
        }
        this.setData({
            'zoneObj.selectText': zone
        })
    },

    /**
        输入姓名
        @param {Dom} e 姓名
        @return
     */
    inputName: function (e) {
        this.setData({
            name: e.detail.value
        })
    },
    /**
        输入手机号
        @param {Dom} e 手机号
        @return
     */
    inputPhone: function (e) {
        this.setData({
            phone: e.detail.value
        })
    },
    /**
        输入详细地址
        @param {Dom} e 详细地址
        @return
     */
    inputAddr: function (e) {
        this.setData({
            addr: e.detail.value
        })
    },

    /**
        设置默认
        @param
        @return
     */
    setDefault: function () {
        this.setData({
            isDefault: !this.data.isDefault
        })
    },

    /**
        删除地址
        @param
        @return
     */
    deleteAddress: function () {
        this.selectComponent('#mdDialog').confirm('确定删除该地址吗？', '确定', () => {
            md_request.api({
                path: md_request.config.common + '/address/delete',
                data: {
                    token: md_app.globalData.token,
                    code: this.data.code
                },
                callback: (err, res) => {
                    if (res.data.code == 200) {
                        this.goBack('删除成功')
                    }
                }
            })
        }, '取消', () => {
            
        })
    },

    /**
        修改
        @param
        @return
     */
    edit: function () {
        if (!this.valid()) {
            return
        }
        md_request.api({
            path: md_request.config.common + '/address/modify',
            data: {
                token: md_app.globalData.token,
                code: this.data.code,
                contact_name: this.data.name,
                contact_call: this.data.phone,
                zone: this.data.zoneObj.selectText,
                content: this.data.addr
            },
            callback: (err, res) => {
                if (res.data.code == 200) {
                    this.goBack('修改成功')
                }
            }
        })
    },

    /**
        数据校验
        @param
        @return
     */
    valid: function () {
        if (md_common.isEmpty(this.data.name)) {
            this.selectComponent('#mdDialog').tip('请填写收货人姓名')
            return false
        }
        if (md_common.isEmpty(this.data.phone)) {
            this.selectComponent('#mdDialog').tip('请填写手机号码')
            return false
        }
        if (!md_reg.validPhone(this.data.phone)) {
            this.selectComponent('#mdDialog').tip('请填写正确的手机号码')
            return false
        }
        if (md_common.trimStr(this.data.zoneObj.selectText) === '请选择省市区') {
            this.selectComponent('#mdDialog').tip('请选择省市区')
            return false
        }
        if (md_common.isEmpty(this.data.addr)) {
            this.selectComponent('#mdDialog').tip('请填写详细地址')
            return false
        }
        return true
    },

    /**
        返回上一页
        @param {String} content 返回前提示
        @return
     */
    goBack: function (content) {
        this.selectComponent('#mdDialog').tip(content, () => {
            md_common.getPrePage().initData()
            wx.navigateBack({
                delta: 1
            })
        }, 2000)
    }
})