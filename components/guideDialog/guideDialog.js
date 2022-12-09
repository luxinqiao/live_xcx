Component({
    /**
     * 组件的初始数据
     */
    data: {
        isShow: false,
        top: 0,
        countDownFn: null
    },

    ready() {
        if(!wx.getStorageSync('firstShow')) {
            this.setData({
                top: wx.getMenuButtonBoundingClientRect().top+wx.getMenuButtonBoundingClientRect().height,
                isShow: true
            },()=> {
                wx.setStorageSync('firstShow',true)
                let num = 10
                this.setData({
                    countDownFn: setInterval(() => {
                        if (--num === 0) {
                            clearInterval(this.data.countdownFnc)
                            this.setData({
                                isShow: false,
                            })
                        } 
                    }, 1000)
                })
            })
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        close() {
            clearInterval(this.data.countdownFnc)
            this.setData({
                isShow: false
            })
        }
    }
})
