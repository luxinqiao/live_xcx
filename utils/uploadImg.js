/**
 * 文件描述：图片上传组件
 * 创建人：赵志银
 * 创建时间：2019-08-15
 */

var md_request = require('./request.js')
var md_common = require('./common.js')
import { uploadFile } from '../third/ali-oss/alioss.js'

/**
 * 上传图片
 * @param {Number} num 最大上传图片数量
 * @param {Function} callback 成功后的回调函数
 * @return
 */
const upload = function(num, callback) {
    let _this = this
    wx.chooseImage({
        count: num,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: function(res) {
            saveImageToServer(res.tempFilePaths, function (res, urlCut) {
                callback(res, urlCut)
            })
        },
        fail: function(error) {

        }
    })
}

/**
 * 图片上传到oss服务器
 * @param {String} src 图片路径
 * @param {Function} callback 成功后的回调函数
 * @return
 */
const saveImageToServer = function(src, callback) {
    var srcCut = [];
    const that = this;
    for (let index in src) {
        md_request.api({
            path: md_request.config.sts,
            data: {},
            callback: (err, res) => {
                const response = res.data;
                if (response.status === 200) {
                    let image = src[index]
                    uploadFile(src[index], {
                        accessKeyID: response.AccessKeyId,
                        accessKeySecret: response.AccessKeySecret,
                        stsToken: response.SecurityToken,
                        host: md_request.config.oss,
                        timeout: 87600
                    }).then(function(res) {
                        let url = res.data.url;
                        let urlCut = res.data.urlCut;
                        if (res.status && res.data.url && urlCut) {
                            // 调用接口保存图片 
                            src[index] = url
                            srcCut[index] = urlCut
                            if (index == src.length - 1) {
                                callback(src, srcCut)
                            }
                        }
                    }, function(res) {

                    });
                } else {
                    wx.showToast({
                        title: '上传图片失败',
                        icon: 'none',
                        duration: 1000
                    })
                }
            }
        });
    }
}

module.exports = {
    uploadImg: upload
}