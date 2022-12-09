Component({
    properties: {
        isRound: { //是否显示圆角 默认不显示
            type: Boolean,
            value: false
        },
        isOverlay: { //是否显示遮罩层 默认显示
            type: Boolean,
            value: true
        },
        isclose_on_click_overlay: { //是否在点击遮罩层后关闭 默认true
            type: Boolean,
            value: true
        },
        duration: { //动画时长 默认300ms
            type: Number,
            value: 300
        },
        position: { //单出位置可选值：top bottom right left
            type: String,
            value: 'bottom'
        },
        islock_scroll: {  //是否锁定背景滚动 默认true
            type: Boolean,
            value: true
        }
    },
    data: {
        systemInfoObj: {},
        animation: '',
        isShow: false,
        positionValue: null,
    },
    /**
     * 自定义组件生命周期-组件挂载后执行
     * @param
     * @return
     */
    ready() {
        let that = this
        wx.getSystemInfo({
            success(res) {
                that.setData({
                    systemInfoObj: res
                })
            }
        })
        this.animation = wx.createAnimation({
            duration: this.data.duration,
            timingFunction: "linear",
            delay: 0
        })
    },
    methods: {
        /**
         * 点击遮罩层关闭遮罩层
         * @param
         * @return
         */
        clickBox() {
            if (this.data.isclose_on_click_overlay) {
                this.hidePopup()
            }
        },
        /**
         * 点击内容无动作
         * @param
         * @return
         */
        clickSlot(){

        },
        /**
         * 显示popup
         * @param 
         * @return
         */
        showPopup() {
            this.setData({
                isShow: true
            })
            this.triggerEvent('open') //打开弹出层时触发
            let animation = this.animation
            setTimeout(() => {
                this.triggerEvent('opened') //打开弹出层且动画结束后触发
            }, this.data.duration + 20)
            let query = this.createSelectorQuery()
            query.select('#mdPopup').boundingClientRect()
            query.exec(function(rect) {
                if (rect[0] === null) return;
                this.setData({
                    positionValue: (this.data.position === 'top' || this.data.position === 'bottom') ? -(rect[0].height) : -(rect[0].width)
                })
                setTimeout(function() {
                    animation[this.data.position](0).step()
                    this.setData({
                        animation: animation.export()
                    })
                }.bind(this), 20)
            }.bind(this))
        },
        /**
         * 隐藏popup
         * @param 
         * @return
         */
        hidePopup() {
            this.triggerEvent('close') //关闭弹出层时触发
            let animation = this.animation
            setTimeout(() => {
                this.setData({
                    isShow: false
                })
                this.triggerEvent('closed') //关闭弹出层且动画结束后触发
            }, this.data.duration + 20)
            setTimeout(function() {
                animation[this.data.position](this.data.positionValue).step()
                this.setData({
                    animation: animation.export()
                })
            }.bind(this), 20)
        }
    }
})