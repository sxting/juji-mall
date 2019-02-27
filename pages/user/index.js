import { errDialog, loading } from '../../utils/util'
import { service } from '../../service';
import { constant } from '../../utils/constant';
var app = getApp();
Page({
    data: {
        nickName: '微信名字',
        avatar: '',
        phoneNum: '',

        isShowModal:true,
        windowWidth: 345,
        windowHeight: 420,
        headImg: '../../images/shareMinPro.png',
        erwmImg: '../../images/erwmImg.png',
        imgUrl:''
    },
    toJuzi: function() {
        console.log('juzi');
        wx.switchTab({ url: '../juzi/index' });
    },
    toPage: function(e) {
        var page = e.currentTarget.dataset.page;
        wx.navigateTo({ url: page });
    },
    onLoad: function() {
        wx.setNavigationBarTitle({ title: '我的' });

        wx.request({
            url: "https://w.juniuo.com/juzi_mall/qrCode.do",
            data: {
                path: 'pages/user/index'
            },
            header: {
                'content-type': 'application/json'
            },
            success:(res) => {
                this.setData({imgUrl:res.data});
            }
        });

        this.drawImage(50, 50);
    },
    onShow: function() {
        this.getInfo();
    },

    openModal:function(){
        this.setData({isShowModal:false});
    },

    closeModal:function(){
        this.setData({isShowModal:true});
    },

    getInfo: function() {
        service.userInfo({ openId: wx.getStorageSync('openid') }).subscribe({
            next: res => {
                this.setData({
                    nickName: res.nickName,
                    phoneNum: res.phone,
                    avatar: res.avatar
                });
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    setCanvasSize: function() {
        var size = {};
        size.w = wx.getSystemInfoSync().windowWidth-80;
        console.log(size.w);
        size.h = 400;
        return size;
    },
    setTitle: function(context) {
        var size = this.setCanvasSize();
        context.setFontSize(16);
        context.setTextAlign("left");
        context.setFillStyle("#333");
        context.fillText("兰溪小馆团购餐", 20, 240);
        context.fillText("“桔”美好生活，集好店优惠", 18, 345);
        context.stroke();
    },
    setText2: function(context) {
        var size = this.setCanvasSize();
        context.setFontSize(12);
        context.setTextAlign("left");
        context.setFillStyle("#999");
        context.fillText("双人情侣套餐，享受双人美味时刻", 20, 264);
        context.fillText("--------------------------------------------", 20, 312);
        context.stroke();
    },
    setText1: function(context, fansCount, attentCount) {
        var size = this.setCanvasSize();
        context.setFontSize(16);
        context.setTextAlign("left");
        context.setFillStyle("#E83221");
        context.fillText("现价：" + fansCount + "元", 20, 290);
        context.stroke();
    },
    setText3: function(context) {
        var size = this.setCanvasSize();
        context.setFontSize(14);
        context.setTextAlign("left");
        context.setFillStyle("#666");
        context.fillText("长按识别二维码", 20, 372);
        context.stroke();
    },
    drawImage: function(fansCount, attentCount) {
        var size = this.setCanvasSize();
        var context = wx.createCanvasContext('myCanvas');
        rectPath(context, 10, 10, size.w, size.h);

        context.drawImage(this.data.headImg, 20, 20, size.w - 20, 195); //宽度70，居中，距离上15

        context.save();
        context.drawImage(this.data.erwmImg, size.w - 80, 315, 80, 80); //二维码，宽度100，居中
        this.setTitle(context);
        this.setText1(context, fansCount, attentCount);
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
                    title: "已保存至相册",
                    icon: "success"
                });
                this.setData({ disabled: true });
            },
            fail: function(res) {
                console.log(res);
            }
        })
    }
});

function rectPath(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.setFillStyle('#fff');
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y);
    ctx.setStrokeStyle('transparent');
    ctx.fill();
    ctx.closePath();
}