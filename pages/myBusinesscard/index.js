var app = getApp();
Page({
    data: {
        windowWidth: 345,
        windowHeight: 400,
        headImg:'',
        hidden:false,
        disabled:false
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '我的名片' });
        wx.downloadFile({
          url: app.globalData.userInfo.headImg,
          success: (res) => {
            this.setData({hidden:true});
            this.setData({headImg:res.tempFilePath});
            if (res.statusCode === 200) {
                this.drawBusinessImage(options.fansCount,options.attentCount);
            }
          }
        });
    },
    setCanvasSize: function() {
        var size = {};
        size.w = wx.getSystemInfoSync().windowWidth;
        size.h = 400;
        return size;
    },
    setName: function(context) {
        var size = this.setCanvasSize();
        context.setFontSize(18);
        context.setTextAlign("center");
        context.setFillStyle("#333");
        context.fillText(app.globalData.userInfo.name, size.w / 2, 113);
        context.stroke();
    },
    setText1: function(context,fansCount,attentCount) {
        var size = this.setCanvasSize();
        context.setFontSize(12);
        context.setTextAlign("center");
        context.setFillStyle("#666");
        context.fillText("粉丝数："+fansCount+"   |   关注数："+attentCount, size.w / 2, 140);
        context.stroke();
    },
    setText2: function(context) {
        var size = this.setCanvasSize();
        context.setFontSize(14);
        context.setTextAlign("center");
        context.setFillStyle("#333");
        context.fillText("“跟我一起吃喝玩乐，会员权益免费拿”", size.w / 2, 350);
        context.stroke();
    },
    setText3: function(context) {
        var size = this.setCanvasSize();
        context.setFontSize(14);
        context.setTextAlign("center");
        context.setFillStyle("#666");
        context.fillText("长按识别小程序码", size.w / 2, 285);
        context.fillText("来【享拼拼】关注我！", size.w / 2, 309);
        context.stroke();
    },
    drawBusinessImage: function(fansCount,attentCount) {
        var size = this.setCanvasSize();
        var context = wx.createCanvasContext('myCanvas');
        rectPath(context, 0, 0, size.w, size.h);
        roundRect(context, 15, 50, size.w - 30, 325, 10);

        context.save();
        context.beginPath();
        context.arc(size.w/2, 50, 35, 0, Math.PI * 2, false);
        context.clip();
        context.drawImage(this.data.headImg, size.w/2-35, 15, 70, 70); //宽度70，居中，距离上15
        context.restore();

        context.save();
        context.drawImage('../../images/erwm.jpg', size.w/2 - 50, 160, 100, 100); //二维码，宽度100，居中
        this.setName(context);
        this.setText1(context,fansCount,attentCount);
        this.setText2(context);
        this.setText3(context);
        context.draw();
    },
    savePic: function() {
        var that = this;
        wx.canvasToTempFilePath({
            canvasId: 'myCanvas',
            success: function(res1) {
                wx.getSetting({
                    success(res2) {
                        if (!res2.authSetting['scope.writePhotosAlbum']) {
                            wx.authorize({
                                scope: 'scope.writePhotosAlbum',
                                success() {
                                    console.log('授权成功')
                                    that.saveAsPhoto(res1.tempFilePath);
                                },
                                fail() {
                                    wx.openSetting({
                                        success: function() {
                                            console.log("openSetting: success");
                                        },
                                        fail: function() {
                                            console.log("openSetting: fail");
                                        }
                                    });
                                }
                            })
                        } else {
                            console.log("已经授权");
                            that.saveAsPhoto(res1.tempFilePath);
                        }
                    },
                    fail() {
                        console.log("getSetting: fail");
                    }
                })
            },
            fail: function(res) {
                console.log(res);
            }
        });
    },
    saveAsPhoto: function(imgUrl) {
        wx.saveImageToPhotosAlbum({
            filePath: imgUrl,
            success: (res) => {
                wx.showToast({
                    title:"已保存至相册",
                    icon:"success"
                });
                this.setData({disabled:true});
            },
            fail: function(res) {
                console.log(res);
            }
        })
    }
});

function rectPath(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.setFillStyle('#b45fff');
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y);
    ctx.setStrokeStyle('transparent');
    ctx.fill();
    ctx.closePath();
}

/**
 * 
 * @param {object} ctx canvas上下文
 * @param {number} x 圆角矩形选区的左上角 x坐标
 * @param {number} y 圆角矩形选区的左上角 y坐标
 * @param {number} w 圆角矩形选区的宽度
 * @param {number} h 圆角矩形选区的高度
 * @param {number} r 圆角的半径
 */
function roundRect(ctx, x, y, w, h, r) {
    // 开始绘制
    ctx.beginPath()
    // 因为边缘描边存在锯齿，最好指定使用 transparent 填充
    // 这里是使用 fill 还是 stroke都可以，二选一即可
    ctx.setFillStyle('#ffffff')
    // 左上角
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)

    // border-top
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.lineTo(x + w, y + r)
    // 右上角
    ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)

    // border-right
    ctx.lineTo(x + w, y + h - r)
    ctx.lineTo(x + w - r, y + h)
    // 右下角
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)

    // border-bottom
    ctx.lineTo(x + r, y + h)
    ctx.lineTo(x, y + h - r)
    // 左下角
    ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)

    // border-left
    ctx.lineTo(x, y + r)
    ctx.lineTo(x + r, y)

    // 这里是使用 fill 还是 stroke都可以，二选一即可，但是需要与上面对应
    // ctx.setStrokeStyle('#fff')
    ctx.fill()
    ctx.closePath()
    // 剪切
    // ctx.clip()
}

