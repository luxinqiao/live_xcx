Component({
    data: {
        isShow: false,
        type: '',
        content: '',
        tipObj: {
            content: '',
            callbackFn: () => {}
        },
        waitingObj: {
            content: ''
        },
        alertObj: {
            content: '',
            btnText: '',
            callbackFn: () => {}
        },
        alertCountObj: {
            content: '',
            btnText: '',
            callbackFn: () => {},
            count: 0,
            intervalFun: () => {}
        },
        confirmObj: {
            content: '',
            leftText: '',
            leftCallbackFn: () => {},
            rightText: '',
            rightCallbackFn: () => {}
        },
        optionsObj: {
            multipleSlots: true
        }
    },

    methods: {
        /**
         * 加载弹框
         * @param 
         * @return
         */
        loading: function () {
            this.setData({
                isShow: true,
                type: 'loading'
            })
        },

        /**
         * 提示框
         * @param {string} content 内容
         * @param {function} callback 回调函数
         * @param {string}} time 时长
         * @return
         */
        tip: function (content, callback, time) {
            if (time == undefined) {
                time = 2000
            }
            this.setData({
                isShow: true,
                type: 'tip',
                tipObj: {
                    content: content,
                    callbackFn: callback
                }
            })
            setTimeout(() => {
                if (callback != undefined) {
                    callback()
                }
                this.close()
            }, time)
        },

        /**
         * 等待框
         * @param {string} content 内容
         * @return
         */
        waiting: function (content) {
            this.setData({
                isShow: true,
                type: 'waiting',
                waitingObj: {
                    content: content
                }
            })
        },

        /**
         * 警告框
         * @param {string} content 内容
         * @param {string}} btnText 按钮文本
         * @param {function} callback 回调函数
         * @return
         */
        alert: function (content, btnText, callback) {
            if (callback == undefined) {
                callback = () => { }
            }
            if (btnText == undefined || btnText == '') {
                btnText = '确定'
            }
            this.setData({
                isShow: true,
                type: 'alert',
                alertObj: {
                    content: content,
                    btnText: btnText,
                    callbackFn: callback
                }
            })
        },

        /**
         * 警告框（倒计时）
         * @param {string} content 内容
         * @param {string}} btnText 按钮文本
         * @param {function} callback 回调函数
         * @param {number} count 倒计时(秒)
         * @return
         */
        alertCount: function (content, btnText, callback, count) {
            if (callback == undefined) {
                callback = () => { }
            }
            if (btnText == undefined || btnText == '') {
                btnText = '确定'
            }
            this.setData({
                isShow: true,
                type: 'alertCount',
                alertCountObj: {
                    content: content,
                    btnText: btnText,
                    callbackFn: callback,
                    count: count
                }
            })
            let intervalFun = setInterval(() => {
                this.setData({
                    'alertCountObj.count': this.data.alertCountObj.count - 1
                })
                if (this.data.isShow && this.data.alertCountObj.count == 0) {
                    clearInterval(intervalFun)
                    callback()
                    this.close()
                }
            }, 1000)
        },

        /**
         * 确认框
         * @param {string} content 内容
         * @param {string}} leftText 左按钮文本
         * @param {function} leftCallback 左按钮回调函数
         * @param {string}} rightText 右按钮文本
         * @param {function} rightCallback 右按钮回调函数
         * @return
         */
        confirm: function (content, leftText, leftCallback, rightText, rightCallback) {
            if (leftCallback == undefined) {
                leftCallback = () => { }
            }
            if (rightCallback == undefined) {
                rightCallback = () => { }
            }
            this.setData({
                isShow: true,
                type: 'confirm',
                confirmObj: {
                    content: content,
                    leftText: leftText,
                    leftCallbackFn: leftCallback,
                    rightText: rightText,
                    rightCallbackFn: rightCallback
                }
            })
        },

        /**
         * input可输入确认框
         * @param {string} content 内容
         * @param {string}} leftText 左按钮文本
         * @param {function} leftCallback 左按钮回调函数
         * @param {string}} rightText 右按钮文本
         * @param {function} rightCallback 右按钮回调函数
         * @return
         */
        inputBox: function (content, leftText, leftCallback, rightText, rightCallback) {
            if (leftCallback == undefined) {
                leftCallback = () => { }
            }
            if (rightCallback == undefined) {
                rightCallback = () => { }
            }
            this.setData({
                isShow: true,
                type: 'inputBox',
                confirmObj: {
                    content: content,
                    leftText: leftText,
                    leftCallbackFn: leftCallback,
                    rightText: rightText,
                    rightCallbackFn: rightCallback
                }
            })
        },

        /**
         * 内容框
         * @param
         * @return
         */
        content: function () {
            this.setData({
                isShow: true,
                type: 'content',
            })
        },
        /**
         * 自定义弹框
         * @param
         * @return
         */
        customize(){
            this.setData({
                isShow: true,
                type: 'customize',
            })
        },
        /**
         * 自定义弹框
         * @param {string}} time 时长
         * @return
         */
        customize_nobg(time){
            this.setData({
                isShow: true,
                type: 'customize_nobg',
            })
            if(time > 0){
                setTimeout(() => {
                    this.close()
                }, time)
            }
        },

        /**
         * 警告框-点击按钮
         * @param
         * @return
         */
        tapAlert: function () {
            if (typeof (this.data.alertObj.callbackFn) == 'function') {
                this.data.alertObj.callbackFn()
            }
            this.close()
        },

        /**
         * 警告框(倒计时)-点击按钮
         * @param
         * @return
         */
        tapAlertCount: function () {
            clearInterval(this.data.alertCountObj.intervalFun)
            if (typeof (this.data.alertCountObj.callbackFn) == 'function') {
                this.data.alertCountObj.callbackFn()
            }
            this.close()
        },

        /**
         * 确认框-点击左侧按钮
         * @param 
         * @return
         */
        tapConfirmLeft: function () {
            if (typeof (this.data.confirmObj.leftCallbackFn) == 'function') {
                this.data.confirmObj.leftCallbackFn()
            }
            this.close()
        },

        /**
         * 确认框-点击右侧按钮
         * @param 
         * @return
         */
        tapConfirmRight: function () {
            if (typeof (this.data.confirmObj.rightCallbackFn) == 'function') {
                this.data.confirmObj.rightCallbackFn()
            }
            this.close()
        },

        /**
         * 关闭弹出框
         * @param 
         * @return
         */
        close: function () {
            this.setData({
                isShow: false
            })
        }
    }
})