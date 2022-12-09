var md_request = require('../../../../../../../utils/request.js');
var md_common = require('../../../../../../../utils/common.js')
var md_app = getApp();

Page({
    data: {
        searchText: '',
        searchResArr: [] // 搜索结果数组
    },

    /**
     * 监听查询医院名称输入
     * @param {dom} e 医院名称
     * @return
     */
    inputHos(e) {
        let hosName = e.detail.value
        if (!md_common.isEmpty(hosName)) {
            md_request.api({
                path: md_request.config.rih + '/DoctorInfo/SeacherHosName',
                data: {
                    "token": md_app.globalData.token,
                    "query": hosName
                },
                callback: (err, res) => {
                    var msg = res.data.msg;
                    var code = res.data.code;
                    var data = res.data.data;
                    if (code == '200') {
                        var searchResArr = data;
                        this.setData({
                            searchResArr: searchResArr
                        })
                    } else {
                        this.selectComponent('#mdDialog').tip(msg)
                    }
                }
            });
        }
    },

    /**
     * 点击搜寻结果赋值给输入框
     * @param {dom} e 点击搜寻结果参数
     * @return
     */
    clickResHos(e) {
        let res = e.currentTarget.dataset.res;
        this.setData({
            searchText: res
        })
    },

    /**
     * 提交结果
     * @param
     * @return
     */
    confirmRes() {
        // 获取页面栈
        var pages = getCurrentPages();    
        if (pages.length > 1) {
            var prePage = pages[pages.length - 2];   
            prePage.changHos(this.data.searchText);    
        }

        wx.navigateBack({
            delta: 1
        });
    }
})