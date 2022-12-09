/*
 * 文件描述：oss上传文件工具类
 * 创建人：赵志银
 * 创建时间：2019-07-15
 */
const Base64 = require('./base64.js');
const Crypto = require('./crypto.js');
const common = require('../../utils/common.js');

/**
 * 上传文件方法
 * @param {String} filePath 文件路径
 * @param {Object} aliOSSObj 阿里上传文件所需参数
 * @return {Object} Promise对象
 */
export function uploadFile(filePath, aliOSSObj) {
    return new Promise(function(resolve, reject) {
        if (!filePath) {
            reject({
                status: false,
                err: '文件错误',
            });
            return;
        }

        //文件后缀
        let dotIndex = filePath.lastIndexOf('.');
        let filePathLength = filePath.length;
        let suffix = filePath.substring(dotIndex, filePathLength);

        const aliyunFileKey = 'recovery_xcx/' + common.dateFormat(new Date(), 'YYYY/MM/DD') + '/' + (new Date().getTime()) + suffix;
        const aliyunServerURL = aliOSSObj.host;
        const accessid = aliOSSObj.accessKeyID;
        const policyBase64 = Base64.encode(JSON.stringify({
            "expiration": new Date(new Date().getTime() + aliOSSObj.timeout).toISOString(),
            "conditions": [
                ["content-length-range", 0, 1024 * 1024 * 10] //10m
            ]
        }));
        let bytes = Crypto.util.HMAC(Crypto.util.SHA1, policyBase64, aliOSSObj.accessKeySecret, {
            asBytes: true
        });
        const signature = Crypto.util.bytesToBase64(bytes);
        var formData = {
            'key': aliyunFileKey,
            'OSSAccessKeyId': aliOSSObj.accessKeyID,
            'policy': policyBase64,
            'Signature': signature,
            'success_action_status': '200',
        }

        wx.uploadFile({
            url: aliyunServerURL,
            filePath: filePath,
            name: 'file',
            formData: {
                'key': aliyunFileKey,
                'OSSAccessKeyId': aliOSSObj.accessKeyID,
                'policy': policyBase64,
                'Signature': signature,
                'success_action_status': '200',
                'x-oss-security-token': aliOSSObj.stsToken
            },
            success: function(res) {
                if (res.errMsg === 'uploadFile:ok') {
                    resolve({
                        status: true,
                        data: {
                            "url": aliyunServerURL + '/' + aliyunFileKey,
                            "urlCut": aliyunFileKey
                        },
                        err: '',
                    });
                }
            },
            fail: function(err) {
                reject({
                    status: false,
                    err,
                });
            },
        })
    });
}