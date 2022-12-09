var md_request = require('../../../../../../../utils/request.js');
var md_common = require('../../../../../../../utils/common.js')
var md_app = getApp();

Page({
    data: {
        hospital: '',
        searchText: '',
        searchResArr: [] // 搜索结果数组
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
            hospital: options.hospital
        })

        this.getDeplist();
    },

    /**
     * 获取科室信息
     * @param
     * @return
     */
    getDeplist() {
        md_request.api({
            path: md_request.config.rih + '/DoctorInfo/GetHosDepsByHosName',
            data: {
                "token": md_app.globalData.token,
                "hos_name": this.data.hospital
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
    },

    /**
     * 监听查询科室名称输入
     * @param {dom} e 科室名称
     * @return
     */
    inputDep(e) {
        let depName = e.detail.value
        if (!md_common.isEmpty(depName)) {
            this.getDeplist();
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
            prePage.changDep(this.data.searchText);
        }

        wx.navigateBack({
            delta: 1
        });
    }
})