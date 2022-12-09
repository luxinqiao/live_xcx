const md_common = require('../../utils/common.js')

Component({
    externalClasses: ['header_class', 'title_class', 'left_img_class'],
    properties: {
        mode: {
            type: String,
            value: 'white'  //白底-white 透明底-transparent
        },
        isHasBorder: {  //标题的下边框
            type: Boolean,
            value: true
        },
        isCustom: {
            type: Boolean,
            value: false
        },
        title: {
            type: String,
            value: ''
        },
        leftImgUrl: {
            type: String,
            value: 'black'  //black: ../images/back.png , white: ../images/home.png,   其他情况直接传图片路由
        },
        leftFunction: {
            type: Object,
            value: {}
        }
    },
    data: {
        statusBarHeight: 0,
        titleHeight: 0,
        menuButton: 0,
        isLeftShow: true,
        leftImgSrc: ''
    },
    ready() {
        wx.getSystemInfo({
            success: (res) => {
                let btn = wx.getMenuButtonBoundingClientRect();
                this.setData({
                    statusBarHeight: res.statusBarHeight,
                    titleHeight: btn.height + (btn.top - res.statusBarHeight) * 2,
                    menuButton: btn
                });
            }
        });
        if(md_common.isEmpty(this.properties.leftImgUrl)) {
            this.setData({
                isLeftShow: false
            })
        } else if(this.properties.leftImgUrl == 'black') {
            this.setData({
                leftImgSrc: '../images/header/back.png'
            })
        } else if(this.properties.leftImgUrl == 'home') {
            this.setData({
                leftImgSrc: '../images/header/home.png'
            })
        } else {
            this.setData({
                leftImgSrc: this.properties.leftImgUrl
            })
        }
    },
    methods: {
        goBack() {
            if(typeof (this.properties.leftFunction.backFun) == 'function') {
                this.properties.leftFunction.backFun()
            } else {
                if((getCurrentPages()).length>1) {
                    wx.navigateBack({
                        delta: 1
                    })
                }
                
            }
        }
    }
});