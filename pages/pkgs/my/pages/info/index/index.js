var md_request = require('../../../../../../utils/request.js')
var md_common = require('../../../../../../utils/common.js')
var md_upImg = require('../../../../../../utils/uploadImg.js')
var md_dict = require('../../../../../../utils/dict.js')
var md_app = getApp()

Page({
    data: {
        useInfoObj: {},
        imgUrl: '',
		sexArr: md_dict.getSexText(), // 性别
		childArr: md_dict.getDeliverText(), // 分娩次数
        childbirthDate: '',
        gp: '',
		childmisArr: md_dict.getAbortionText(), // 流产次数
        mischildDate: '',
        misnum: '',
        zoneObj: {
            selectText: '请选择',
            dataArr: [],
            indexArr: [0, 0, 0],
            provinceArr: [],
            cityArr: [],
            areaArr: []
        },
        nickName: '',
        isNickName: false,
        name: '',
        isName: false,
        height: '',
        isHeight: false,
        weight: '',
        isWeight: false,
        sign: '',
        isSign: false,
        remark: '',
        isRemark: false,
        currentChange: '' // 当前修改的input框
    },

    /**
     * 生命周期函数--监听页面加载
     * @param
     * @return
     */
    onLoad: function() {
        this.initData()
        this.initProvince()
    },

    /**
     * 生命周期函数--监听页面显示
     * @param
     * @return
     */
    onShow: function () {
        this.initData()
    },

    /**
     * 初始化数据
     * @param 
     * @return
     */
    initData: function() {
        md_request.api({
            path: md_request.config.rih + '/Login/getUserInfo',
            data: {
                "token": md_app.globalData.token
            },
            callback: (err, res) => {
                if (res.data.code == '200') {
                    let infoData = res.data.data.UserInfo
                    /**** 初始化出生日期****/
                    infoData.uiBirthDate = infoData.uiBirthDate.split(' ')[0]
                    /**** 初始化昵称 ****/
                    if (md_common.isEmpty(infoData.uiNickName) && !md_common.isEmpty(infoData.WeChatIDName)) {
                        this.setData({
                            name: infoData.WeChatIDName
                        })
                    } else {
                        this.setData({
                            name: infoData.uiNickName
                        })
                    }
                    /**** 初始化头像 ****/
                    if (md_common.isEmpty(infoData.uiHeadImageUrl) && !md_common.isEmpty(infoData.weChatHeadImageUrl)) {
                        this.setData({
                            imgUrl: infoData.weChatHeadImageUrl
                        })
                    } else {
                        if (md_common.isEmpty(infoData.uiHeadImageUrl)) {
                            this.setData({
                                imgUrl: "/images/home/my/default_header.png"
                            })
                        }else {
                            if (infoData.uiHeadImageUrl.indexOf('http') == -1) {
                                infoData.uiHeadImageUrl = md_request.config.oss + "/" + infoData.uiHeadImageUrl
                            }

                            this.setData({
                                imgUrl: infoData.uiHeadImageUrl
                            })
                        }
                    }
                    /**** 初始化分娩次数 ****/
                    this.setData({
                        childbirthDate: md_dict.getDeliverCount(infoData.gp),
                        gp: infoData.gp
                    })
                    /**** 初始化分娩时间 ****/
                    if ((infoData.gp !== md_dict.deliverCount.TIRE) && (infoData.gp !== md_dict.deliverCount.NOFILED)) {
                        infoData.delivery_date = infoData.delivery_date.split(' ')[0]
                    }
                    /**** 初始化流产次数 ****/
                    this.setData({
                        mischildDate: md_dict.getAbortionCount(infoData.abortion_num),
                        misnum: infoData.abortion_num
                    })
                    /**** 初始化流产时间 ****/
                    if ((infoData.abortion_num !== md_dict.abortionCount.NONABORTION) && (infoData.abortion_num !== md_dict.abortionCount.NOFILED)) {
                        infoData.abortion_date = infoData.abortion_date.split(' ')[0]
                    }
                    this.setData({
                        useInfoObj: infoData,
                        nickName: infoData.uiNickName,
                        height: infoData.uiHeight,
                        weight: infoData.uiWeight,
                    })
                }
            }
        });
    },

    /**
     * 初始化省
     * @param
     * @return
     */
    initProvince: function() {
        md_request.api({
            path: md_request.config.live + '/cn/province',
            data: { },
            callback: (err, res) => {
                if (res.data.code == 200) {
                    this.setData({
                        'zoneObj.provinceArr': res.data.data,
                        'zoneObj.dataArr[0]': this.convertNameArr(res.data.data)
                    })
                    if (res.data.data.length > 0) {
                        this.initCity(res.data.data[0].code)
                    }
                }
            }
        });
    },
    /**
     * 初始化市
     * @param {String} provinceCode 省编码
     * @return
     */
    initCity: function(provinceCode) {
        md_request.api({
            path: md_request.config.live + '/cn/city',
            data: {
                pcode: provinceCode
            },
            callback: (err, res) => {
                if (res.data.code == 200) {
                    this.setData({
                        'zoneObj.cityArr': res.data.data,
                        'zoneObj.dataArr[1]': this.convertNameArr(res.data.data),
                        'zoneObj.dataArr[2]': []
                    })
                    if (res.data.data.length > 0) {
                        this.initArea(res.data.data[0].code)
                    }
                }
            }
        });
    },
    /**
     * 初始化区
     * @param {String} cityCode 市编码
     * @return
     */
    initArea: function(cityCode) {
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
        });
    },
    /**
     * 抽离出名称数组
     * @param {Array} arr 全数据数组
     * @return {Array} 名称数组
     */
    convertNameArr: function(arr) {
        let nameArr = []
        for (let i = 0; i < arr.length; i++) {
            nameArr.push(arr[i].name)
        }
        return nameArr
    },

    /**
     * 省市区切换
     * @param {Dom} e 所在地区
     * @return
     */
    zoneChage: function(e) {
        const col = e.detail.column,
            row = e.detail.value
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
     * 省市区确定
     * @param {dom} e 省市区
     * @return
     */
    zoneConfirm: function(e) {
        const provinceObj = this.data.zoneObj.provinceArr[this.data.zoneObj.indexArr[0]]
        const cityObj = this.data.zoneObj.cityArr[this.data.zoneObj.indexArr[1]]
        const areaObj = this.data.zoneObj.areaArr[this.data.zoneObj.indexArr[2]]
        if (md_common.isEmpty(areaObj) && !md_common.isEmpty(cityObj)) {
            this.setData({
                'zone.selectText': cityObj.code
            })
        } else if (md_common.isEmpty(cityObj)) {
            this.setData({
                'zone.selectText': provinceObj.code
            })
        } else {
            this.setData({
                'zone.selectText': areaObj.code
            })
        }
        
        md_request.api({
            path: md_request.config.rih + '/UserInfo/userModifyArea',
            data: {
                "token": md_app.globalData.token,
                "where": this.data.zone.selectText
            },
            callback: (err, res) => {
                if (res.data.code == '200') {
                    this.initData()
                }
            }
        });
    },

    /**
     * 修改分娩次数
     * @param {dom} e 分娩次数
     * @return
     */
    changeChildCount: function(e) {
        this.setData({
            childbirthDate: md_dict.getDeliverCount(e.detail.value),
            gp: e.detail.value
        })
        
        md_request.api({
            path: md_request.config.rih + '/UserInfo/updateUserInfo',
            data: {
                "token": md_app.globalData.token,
                "gp": e.detail.value,
                "delivery_date": this.data.useInfoObj.abortion_date
            },
            callback: (err, res) => {
                if (res.data.code == '200') {
                    this.initData()
                }
            }
        });
    },

    /**
     * 修改分娩时间
     * @param {dom} e 分娩时间
     * @return
     */
    changeBirthTime: function(e) {
        md_request.api({
            path: md_request.config.rih + '/UserInfo/updateUserInfo',
            data: {
                "token": md_app.globalData.token,
                "gp": this.data.gp,
                "delivery_date": e.detail.value
            },
            callback: (err, res) => {
                if (res.data.code == '200') {
                    this.initData()
                }
            }
        });
    },

    /**
     * 修改流产次数
     * @param {dom} e 流产次数
     * @return
     */
    changeMisCount: function(e) {
        this.setData({
            mischildDate: md_dict.getAbortionCount(e.detail.value),
            misnum: Number(e.detail.value)
        })
        
        md_request.api({
            path: md_request.config.rih + '/UserInfo/updateUserInfo',
            data: {
                "token": md_app.globalData.token,
                "abortion_num": e.detail.value,
                "abortion_date": this.data.useInfoObj.abortion_date
            },
            callback: (err, res) => {
                if (res.data.code == '200') {
                    this.initData()
                }
            }
        });
        
    },

    /**
     * 修改流产时间
     * @param {dom} e 流产时间
     * @return
     */
    changeMisTime: function(e) {
        md_request.api({
            path: md_request.config.rih + '/UserInfo/updateUserInfo',
            data: {
                "token": md_app.globalData.token,
                "abortion_num": this.data.misnum,
                "abortion_date": e.detail.value
            },
            callback: (err, res) => {
                if (res.data.code == '200') {
                    this.initData()
                }
            }
        });
    },

    /**
     * 修改头像
     * @param 
     * @return
     */
    changeImg: function() {
        md_upImg.uploadImg(1, (res) => {
            this.setData({
                imgUrl: res[0]
            })

            md_request.api({
                path: md_request.config.rih + '/UserInfo/updateUserInfo',
                data: {
                    "token": md_app.globalData.token,
                    "uiHeadImageUrl": res[0]
                },
                callback: (err, res) => {
                    if (res.data.code == '200') {
                        this.initData()
                        md_common.getPrePage().initData()
                    }
                }
            });
        })
    },

    /**
     * 实时监控输入-昵称
     * @param {dom} e 昵称
     * @return
     */
    nickNameChange: function (e) {
        this.setData({
            currentChange: 'nickname',
            nickName: md_common.trimStr(e.detail.value)
        })

        if (md_common.isEmpty(this.data.nickName)) {
            this.setData({
                isNickName: false
            })
        } else {
            this.setData({
                isNickName: true
            })
        }
    },

    /**
     * 实时监控输入-姓名
     * @param {dom} e 姓名
     * @return
     */
    nameChange: function (e) {
        this.setData({
            currentChange: 'name',
            name: md_common.trimStr(e.detail.value)
        })

        if (md_common.isEmpty(this.data.name)) {
            this.setData({
                isName: false
            })
        } else {
            this.setData({
                isName: true
            })
        }
    },

    /**
     * 实时监控输入-身高
     * @param {dom} e 身高
     * @return
     */
    heightChange: function (e) {
        this.setData({
            currentChange: 'height',
            height: md_common.trimStr(e.detail.value)
        })

        if (md_common.isEmpty(this.data.height)) {
            this.setData({
                isHeight: false
            })
        } else {
            this.setData({
                isHeight: true
            })
        }
    },

    /**
     * 实时监控输入-体重
     * @param {dom} e 体重
     * @return
     */
    weightChange: function (e) {
        this.setData({
            currentChange: 'weight',
            weight: md_common.trimStr(e.detail.value)
        })

        if (md_common.isEmpty(this.data.weight)) {
            this.setData({
                isWeight: false
            })
        } else {
            this.setData({
                isWeight: true
            })
        }
    },

    /**
     * 页面卸载方法
     * @param
     * @return
     */
    onUnload() {
        var _this = this;
        wx.getSystemInfo({
            success(res) {
                // 安卓点击返回不会先执行失去焦点事件，要单独保存
                if (res.platform == "android") {
                    let type = _this.data.currentChange;
                    _this.updateInputInfo(type);
                }
            }
        })
    },

    /**
     * 修改个人信息
     * @param {dom} e data-的值
     * @return
     */
    complete: function (e) {
        let type = e.currentTarget.dataset.type;
        this.updateInputInfo(type);
    },

    /**
     * 修改input输入框信息
     * @param {String} 修改类型
     * @return
     */
    updateInputInfo(type) {
        let dataObj = {
            "token": md_app.globalData.token
        }
        let url = md_request.config.rih
        var flag = 'false';
        if (type == 'nickname') {
            if (md_common.isEmpty(this.data.nickName)) {
                this.selectComponent('#mdDialog').tip('昵称不能为空')
                return;
            } else {
                flag = this.data.isNickName;
                dataObj.uiNickName = this.data.nickName
                url += '/UserInfo/setUserNickName'
            }
        } else if (type == 'name') {
            if (md_common.isEmpty(this.data.name)) {
                this.selectComponent('#mdDialog').tip('姓名不能为空')
                return;
            } else {
                flag = this.data.isName;
                dataObj.uiRealName = this.data.name
                url += '/UserInfo/setUserRealName'
            }
        } else if (type == 'height') {
            if (md_common.isEmpty(this.data.height)) {
                this.selectComponent('#mdDialog').tip('身高不能为空')
                return;
            } else if (md_common.trimStr(this.data.height) > 225) {
                this.selectComponent('#mdDialog').tip("请输入正确的身高")
                return;
            } else {
                flag = this.data.isHeight;
                dataObj.uiHeight = this.data.height
                url += '/UserInfo/updateUserInfo'
            }
        } else if (type == 'weight') {
            if (md_common.isEmpty(this.data.weight)) {
                this.selectComponent('#mdDialog').tip('体重不能为空')
                return;
            } else if (md_common.trimStr(this.data.weight) > 225) {
                this.selectComponent('#mdDialog').tip("请输入正确的体重")
                return;
            } else {
                flag = this.data.isWeight;
                dataObj.uiWeight = this.data.weight
                url += '/UserInfo/updateUserInfo'
            }
        }
        
        if (flag) {
            var prePage = md_common.getPrePage()
            md_request.api({
                path: url,
                data: dataObj,
                callback: (err, res) => {
                    if (res.data.code == '200') {
                        prePage.onLoad()
                    } else {
                        this.selectComponent('#mdDialog').tip(res.data.msg)
                    }
                }
            });
        }
    },

    /**
     * 修改性别
     * @param {dom} e 性别
     * @return
     */
    changeSex: function (e) {
        let gender = Number(e.detail.value) + 1;
        md_request.api({
            path: md_request.config.rih + '/UserInfo/updateUserInfo',
            data: {
                "token": md_app.globalData.token,
                "uiGender": gender
            },
            callback: (err, res) => {
                if (res.data.code == '200') {
                    this.initData()
                }
            }
        });
    },

    /**
     * 修改出生日期
     * @param {dom} e 出生日期
     * @return
     */
    changeBirthDate: function (e) {
        md_request.api({
            path: md_request.config.rih + '/UserInfo/updateUserInfo',
            data: {
                "token": md_app.globalData.token,
                "uiBirthDate": e.detail.value
            },
            callback: (err, res) => {
                if (res.data.code == '200') {
                    this.initData()
                }
            }
        });
    },

    /**
     * 跳转-认证
     * @param
     * @return
     */
    goAuthentication() {
        wx.navigateTo({
            url: '../../authentication/authentication',
        })
    },

    /**
     * 修改个性签名
     * @param {dom} e 个性签名
     * @return
     */
    goSignature: function (e) {
        wx.navigateTo({
            url: '../change/change?sign=' + e.currentTarget.dataset.sign + '&type=sign',
        })
    },

    /**
     * 修改个人简介
     * @param {dom} e 个人简介
     * @return
     */
    goIntroduction: function (e) {
        wx.navigateTo({
            url: '../change/change?remark=' + e.currentTarget.dataset.remark + '&type=remark',
        })
    }
})