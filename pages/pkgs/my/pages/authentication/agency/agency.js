var md_request = require('../../../../../../utils/request.js')
var md_common = require('../../../../../../utils/common.js')
var md_upImg = require('../../../../../../utils/uploadImg.js')
var md_dict = require('../../../../../../utils/dict.js')
var md_app = getApp()

Page({
    data: {
        agency: '', // 机构认证信息
        isShowFail: false, // 是否显示失败说明
        uiRemark: '', // 失败说明
        selAgencyObj: { // 当前选择的机构类型
            name: '',
            val: ''
        },
        hospital: '',
        department: '',
        position: '',
        agencyName: '',
        duty: '',
        agencyImg: '/pages/pkgs/my/images/authentication/certificate.png', // 医师资格证或执业证（用于前端展示）
        agencyImgCut: '', // 不带oss前缀的地址（用于传给后台）
        btnText: '提交认证' // 提交按钮文字
    },

    /**
     * 生命周期函数--监听页面加载
     * @param {Object} options 链接参数
     * @return
     */
    onLoad: function (options) {
        this.initData(options);
    },

    /**
     * 初始化数据
     * @param {Object} options 链接参数
     * @return
     */
    initData(options) {
        this.setData({
            agency: options.agency
        })

        if (options.agency != md_dict.agency.AGENCYNEVER) {
            this.setData({
                btnText: '重新提交认证'
            })
            // 获取机构认证信息（不是“未认证则需要获取用户认证信息”）
            this.getAgencyInfo();
        }
    },

    /**
     * 获取机构认证信息
     * @param 
     * @return
     */
    getAgencyInfo() {
        md_request.api({
            path: md_request.config.rih + '/DoctorInfo/getAllTitleInfo',
            data: {
                "token": md_app.globalData.token
            },
            callback: (err, res) => {
                var msg = res.data.msg;
                var code = res.data.code;
                var data = res.data.data.agency;
                if (code == '200') {
                    if (!md_common.isEmpty(data.image)) {
                        if (data.image.search("https") == -1) {
                            this.setData({
                                'agencyImg': md_request.config.oss + "/" + data.image,
                                'agencyImgCut': data.image
                            })
                        }else {
                            var splitArr = data.image.split('com/');
                            this.setData({
                                'agencyImg': data.image,
                                'agencyImgCut': splitArr[1]
                            })
                        }
                    }

                    // 机构认证失败
                    if (data.status == md_dict.agency.AGENCYFAIL) {
                        if (!md_common.isEmpty(data.remark)) {
                            this.setData({
                                'isShowFail': true,
                                'uiRemark': data.remark,
                            })
                        }
                    }
                    if (data.req_type == '0') { // 医疗机构
                        this.setData({
                            selAgencyObj: {
                                name: '医疗机构',
                                val: '0'
                            },
                            'hospital': data.hos_name,
                            'department': data.dep_name,
                            'position': data.title_name
                        })
                    } else if (data.req_type == '1') { // 非医疗机构
                        this.setData({
                            selAgencyObj: {
                                name: '非医疗机构',
                                val: '1'
                            },
                            'agencyName': data.institution_name,
                            'duty': data.institutiontitle_name
                        })
                    }
                } else {
                    this.selectComponent('#mdDialog').tip(msg)
                }
            }
        });
    },

    /**
     * 上传图片
     * @param 
     * @return
     */
    uploadFront: function () {
        let _this = this
        md_upImg.uploadImg(1, function (res, urlCut) {
            _this.setData({
                'agencyImg': res[0],
                "agencyImgCut": urlCut[0]
            })
        })
    },

    /**
     * 监听姓名输入
     * @param {dom} e 姓名输入
     * @return
     */
    inputName: function (e) {
        this.setData({
            name: md_common.trimStr(e.detail.value)
        })
    },

    /**
     * 监听身份证号输入
     * @param {dom} e 身份证号输入
     * @return
     */
    inputCard: function (e) {
        this.setData({
            card: md_common.trimStr(e.detail.value)
        })
    },

    /**
     * 监听机构名称输入
     * @param {dom} e 机构名称
     * @return
     */
    inputAgencyName(e) {
        this.setData({
            agencyName: md_common.trimStr(e.detail.value)
        })
    },

    /**
     * 监听职务输入
     * @param {dom} e 职务
     * @return
     */
    inputDuty(e) {
        this.setData({
            duty: md_common.trimStr(e.detail.value)
        })
    },

    /**
     * 提交
     * @param 
     * @return
     */
    submit: function () {
        if (md_common.isEmpty(this.data.selAgencyObj.val)) {
            this.selectComponent('#mdDialog').tip('请选择机构')
        } else if (this.data.selAgencyObj.val == '0') { // 医疗机构
            if (md_common.isEmpty(this.data.hospital)) {
                this.selectComponent('#mdDialog').tip('请选择医院')
            } else if (md_common.isEmpty(this.data.department)) {
                this.selectComponent('#mdDialog').tip('请选择科室')
            } else if (md_common.isEmpty(this.data.position)) {
                this.selectComponent('#mdDialog').tip('请选职称')
            } else if (this.data.agencyImg == '/pages/pkgs/my/images/authentication/certificate.png') {
                this.selectComponent('#mdDialog').tip('请上传医师资格证或执业证')
            } else {
                md_request.api({
                    path: md_request.config.rih + '/DoctorInfo/submitTitleReqInfo',
                    data: {
                        "token": md_app.globalData.token,
                        "req_type": this.data.selAgencyObj.val,
                        "hos_name": this.data.hospital,
                        "dep_name": this.data.department,
                        "title_name": this.data.position,
                        "institution_name": '',
                        "institutiontitle_name": '',
                        "image": this.data.agencyImgCut
                    },
                    callback: (err, res) => {
                        var msg = res.data.msg;
                        var code = res.data.code;
                        if (code == '200') {
                            this.selectComponent('#mdDialog').alert('认证申请提交成功，我们将在5个工作日内进行认证，请关注认证结果。', '确定', () => {
                                this.selectComponent('#mdDialog').close()
                                wx.navigateBack({
                                    delta: 1
                                })
                            })
                        } else {
                            this.selectComponent('#mdDialog').tip(msg)
                        }
                    }
                });
            }
        } else if (this.data.selAgencyObj.val == '1') { // 非医疗机构
            if (md_common.isEmpty(this.data.agencyName)) {
                this.selectComponent('#mdDialog').tip('请填写机构名称')
            } else if (md_common.isEmpty(this.data.duty)) {
                this.selectComponent('#mdDialog').tip('请填写职务')
            } else if (this.data.agencyImg == '/pages/pkgs/my/images/authentication/certificate.png') {
                this.selectComponent('#mdDialog').tip('请上传医师资格证或执业证')
            } else {
                md_request.api({
                    path: md_request.config.rih + '/DoctorInfo/submitTitleReqInfo',
                    data: {
                        "token": md_app.globalData.token,
                        "req_type": this.data.selAgencyObj.val,
                        "hos_name": '',
                        "dep_name": '',
                        "title_name": '',
                        "institution_name": this.data.agencyName,
                        "institutiontitle_name": this.data.duty,
                        "image": this.data.agencyImgCut
                    },
                    callback: (err, res) => {
                        var msg = res.data.msg;
                        var code = res.data.code;
                        if (code == '200') {
                            this.selectComponent('#mdDialog').alert('认证申请提交成功，我们将在5个工作日内进行认证，请关注认证结果。', '确定', () => {
                                this.selectComponent('#mdDialog').close()
                                wx.navigateBack({
                                    delta: 1
                                })
                            })
                        } else {
                            this.selectComponent('#mdDialog').tip(msg)
                        }
                    }
                });
            }
        }
    },

    /**
     * 点击显示底部选择机构弹出层
     * @param 
     * @return
     */
    showPopup() {
        this.selectComponent('.selAgencyType').showPopup();
    },

    /**
     * 选择“医疗机构”
     * @param 
     * @return
     */
    selMedical() {
        this.setData({
            selAgencyObj: {
                name: '医疗机构',
                val: '0'
            }
        });
        this.selectComponent('.selAgencyType').hidePopup();
    },

    /**
     * 选择“非医疗机构”
     * @param 
     * @return
     */
    selnoMedical() {
        this.setData({
            selAgencyObj: {
                name: '非医疗机构',
                val: '1'
            }
        });
        this.selectComponent('.selAgencyType').hidePopup();
    },

    /**
     * 取消选择
     * @param 
     * @return
     */
    selCancel() {
        this.selectComponent('.selAgencyType').hidePopup();
    },

    /**
     * 改变医院输入框内容
     * @param {String} name 医院名称
     * @return
     */
    changHos(name) {
        this.setData({
            hospital: name
        })
    },

    /**
     * 改变科室输入框内容
     * @param {String} name 科室名称
     * @return
     */
    changDep(name) {
        this.setData({
            department: name
        })
    },

    /**
     * 改变职称输入框内容
     * @param {String} name 职称名称
     * @return
     */
    changPos(name) {
        this.setData({
            position: name
        })
    },

    /**
     * 跳转-搜索医院
     * @param 
     * @return
     */
    goSearchHos() {
        wx.navigateTo({
            url: './searchHos/searchHos'
        })
    },

    /**
     * 跳转-搜索科室
     * @param 
     * @return
     */
    goSearchDep() {
        if (md_common.isEmpty(this.data.hospital)) {
            this.selectComponent('#mdDialog').tip('请先选择医院')
        }else {
            wx.navigateTo({
                url: './searchDep/searchDep?hospital=' + this.data.hospital
            })
        }
    },

    /**
     * 跳转-搜索职称
     * @param 
     * @return
     */
    goSearchPos() {
        wx.navigateTo({
            url: './searchPos/searchPos'
        })
    }
})