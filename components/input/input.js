const md_storage = require('../../utils/storage.js')
const md_emoji = require('../../utils/emoji.js')
const md_app = getApp()

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        placeholderText: {  //提示语
            type: String,
            value: ''
        },
        btnText: {   //按钮
            type: String,
            value: ''
        },
        inputType: { //输入框类型：input，textarea，reward
            type: String,
            value: ''
        },
        isEmoji: {    //是否有表情
            type: Boolean,
            value: true
        },
        imgSrc: {    //送礼图标
            type: String,
            value: ''
        },
        rewardImgStyle: {    //送礼图标样式
            type: String,
            value: ''
        },
        isDisabled: {    //是否禁用
            type: Boolean,
            value: false
        },
        length: {    //字数
            type: Number,
            value: 100
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        animation: '',
        message: '',
        isShow: false,//控制emoji表情是否显示
        isLoad: true,//解决初试加载时emoji动画执行一次
        emojiArr: md_emoji.emojiArr,
        isFoucs: false, //是否聚焦
        isIphoneX: md_app.globalData.isIphoneX
    },

    /**
     * 组件的方法列表
     */
    methods: {
        /**
        * 初始化
        * @param
        */
        onLoad: function () {
            if(!this.data.isLoad) {
                this.setData({
                    isLoad: true
                })
            }
            if(this.data.isShow) {
                this.setData({
                    isShow: false
                })
            }
            if(this.data.isFoucs) {
                this.setData({
                    isFoucs: false
                })
                this.runAnimation(0,0)   
            }
        },
        /**
        * 点击表情显示隐藏表情盒子
        * @param
        */
        getEmoji: function () {
            this.setData({
                isShow: !this.data.isShow,
                isLoad: false
            })
        },
        
        /**
        * 表情选择
         * @param {dom} e 选中的表情
         * @return
        */
        emojiChoose: function (e) {
            //当前输入内容和表情合并
            this.setData({
                message: this.data.message + e.currentTarget.dataset.emoji 
            })
        },
        
        /**
        * 点击emoji背景遮罩隐藏emoji盒子
        * @param
        * @return
        */
        closeEmoji: function () {
            if(this.data.isShow) {
                this.setData({
                    isShow: false
                })
            }
            if(this.data.isFoucs) {
                this.setData({
                    isFoucs: false
                })
            }
        },

        /**
         * 实时监测输入框
         * @param {dom} e 输入框
         * @return
         */
        getContent: function(e) {
            this.setData({
                message: e.detail.value
            })
        },

        /**
         * 输入框获取焦点时触发
         * @param {dom} e 事件参数
         * @return
         */
        textFocus(e) {
            this.setData({
                isShow: false,
                isFoucs: true
            })
            let kbHeight = md_storage.systemInfo.getKbHeight()
            if (kbHeight != (e.detail.height-1)){
                md_storage.systemInfo.setKbHeight(e.detail.height-1)
                this.runAnimation(e.detail.height-1,0)
            }else{
                this.runAnimation(kbHeight, 50)
            }
        },

        /**
         * 输入框失去焦点时触发
         * @param {dom} e 事件参数
         * @return
         */
        textBlur(e) {
            this.setData({
                isFoucs: false
            })
            this.runAnimation(0,0)   
        },

        /**
         * 输入框显示触发的动画
         * @param {Numeer} value bottom的值
         * @param {Number} time 动画时间
         * @return
         */
        runAnimation(value,time){
            let animation = wx.createAnimation({
                duration: time,
                timingFunction: "ease-in-out",
                delay: 0
            })
            animation.bottom(value).step()
            this.setData({
                animation: animation.export()
            })
        },

        /**
         * 发送
         * @param 
         * @return
         */
        sendMessage() {
            this.setData({
                isShow: false
            })
            this.triggerEvent('send',this.data.message)
            this.setData({
                message: ''
            })
        },

        /**
         * 打赏
         * @param 
         * @return
         */
        giveGift() {
            this.triggerEvent('giveGift')
        }
    }
})
