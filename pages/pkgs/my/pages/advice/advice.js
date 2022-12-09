var md_request = require('../../../../../utils/request.js')
var md_common = require('../../../../../utils/common.js')
var md_upImg = require('../../../../../utils/uploadImg.js')
var md_app = getApp()

Page({
    data: {
        titleData: '',
        contentData: '',
        uploadObj: {
            max: 3,
            picsArr: [], // 带oss前缀的地址（用于前端展示）
            picsCutArr: [] // 不带oss前缀的地址（用于传给后台）
        }
    },

    /**
     * 监听标题输入
     * @param {dom} e 标题输入
     * @return
     */
    title: function(e) {
        this.setData({
            titleData: md_common.trimStr(e.detail.value)
        })
    },

    /**
     * 监听内容输入
     * @param {dom} e 内容输入
     * @return
     */
    content: function(e) {
        this.setData({
            contentData: md_common.trimStr(e.detail.value)
        })
    },

    /**
     * 上传图片
     * @param 
     * @return
     */
    upload: function() {
        let _this = this
        md_upImg.uploadImg(3, function(res, urlCut) {
            for (let index in urlCut) {
                if (_this.data.uploadObj.picsArr.length < 3) {
                    let picsArr = _this.data.uploadObj.picsArr
                    let picsCutArr = _this.data.uploadObj.picsCutArr
                    picsArr.push(res[index])
                    picsCutArr.push(urlCut[index])
                    _this.setData({
                        'uploadObj.picsArr': picsArr,
                        'uploadObj.picsCutArr': picsCutArr
                    })
                }
            }

            let num = 3 - _this.data.uploadObj.picsArr.length
            _this.setData({
                'uploadObj.max': num
            })
        })
    },

    /**
     * 删除图片
     * @param {dom} e 删除图片
     * @return
     */
    cancle: function(e) {
        let index = e.currentTarget.dataset.index
        let picsArr = this.data.uploadObj.picsArr
        picsArr.splice(index, 1)
        let num = this.data.uploadObj.max + 1
        this.setData({
            'uploadObj.picsArr': picsArr,
            'uploadObj.max': num
        })
    },

    /**
     * 提交
     * @param 
     * @return
     */
    submit: function() {
        if (md_common.isEmpty(this.data.titleData)) {
            this.selectComponent('#mdDialog').tip('请填写反馈标题')
        } else if (md_common.isEmpty(this.data.contentData)) {
            this.selectComponent('#mdDialog').tip('请填写反馈内容')
        } else {
            try {
                md_app.globalData.uuid = wx.getStorageSync('uuid')
            } catch (e) { }
            md_request.api({
                path: md_request.config.rih + '/UserFeedBack/addAUserFeedBack',
                data: {
                    "ufbUIUID": md_app.globalData.uuid,
                    "ufbTitle": this.data.titleData,
                    "ufbDesc": this.data.contentData,
                    "ufbImages": JSON.stringify(this.data.uploadObj.picsCutArr)
                },
                callback: (err, res) => {
                    var msg = res.data.msg
                    var code = res.data.code
                    if (code == '200') {
                        this.selectComponent('#mdDialog').tip(msg, () => {
                            wx.navigateBack({
                                delta: 1
                            })
                        }, 2000)
                    } else {
                        this.selectComponent('#mdDialog').tip(msg)
                    }
                }
            })
        }
    }
})