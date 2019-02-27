import { errDialog, loading } from '../../utils/util'
import { service } from '../../service';
import { constant } from '../../utils/constant';
var app = getApp();
Page({
    data: {
        nickName: '微信名字',
        avatar: '',
        phoneNum: '',

        isShowModal:false,
        windowWidth: 345,
        windowHeight: 430,
        headImg: '../../images/shareMinPro.png',
        erwmImg: '../../images/erwmImg.png',
        imgUrl:''
    },
    toJuzi: function() {
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
                console.log("11111")
                wx.downloadFile({
                  url: res.data,
                  success: (res) => {
                    console.log("22222")
                    console.log(res.tempFilePath);
                    this.setData({erwmImg:res.tempFilePath});
                    if (res.statusCode === 200) {

                    }
                  },
                  fail:(res)=>{
                    console.log("33333")
                  }
                });
            }
        });

        this.drawImage("商家名字","商品描述",50,48,10);//参数依次是storeName,desc,现价,原价,销量
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
        size.w = wx.getSystemInfoSync().windowWidth-90;
        size.h = 400;
        return size;
    },
    setTitle: function(context,name) {
        context.setFontSize(15);
        context.setTextAlign("left");
        context.setFillStyle("#333");
        context.fillText(name, 28, 236);
        context.fillText("“桔”美好生活，集好店优惠", 18, 353);
        context.stroke();
    },
    setText1: function(context,desc) {
        context.setFontSize(12);
        context.setTextAlign("left");
        context.setFillStyle("#999");
        context.fillText(desc, 28, 264);
        context.fillText("-------------------------------------------------", 25, 320);
        context.stroke();
    },
    setText2: function(context,price) {
        context.setFontSize(16);
        context.setTextAlign("left");
        context.setFillStyle("#E83221");
        context.fillText("现价：" + price + "元", 28, 290);
        context.stroke();
    },
    setText3: function(context,price,amount) {
        var size = this.setCanvasSize();
        context.setFontSize(13);
        context.setTextAlign("left");
        context.setFillStyle("#999");
        context.fillText("原价:" + price + "元", 150, 290);
        context.stroke();
        context.setFontSize(13);
        context.setTextAlign("right");
        context.setFillStyle("#999");
        context.fillText("销量:" + amount, size.w, 236);
        context.stroke();
    },
    setText4: function(context) {
        context.setFontSize(14);
        context.setTextAlign("left");
        context.setFillStyle("#666");
        context.fillText("长按识别二维码", 28, 379);
        context.stroke();
    },
    drawImage: function(name, desc,price1,price2,amount) {//name,desc,现价,原价,销量
        var size = this.setCanvasSize();
        var context = wx.createCanvasContext('myCanvas');
        rectPath(context, 15, 15, size.w, size.h);
        context.drawImage(this.data.headImg, 28, 28, size.w - 26, 185); //宽度70，居中，距离上15
        context.save();
        context.drawImage(this.data.erwmImg, size.w - 80, 325, 80, 80); //二维码，宽度100，居中
        this.setTitle(context,name);
        this.setText1(context,desc);
        this.setText2(context,price1);
        this.setText3(context,price2,amount);
        this.setText4(context);
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