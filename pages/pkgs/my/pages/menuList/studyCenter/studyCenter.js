var md_request = require('../../../../../../utils/request.js')
var md_app = getApp()

Page({
    data: {
        modeName: "studyHistory",
        tabShowFlag: 0, // 0 学习历史、1 已购课程
        historyArr: [], // 学习历史
        courseArr: [], // 已购课程
        isLoad: false, // 是否已加载完数据
        currHisPage: 1,
        isHisLast: false,
        currCosPage: 1,
        isCosLast: false,
    },

    /**
     * 页面加载方法
     * @param
     * @return
     */
    onLoad: function () {
        this.initData();
    },

    /**
     * 清空数据
     * @param
     * @return
     */
    clearData() {
        this.setData({
            isLoad: false, // 是否已加载完数据
            historyArr: [], // 学习历史
            courseArr: [], // 已购课程
            currHisPage: 1,
            isHisLast: false,
            currCosPage: 1,
            isCosLast: false,
        })
    },

    /**
     * 初始化数据
     * @param 
     * @return
     */
    initData: function () {
        this.clearData();
        this.selectComponent('#mdDialog').loading()
        if (this.data.tabShowFlag == 0) {
            this.getStudyHistory();
        } else if (this.data.tabShowFlag == 1) {
            this.getBoughtCourse();
        }
        
    },

    /**
        页面上拉触底-加载下一页
        @param
        @return
     */
    onReachBottom: function () {
        if (!this.data.isHisLast && (this.data.tabShowFlag == 0)) {
            this.setData({
                currHisPage: this.data.currHisPage + 1
            })
            this.getStudyHistory()
        }

        if (!this.data.isCosLast && (this.data.tabShowFlag == 1)) {
            this.setData({
                currCosPage: this.data.currCosPage + 1
            })
            this.getBoughtCourse()
        }
    },

    // /**
    //  * 获取用户学习历史
    //  * @param
    //  * @return
    //  */
    // getStudyHistory() {
    //     md_request.api({
    //         path: md_request.config.lesson + '/learn/records',
    //         data: {
    //             "token": md_app.globalData.token,
    //             "page": this.data.currHisPage
    //         },
    //         callback: (err, res) => {
    //             this.selectComponent('#mdDialog').close()
    //             var code = res.data.code;
    //             var note = res.data.note;
    //             var data = res.data.data;
    //             data.list = data.list.filter((item)=>{
    //                 if(item.source_type == '2'){
    //                     return item
    //                 }
    //             })
    //             if (code == '200') {
    //                 this.setData({
    //                     historyArr: this.data.historyArr.concat(data.list),
    //                     isLoad: true
    //                 })
    //                 if (data.is_last_page == '1') {
    //                     this.setData({
    //                         isHisLast: true
    //                     })
    //                 }
    //             }
    //         }
    //     })
    // },

    // /**
    //  * 获取用户已购课程
    //  * @param
    //  * @return
    //  */
    // getBoughtCourse() {
    //     md_request.api({
    //         path: md_request.config.lesson + '/order/records',
    //         data: {
    //             "token": md_app.globalData.token,
    //             "page": this.data.currCosPage
    //         },
    //         callback: (err, res) => {
    //             this.selectComponent('#mdDialog').close()
    //             var code = res.data.code;
    //             var note = res.data.note;
    //             var data = res.data.data;
    //             data.list = data.list.filter((item)=>{
    //                 if(item.type == '11'){
    //                     return item
    //                 }
    //             })
    //             if (code == '200') {
    //                 this.setData({
    //                     courseArr: this.data.courseArr.concat(data.list),
    //                     isLoad: true
    //                 })
    //                 if (data.is_last_page == '1') {
    //                     this.setData({
    //                         isCosLast: true
    //                     })
    //                 }
    //             }
                
    //         }
    //     })
    // },

        /**
     * 获取用户学习历史
     * @param
     * @return
     */
    getStudyHistory() {
        let historyArr = this.data.historyArr
        const getUserHistory = ()=>{
            md_request.api({
                path: md_request.config.lesson + '/learn/records',
                data: {
                    "token": md_app.globalData.token,
                    "page": this.data.currHisPage
                },
                callback: (err, res) => {
                    this.selectComponent('#mdDialog').close()
                    var code = res.data.code;
                    var note = res.data.note;
                    var data = res.data.data;
                    if (code == '200') {
                        data.list = data.list.filter((item)=>{
                            if(item.source_type == '2'){
                                return item
                            }
                        })
                        historyArr = historyArr.concat(data.list)
                        if (data.is_last_page == '1') {
                            this.setData({
                                historyArr, historyArr,
                                isHisLast: true,
                                isLoad: true
                            })
                        }else{
                            if(historyArr.length < 10){
                                this.setData({
                                    currHisPage: this.data.currHisPage + 1
                                })
                                getUserHistory()
                            }else{
                                this.setData({
                                    historyArr, historyArr,
                                    isLoad: true
                                })
                            }
                        } 
                    }
                }
            })
        }
        getUserHistory()
    },


        /**
     * 获取用户已购课程
     * @param
     * @return
     */
    getBoughtCourse() {
        let courseArr = this.data.courseArr
        const getUserRecord = ()=>{
            md_request.api({
                path: md_request.config.lesson + '/order/records',
                data: {
                    "token": md_app.globalData.token,
                    "page": this.data.currCosPage
                },
                callback: (err, res) => {
                    this.selectComponent('#mdDialog').close()
                    var code = res.data.code;
                    var note = res.data.note;
                    var data = res.data.data;
                    if (code == '200') {
                        data.list = data.list.filter((item)=>{
                            if(item.type == '11'){
                                return item
                            }
                        })
                        courseArr = courseArr.concat(data.list)
                        if (data.is_last_page == '1') {
                            this.setData({
                                courseArr, courseArr,
                                isCosLast: true,
                                isLoad: true
                            })
                        }else{
                            if(courseArr.length < 10){
                                this.setData({
                                    currCosPage: this.data.currCosPage + 1
                                })
                                getUserRecord()
                            }else{
                                this.setData({
                                    courseArr, courseArr,
                                    isLoad: true
                                })
                            }
                        } 
                    }
                    
                }
            })
        }
        getUserRecord()
    },

    /**
     * 选择训练模式
     * @param {dom} e 传参点击类型
     * @return
     */
    selectMode(e) {
        let modeName = e.currentTarget.dataset.ref;
        this.clearData();
        // 点击学习历史
        if (modeName == 'studyHistory') {
            this.setData({
                modeName: modeName,
                tabShowFlag: 0,
                isLoad: false
            })
            this.getStudyHistory();
        } else if (modeName == 'boughtCourse') { // 点击已购课程
            this.setData({
                modeName: modeName,
                tabShowFlag: 1,
                isLoad: false
            })
            this.getBoughtCourse();
        }
    },

    /**
     * 学习历史--跳转直播、课程、专栏详情页
     * @param {Dom} e 课程详情页所需参数（code, type）
     * @return
     */
    goHistoryDetail(e) {
        var code = e.currentTarget.dataset.code;
        var type = e.currentTarget.dataset.type; // 资源类型 0课程 1专栏 2直播
        if (type == 0) {
            wx.navigateTo({
                url: '../../../../college/pages/lesSpeDetail/detail?code=' + e.currentTarget.dataset.code + "&type=0" + 
            "&isSave=1"})
        } else if (type == 1) {
            wx.navigateTo({
                url: '../../../../college/pages/lesSpeDetail/detail?code=' + e.currentTarget.dataset.code + "&type=1" +
            "&isSave=1"
            })
        } else if (type == 2) {
            wx.navigateTo({
                url: '../../../../college/pages/liveDetail/liveDetail?code=' + e.currentTarget.dataset.code
            })
        }
    },

    /**
     * 已购课程--跳转直播、课程、专栏详情页
     * @param {Dom} e 课程详情页所需参数（code, type）
     * @return
     */
    goCourseDetail(e) {
        var code = e.currentTarget.dataset.code;
        var type = e.currentTarget.dataset.type; // 资源类型 0课程 1专栏 2直播
        if (type == 2) {
            wx.navigateTo({
                url: '../../../../college/pages/lesSpeDetail/detail?code=' + e.currentTarget.dataset.code + "&type=0"
            })
        } else if (type == 3) {
            wx.navigateTo({
                url: '../../../../college/pages/lesSpeDetail/detail?code=' + e.currentTarget.dataset.code + "&type=1"
            })
        } else if (type == 11) {
            wx.navigateTo({
                url: '../../../../college/pages/liveDetail/liveDetail?code=' + e.currentTarget.dataset.code
            })
        }
    }
})