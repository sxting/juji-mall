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
        scenepicid:'',
        userImg:'../../../images/logo.png',
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
            this.closeModal();
            return {
                title: JSON.parse(wx.getStorageSync('userinfo')).nickName + '分享给您一个心动商品，快来一起体验吧！',
                path: '/pages/comDetail/index?id=' + this.data.productId + '&storeid=&sceneid='+this.data.sceneId,
                imageUrl: constant.basePicUrl + this.data.productInfo.picId + '/resize_360_360/mode_fill'
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
        wx.showLoading({ title: '生成分享图片' });
        var productId = e.currentTarget.dataset.productid;
        this.setData({productId:productId});
        var imageId = e.currentTarget.dataset.img;
        var sceneId = e.currentTarget.dataset.sceneid;
        var scenepicid = e.currentTarget.dataset.scenepicid;
        this.setData({scenepicid:scenepicid});
        this.setData({sceneId:sceneId});
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
                            this.createProImg(sceneId,scenepicid);
                        } else {
                            wx.hideLoading();
                        }
                    }
               });
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },
    closeModal: function() {
        this.setData({ isShowModal: true });
    },
    createProImg: function(sceneId,scenepicid) {
        console.log(sceneId);
        if(sceneId){
            this.setData({sceneId:sceneId});
            console.log('scene111='+this.data.sceneId);
            this.drawCanvas(scenepicid);
        }else{
            jugardenService.getQrCode({ productId:this.data.productId,path: 'pages/comDetail/index'}).subscribe({
                next: res => {
                    var sceneId = res.senceId;
                    var scenePicId = res.picId;
                    this.setData({sceneId:sceneId});
                    console.log('scene222='+this.data.sceneId);
                    this.drawCanvas(scenePicId);
                },
                error: err => {
                    errDialog(err);
                    wx.hideLoading();
                },
                complete: () => wx.hideToast()
            });
        }
    },
    drawCanvas:function(scenePicId){
        wx.downloadFile({
            url: constant.basePicUrl + scenePicId + '/resize_200_200/mode_fill',
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
                    var name = info.productName;
                    var price2 = Number(info.originalPrice / 100).toFixed(2) + '元';
                    var storeLen = info.productStores.length;
                    this.drawImage(info.merchantName,name,'',price1,price2,storeLen);//参数依次是storeName,desc,现价,原价,门店数
                    this.setData({ isShowModal: false });
                } else {
                    wx.hideLoading();
                }
            }
        });
    },
  drawImage: function(merchant,name,desc,price1,price2,storeLen) {
      var size = {w:260,h:424};
      var context = wx.createCanvasContext('myCanvas');
      context.drawImage(this.data.shareBg, 0, 0, size.w, size.h);
      context.drawImage("../../../images/logo.png", 20, 18, 20, 21);
      setText(context,"“桔”美好生活，集好店优惠", 52, 35,"#000",15,'left');
      context.drawImage(this.data.headImg, 10, 52, size.w - 20,138);
      rectPath(context, 10, 190, size.w-20, 134);
      setText(context,merchant, 20, 210,"#999",10,'left');//商户名
      drawText(context,name,20,230,50,216);//商品名字
      setText(context,"适用"+storeLen+"家门店", size.w - 20, 210,"#999",10,'right');//适用门店

      context.drawImage("../../../images/price.png", 20, 263, 30,13);
      setText(context,price1, 55, 275,'#E83221',14,'left');//价格
      setText(context,"原价:" + price2, size.w - 20, 275,'#999',10,'right');//原价

      context.drawImage("../../../images/gou.png", 20, 293, 10,10);
      setText(context,"可退款", 35, 302,'#999',9,'left');
      context.drawImage("../../../images/gou.png", 80, 293, 10,10);
      setText(context,"可转赠", 95, 302,'#999',9,'left');

      rectPath(context, 0, 334, size.w, 88);
      context.drawImage('../../../images/erbg.png', 70, 387, 103, 18);
      setText(context,"长按识别小程序码", 77, 400,'#333',11,'left');

      context.save();
      context.beginPath();
      context.arc(35, 375, 25, 0, Math.PI * 2, false);
      context.clip();
      context.drawImage(this.data.userImg, 10, 350, 50, 50);
      context.restore();

      context.drawImage(this.data.erwmImg, size.w - 80, 342.5, 70, 70);
      var nickName = JSON.parse(wx.getStorageSync('userinfo')).nickName;
      setText(context,nickName, 70, 360,"#333",12,'left');
      setText(context,"私藏好物，分享给你", 70, 379,'#666',11,'left');
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
                                  that.saveAsPhoto(res1.tempFilePath,type);
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
                          that.saveAsPhoto(res1.tempFilePath,type);
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
  saveAsPhoto: function(imgUrl,type) {
      wx.saveImageToPhotosAlbum({
          filePath: imgUrl,
          success: (res) => {
            this.share();//分享获得桔子
            this.closeModal();
            if(type==1){
              wx.showToast({
                  title: "已保存至相册",
                  icon: "success"
              });
            }else{
              errDialog('图文海报已保存到微信本地相册，打开微信朋友圈分享吧!');
            }
          },
          fail: function(res) {
              console.log(res);
          }
      })
  }
})

function setText(ctx,str,x,y,color,size,align){
    ctx.setFontSize(size);
    ctx.setTextAlign(align);
    ctx.setFillStyle(color);
    ctx.fillText(str, x, y);
    ctx.stroke();
}

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

function drawBar(ctx,x1,x2,y){
    ctx.beginPath();
    ctx.setLineCap('round');
    ctx.setStrokeStyle('#FFDC00');
    ctx.setLineWidth(18);
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
}

//1、canvas对象，2、文本 3、距离左侧的距离 4、距离顶部的距离 5、6、文本的宽度
function drawText(ctx, str, left, top, titleHeight, canvasWidth) {
    var lineWidth = 0;
    var lastSubStrIndex = 0; //每次开始截取的字符串的索引
    ctx.setFontSize(12);
    ctx.setTextAlign('left');
    ctx.setFillStyle('#333');
    if(str.length>36){
      var str = str.substring(0,36)+'...';
    }
    for (let i = 0; i < str.length; i++) {
        lineWidth += ctx.measureText(str[i]).width;
        if (lineWidth > canvasWidth) {
            ctx.fillText(str.substring(lastSubStrIndex, i), left, top); //绘制截取部分
            top += 16; //16为字体的高度
            lineWidth = 0;
            lastSubStrIndex = i;
            titleHeight += 30;
        }
        if (i == str.length - 1) { //绘制剩余部分
            ctx.fillText(str.substring(lastSubStrIndex, i + 1), left, top);
        }
    }
    ctx.stroke();
    titleHeight = titleHeight + 10;
    return titleHeight
}
