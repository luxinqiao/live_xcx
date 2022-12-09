var md_request = require('../../../../../../utils/request.js')

Page({
    data: {
        userDateObj: {}
    },

    /**
     * 生命周期函数--监听页面加载
     * @param
     * @return
     */
    onLoad: function() {
        md_request.api({
            name: 'rih',
            path: md_request.config.rih + '/Agreement/LantingUser',
            data: {},
            callback: (err, res) => {
                if (res.data.code == '200') {
                    this.setData({
                        userDateObj: res.data.data
                    })
                }
            }
        });
    }
})