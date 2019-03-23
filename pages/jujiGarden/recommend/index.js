import { jugardenService } from '../shared/service';
import { service } from '../../../service.js';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';

Page({
    data: {
        // recommendlist: [{
        //     imageIds: ['25R9F7zL2Dhr', '260HcKCwl672', '25SGzGlgKSrG', '25SGzGlgKSrG', '25Xi1X38wUK8', '25R9F7zL2Dhr'],
        //     descriptions: "素材文字素材文字素材文字素材文字素材",
        //     editorAvatar: "https://upic.juniuo.com/file/picture/25R9F7zL2Dhr/resize_180_180/mode_fill",
        //     editorNickName: "小仙女",
        //     productId: '2019031415090868068616188',
        //     sceneId: '26FPo2h5cDNg'
        // }],
        recommendlist:[],
        constant: constant,
        isShowNodata: false,
        curTabIndex: 1,
        productInfo: {}, //当前商品的信息
        shareBg: '../../../images/shareBg.png',
        erwmImg:'',
        headImg:'',
        isShowModal: true,
        sceneId:'',
        productId: ''//当前商品的id
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '推广素材' });
        if (options.productid) {
            this.setData({ productId: options.productid });
        }
        this.getData(this.data.productId);
    },
    getData: function(productId) {
        jugardenService.shareList({
            providerId:wx.getStorageSync('providerId'),
            productId: productId, //如果从首页进入productId不为空
            pageNo: 1,
            pageSize: 20
        }).subscribe({
            next: res => {
                this.setData({recommendlist:res});
                this.setData({isShowNodata: this.data.recommendlist.length == 0 });
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    switchTab: function(e) {
        this.setData({ curTabIndex: e.currentTarget.dataset.index });
    },
    onShareAppMessage: function(res) {
        if (res.from === 'button') {
            return {
                title: JSON.parse(wx.getStorageSync('userinfo')).nickName + '分享给您一个心动商品，快来一起体验吧！',
                path: '/pages/comDetail/index?id=' + this.data.productId + '&sceneid='+this.data.sceneId,
                imageUrl: constant.basePicUrl + this.data.productInfo.picId + '/resize_360_360/mode_fill',
                success: (res) => {
                    this.closeModal();
                }
            }
        }
    },
    /**保存素材**/
    saveImagesToPhone: function(e) {
        var imageIds = e.currentTarget.dataset.imgs;
        var that = this;
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success: (res) => {
                            that.saveFile(imageIds);
                        }
                    })
                } else {
                    that.saveFile(imageIds);
                }
            },
            fail() {
                console.log("getSetting: fail");
            }
        })
    },
    saveFile: function(imageIds) {
        var imgIndex = 0;
        for (var i = 0; i < imageIds.length; i++) {
            var imgId = imageIds[i];
            wx.downloadFile({
                url: constant.basePicUrl + imageIds[i] + '/resize_240_240/mode_fill',
                success: function(res) {
                    wx.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success: (res) => {
                            imgIndex++;
                            if (imgIndex == imageIds.length) {
                                wx.showToast({
                                    title: "已保存至相册",
                                    icon: "success"
                                });
                            }
                        },
                        fail: (res) => {
                            console.log(res);
                        }
                    });
                }
            });
        }
    },

    // 分享朋友圈，生成图文
    shareToCircle: function(e) {
        wx.showLoading({ title: '生成图片...' });
        var productId = e.currentTarget.dataset.productid;
        this.setData({productId:productId});
        var imageId = e.currentTarget.dataset.img;
        var sceneId = e.currentTarget.dataset.sceneid;
        service.getItemInfo({
            productId: productId,storeId:''
        }).subscribe({
            next: res => {
              this.setData({productInfo:res.product});
              wx.downloadFile({
                    url: constant.basePicUrl + imageId + '/resize_750_420/mode_fill',
                    success: (res) => {
                        if (res.statusCode === 200) {
                            this.setData({ headImg: res.tempFilePath });
                            this.createProImg(sceneId);
                        } else {
                            wx.hideLoading();
                        }
                    }
               });
            },
            error: err => console.log(err),
            complete: () => wx.hideLoading()
        })
    },
    closeModal: function() {
        this.setData({ isShowModal: true });
    },
    createProImg: function(sceneId) {
        console.log(sceneId);
        if(sceneId){
            this.setData({sceneId:sceneId});
            console.log('scene111='+this.data.sceneId);
            this.drawCanvas(sceneId);
        }else{
            jugardenService.getQrCode({ productId:this.data.productId,path: 'pages/comDetail/index'}).subscribe({
                next: res => {
                    var sceneId = res.senceId;
                    this.setData({sceneId:sceneId});
                    console.log('scene222='+this.data.sceneId);
                    this.drawCanvas(sceneId);
                },
                error: err => {
                    errDialog(err);
                    wx.hideLoading();
                },
                complete: () => wx.hideToast()
            });
        }
    },
    drawCanvas:function(sceneId){
        wx.downloadFile({
            url: constant.basePicUrl + sceneId + '/resize_200_200/mode_fill',
            success: (res1) => {
                if (res1.statusCode === 200) {
                    this.setData({ erwmImg: res1.tempFilePath });
                    var info = this.data.productInfo;
                    wx.hideLoading();
                    if (info.type == 'POINT') {
                        var price1 = info.point + '桔子';
                    } else {
                        if (info.point != 0) {
                            var juzi = info.point + '桔子+';
                        } else {
                            var juzi = '';
                        }
                        var price1 = juzi + Number(info.price / 100).toFixed(2) + '元';
                    }
                    var name = info.productName.substring(0, 15);
                    var price2 = Number(info.originalPrice / 100).toFixed(2) + '元';
                    this.drawImage(name, '', price1, price2, info.soldNum); //参数依次是storeName,desc,现价,原价,销量
                    this.setData({ isShowModal: false });
                } else {
                    wx.hideLoading();
                }
            }
        });
    },
    setCanvasSize: function() {
        var size = {};
        size.w = 256;
        size.h = 424;
        return size;
    },
    setTitle: function(context, name) {
        context.setFontSize(12);
        context.setTextAlign("left");
        context.setFillStyle("#333");
        context.fillText(name, 20, 210);
        context.stroke();

        context.setFontSize(15);
        context.setTextAlign("left");
        context.setFillStyle("#000");
        context.fillText("“桔”美好生活，集好店优惠", 45, 35);
        context.stroke();
    },
    setText2: function(context, price1, price2) {
        var size = this.setCanvasSize();
        context.setFontSize(12);
        context.setTextAlign("left");
        context.setFillStyle("#E83221");
        context.fillText(price1, 55, 235);
        context.stroke();
        context.setFontSize(10);
        context.setTextAlign("right");
        context.setFillStyle("#999999");
        context.fillText("原价:" + price2, size.w - 20, 234);
        context.stroke();
    },
    setText3: function(context, amount) {
        var size = this.setCanvasSize();
        context.setFontSize(10);
        context.setTextAlign("right");
        context.setFillStyle("#999999");
        context.fillText("销量:" + amount, size.w - 20, 262);
        context.stroke();
    },
    setText4: function(context) {
        var size = this.setCanvasSize();
        context.setFontSize(11);
        context.setTextAlign("center");
        context.setFillStyle("#666666");
        context.fillText("长按识别二维码", 128, 393);
        context.stroke();
    },
    setText5: function(context) {
        var size = this.setCanvasSize();
        context.setFontSize(9);
        context.setTextAlign("left");
        context.setFillStyle("#999999");
        context.fillText("过期退", 35, 261);
        context.fillText("随时退", 95, 261);
        context.stroke();
    },
    drawImage: function(name, desc, price1, price2, amount) { //name,desc,现价,原价,销量
        var size = this.setCanvasSize();
        var context = wx.createCanvasContext('myCanvas');
        context.drawImage(this.data.shareBg, 0, 0, size.w, size.h); //宽度70，居中，距离上15
        context.drawImage("../../../images/logo.png", 20, 18, 20, 21); //宽度70，居中，距离上15
        context.drawImage(this.data.headImg, 10, 52, size.w - 20, 138); //宽度70，居中，距离上15
        rectPath(context, 10, 190, size.w-20, 219);
        context.drawImage(this.data.erwmImg, size.w / 2 - 40, 292.5, 80, 80); //二维码，宽度100，居中
        this.setTitle(context, name);
        context.drawImage("../../../images/price.png", 20, 224, 30, 13); //宽度70，居中，距离上15
        context.drawImage("../../../images/gou.png", 20, 252.5, 10, 10); //宽度70，居中，距离上15
        context.drawImage("../../../images/gou.png", 80, 252.5, 10, 10); //宽度70，居中，距离上15
        this.setText5(context);
        drawDashLine(context, 15, 280, size.w - 15, 280, 4); //横向虚线
        this.setText2(context, price1, price2);
        this.setText3(context, amount);
        this.setText4(context);
        context.draw();
    },
    savePic: function(e) {
        var type = e.currentTarget.dataset['type'];
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
                                    that.saveAsPhoto(res1.tempFilePath, type);
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
                            that.saveAsPhoto(res1.tempFilePath, type);
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
    saveAsPhoto: function(imgUrl, type) {
        wx.saveImageToPhotosAlbum({
            filePath: imgUrl,
            success: (res) => {
                this.closeModal();
                if (type == 1) {
                    wx.showToast({title: "已保存至相册",icon: "success"});
                } else {
                    errDialog('图文海报已保存到微信本地相册');
                }
            },
            fail: function(res) {
                console.log(res);
            }
        })
    }
})

function rectPath(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.setFillStyle('#ffffff');
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y);
    ctx.setStrokeStyle('#ffffff');
    ctx.fill();
    ctx.closePath();
}

function drawDashLine(ctx, x1, y1, x2, y2, dashLength) { //传context对象，始点x和y坐标，终点x和y坐标，虚线长度
    ctx.beginPath();
    ctx.setStrokeStyle("#eeeeee") //设置线条的颜色
    ctx.setLineWidth(1) //设置线条宽度
    var dashLen = dashLength === undefined ? 3 : dashLength,
        xpos = x2 - x1, //得到横向的宽度;
        ypos = y2 - y1, //得到纵向的高度;
        numDashes = Math.floor(Math.sqrt(xpos * xpos + ypos * ypos) / dashLen);
    for (var i = 0; i < numDashes; i++) {
        if (i % 2 === 0) {
            ctx.moveTo(x1 + (xpos / numDashes) * i, y1 + (ypos / numDashes) * i);
        } else {
            ctx.lineTo(x1 + (xpos / numDashes) * i, y1 + (ypos / numDashes) * i);
        }
    }
    ctx.stroke();
}