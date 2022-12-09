Component({
    /**
1. 组件的属性列表
 */
    properties: {
        progress_txt: {
            type: String,
            value: ''
        },
        progress_endTxt: { //观看完成后的文本 默认00：00
            type: String,
            value: '00:00'
        },
        currentTime: { // 设置 已播放时间 初始为0
            type: Number,
            value: 0
        },
        dateValue: { // 设置 视频的总时长 初始为0
            type: Number,
            value: 0
        },
        number_x: { //圆心的 x 坐标
            type: Number,
            value: 0
        },
        number_y: { //圆心的 y 坐标
            type: Number,
            value: 0
        },
        number_r: { //圆的 r 半径
            type: Number,
            value: 0
        },
        number_w: { //一类父级圆环的宽度 默认为2
            type: Number,
            value: 2
        },
        number_w_c: { //二类子级圆环的宽度 默认为3
            type: Number,
            value: 3
        },
        fontSize: { //字体大小 默认24rpx
            type: String,
            value: "24rpx"
        },
        fontFamily: { //字体格式 默认微软雅黑
            type: String,
            value: "Microsoft YaHei",
        },
        color: { //进度条中间字体颜色
            type: String,
			value: "#ff2c79"
        },
        backgroundColor: { //进度条所在圆的背景颜色  默认值#fff
            type: String,
            value: '#fff'
        },
		completeColor: { //完成部分的颜色 默认#ff2c79
            type: String,
			value: '#ff2c79'
        },
        unCompleteColor: { //未完成部分的颜色 默认透明
            type: String,
            value: 'transparent'
        },
        dotShow: { //是否显示时间前的小黄点 默认为false
            type: Boolean,
            value: false
        }
    },
    data: {},

    methods: {
        /**
         * 绘制进度条主函数
         * @param
         * @return
         */
        countInterval() {
            if (this.data.currentTime <= this.data.dateValue) {
                this.drawCircle(this.data.currentTime / (this.data.dateValue / 2))
            }
        },
        /**
         * 绘制进度条 
         * @param {Number} step 为绘制的圆环周长
         * @return
         */
        drawCircle: function(step) {
            var context = wx.createCanvasContext('canvasProgress', this)
            var gradient = context.createLinearGradient(200, 100, 100, 200)
            gradient.addColorStop("1.0", `${this.data.completeColor}`)
            context.setLineWidth(this.data.number_w_c)
            context.setStrokeStyle(`${this.data.completeColor}`)
            context.setLineCap('round')
            context.beginPath()
            // 参数step 为绘制的圆环周长，从0到2为一周 。 -Math.PI / 2 将起始角设在12点钟位置 ，结束角 通过改变 step 的值确定
            context.arc(this.data.number_x, this.data.number_y, this.data.number_r, -Math.PI / 2, step * Math.PI - Math.PI / 2, false)
            context.stroke()
            context.draw()
        }
    },
    /**
     * 绘制进度条底色
     * @param
     * @return
     */
    drawProgressbg() {
        // 使用 wx.createContext 获取绘图上下文 context
        var ctx = wx.createCanvasContext('canvasProgressbg')
        ctx.setLineWidth(this.data.number_w) // 设置圆环的宽度
        ctx.setStrokeStyle(`${this.data.unCompleteColor}`) // 设置圆环的颜色 'transparent'
        ctx.setLineCap('round') // 设置圆环端点的形状 
        ctx.beginPath() //开始一个新的路径
        ctx.arc(this.data.number_x, this.data.number_y, this.data.number_r, 0, 2 * Math.PI, false)
        //设置一个原点(110,110)，半径为100的圆的路径到当前路径
        ctx.stroke() //对当前路径进行描边
        ctx.draw()
    }
})