Component({
    options: {
        multipleSlots: true
    },
    /**
     * 组件的属性列表
     */
    properties: {
        poster: {  //海报
            type: String,
            value: ''
        },
        videoSrc: { 
            type: String,
            value: ''
        },
        currentIndex: { 
            type: Number,
            value: ''
        },
        defineArr: { //所能切换的清晰度
            type: Array,
            value: [
                {
                    name: { 
                        type: String,
                        value: ''
                    },
                    sort: {  //清晰度排序 0：为最低
                        type: Number, 
                        value: 0
                    },
                }
            ]
        },
        isHasShare: {
            type: Boolean,
            value: true
        },
        isShowBg: {  //蒙层
            type: Boolean,
            value: false
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        definitionObj: { //选中的清晰度
            ischoose: false
        },
        isShow: false,
        liveStatusObj: {
            isWait: false, //是否出现缓冲
            isSwitch: true,   //是否正在切换清晰度
            isFull: false, //是否全屏
            isProgress: true  //是否出现加载框
        }
    },

    /**
     * 组件初始化
     * @param 
     * @return
     */
    ready() {
        this.initLive()
    },

    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * 打开清晰度切换弹窗
         * @param 
         * @return
         */
        showDefine() {
            this.setData({
                'definitionObj.ischoose': true
            })
        },

        /**
         * 关闭清晰度切换弹窗
         * @param 
         * @return
         */
        closeDefine() {
            this.setData({
                'definitionObj.ischoose': false
            })
        },

        /**
         * 切换清晰度
         * @param {dom} e 下标 
         * @return
         */
        choiceDefine(e) {
            this.setData({
                'liveStatusObj.isProgress': true
            })
            if(this.data.currentIndex == e.target.dataset.index) {
                this.setData({
                    'definitionObj.ischoose': false
                })
                return
            }
            this.setData({
                'definitionObj.ischoose': false,
                'liveStatusObj.isSwitch': true
            })
            this.triggerEvent('changeDefine',e)
            this.initLive() 
        },

        /**
         * 缓冲时出现自动切换清晰度确认弹窗
         * @param {dom} e 播放器 
         * @return
         */
        waitAutoChangeDialog(e) {
            //如果直播不是在切换视频的时候进入加载状态就提示
            if(!this.data.liveStatusObj.isSwitch){
                this.setData({
                    'liveStatusObj.isWait': true
                })
            }
        },

        /**
         * 自动关闭缓冲时出现自动切换清晰度确认弹窗
         * @param {dom} e 播放器 
         * @return
         */
        closeWaitAutoChangeDialog(e) {
            if(this.data.liveStatusObj.isWait) {
                this.setData({
                    'liveStatusObj.isWait': false
                })
            }
        },

        /**
         * 关闭缓冲时出现自动切换清晰度确认弹窗
         * @param 
         * @return
         */
        closeWaitDialog() {
            this.setData({
                'liveStatusObj.isWait': false
            })
        },

        /**
         * 视频开始播放时时触发
         * @param 
         * @return
         */
        onPlay(){
            this.setData({
                liveStatusObj: {
                    isSwitch: false,
                    isProgress: false
                }
            })
        },

        /**
         * 立即切换
         * @param 
         * @return
         */
        switchDefin () {
            this.setData({
                liveStatusObj: {
                    isWait: false,
                    isSwitch: true,
                    isProgress: true
                }
            })
            this.triggerEvent('autoLive')
            let videoContext = wx.createVideoContext('myVideo')
            videoContext.play()
        },

        /**
         * 点击
         * @param 
         * @return
         */
        tap(){
            this.setData({
                isShow: !this.data.isShow
            })
            if(this.liveTimer){
                clearTimeout(this.liveTimer)
            }
            this.liveTimer = setTimeout(()=>{
                this.setData({
                    isShow: false
                })
            },3000)
        },

        /**
         * 检测是否全屏
         * @param {dom} event 触摸事件 
         * @return
         */
        bindChangeFull(event) {
            this.triggerEvent('bindChangeFull',event.detail.fullScreen)
            this.setData({
                isShow: false,
                'definitionObj.ischoose': false
            })
            if(event.detail.fullScreen) {
                this.setData({
                    'liveStatusObj.isFull': true
                })
            } else {
                this.setData({
                    'liveStatusObj.isFull': false
                })
            }
        },

        /**
         * 视频退出全屏
         * @param 
         * @return
         */
        exitFullScreen(){
            let videoContext = wx.createVideoContext('myVideo',this)
            videoContext.exitFullScreen()
            this.setData({
                'liveStatusObj.isFull': false
            })
        },

        /**
         * 获取全屏状态
         * @param 
         * @return {boolean} 全屏状态
         */
        getFullStatus() {
            return this.data.liveStatusObj.isFull
        },

        /**
         * 初始化直播
         * @param 
         * @return 
         */
        initLive(){
            if(this.data.defineArr.length<=1) {
                return
            }
            if(this.data.defineArr[this.data.currentIndex].sort!=0) {
                if(this.timer){
                    clearTimeout(this.timer)
                }
                this.timer = setTimeout(()=>{
                    if(this.data.liveStatusObj.isProgress) {
                        this.triggerEvent('autoLive')
                        let videoContext = wx.createVideoContext('myVideo')
                        videoContext.play()
                    } else {
                        clearTimeout(this.timer)
                    }
                },3000)
            }
        },

        /**
         * 切换全屏
         * @param 
         * @return {boolean} 全屏状态
         */
        changeFullScreen() {
            if(this.data.liveStatusObj.isFull) {
                let videoContext = wx.createVideoContext('myVideo',this)
                videoContext.exitFullScreen()
                this.setData({
                    'liveStatusObj.isFull': false
                })
            } else if(!this.data.liveStatusObj.isFull){
                let videoContext = wx.createVideoContext('myVideo',this)
                videoContext.requestFullScreen()
                this.setData({
                    'liveStatusObj.isFull': true
                })
            }
            return this.data.liveStatusObj.isFull
        },

        /**
         * 直播播放暂停
         * @param {dom} e 视频播放暂停事件
         * @return 
         */
        pause(e) {
            if(!this.data.liveStatusObj.isSwitch){
                this.setData({
                    'liveStatusObj.isWait': true
                })
            }
        },

        /**
         * 直播播放报错
         * @param {dom} e 视频播放出错事件
         * @return 
         */
        error(e) {
            if(!this.data.liveStatusObj.isSwitch){
                this.setData({
                    'liveStatusObj.isWait': true
                })
            }
        }
    }
})
