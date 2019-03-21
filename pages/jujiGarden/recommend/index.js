import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';

Page({
    data: {
        recommendlist: [{ imgIds: ['25R9F7zL2Dhr', '260HcKCwl672', '25SGzGlgKSrG', '25SGzGlgKSrG', '25Xi1X38wUK8', '25R9F7zL2Dhr'] }],
        picId: '25R9F7zL2Dhr',
        constant: constant,
        isShowNodata: false,
        curTabIndex: 1,
        shareBg: '../../../images/shareBg.png',
        isShowModal:false
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({
            title: '推广素材',
        });
    },

    switchTab: function(e) {
        this.setData({ curTabIndex: e.currentTarget.dataset.index });
    },

    /**生成图文**/
    showImageTextToShare: function() {
        wx.showLoading({ title: '生成图片...' });
        wx.downloadFile({
            url: constant.basePicUrl + this.data.picId + '/resize_240_240/mode_fill',
            success: (res) => {
                if (res.statusCode === 200) {

                } else {
                    wx.hideLoading();
                }
            }
        });
    },
    /**分享给朋友**/
    shareToFriend: function() {

    },
    /**分享到朋友圈**/
    shareToWechatCircles: function() {

    },
    /**保存素材**/
    saveImagesToPhone: function(e) {
        var imgIds = e.currentTarget.dataset.imgs;
        var that = this;
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            that.saveFile(imgIds);
                        }
                    })
                } else {
                    that.saveFile(imgIds);
                }
            },
            fail() {
                console.log("getSetting: fail");
            }
        })
    },
    saveFile: function(imgIds) {
        var imgIndex = 0;
        for (var i = 0; i < imgIds.length; i++) {
            var imgId = imgIds[i];
            wx.downloadFile({
                url: constant.basePicUrl + imgIds[i] + '/resize_240_240/mode_fill',
                success: function(res) {
                    wx.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success: (res) => {
                            imgIndex++;
                            if (imgIndex == imgIds.length) {
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
    getQrCode: function() {
      service.getQrCode({ productId:this.data.productId,path: 'pages/comDetail/index'}).subscribe({
          next: res => {
            var picId = res;
            wx.downloadFile({
              url: constant.basePicUrl+picId+'/resize_240_240/mode_fill',
              success: (res1) => {
                if (res1.statusCode === 200) {
                    this.setData({erwmImg:res1.tempFilePath});
                    var info = this.data.productInfo;
                    wx.hideLoading();
                    if(info.type=='POINT'){
                      var price1 = info.point+'桔子';
                    }else{
                      if(info.point!=0){
                        var juzi = info.point+'桔子+';
                      }else{
                        var juzi = ''
                      }
                      var price1 = juzi + Number(info.price / 100).toFixed(2)+'元';
                    }
                    var name = info.productName.substring(0,15);
                    var price2 = Number(info.originalPrice / 100).toFixed(2) + '元';
                    this.drawImage(name,'',price1,price2,info.soldNum);//参数依次是storeName,desc,现价,原价,销量
                    this.setData({isShowModal:false});
                    setTimeout(()=>{
                      this.setData({isHiddenClose:true});
                    },1500)            
                }else{
                  wx.hideLoading();
                }
              }
            });
          },
          error: err => {
            errDialog(err);
            wx.hideLoading();
          },
          complete: () => wx.hideToast()
      });
    },
    setCanvasSize: function() {
      var size = {};
      size.w = wx.getSystemInfoSync().windowWidth-90;
      size.h = 440;
      return size;
    },
    setTitle: function(context,name) {
      context.setFontSize(14);
      context.setTextAlign("left");
      context.setFillStyle("#666666");
      context.fillText(name, 28, 253);
      context.fillText("“桔”美好生活", 25, 350);
      context.stroke();

      context.setFontSize(12);
      context.setTextAlign("left");
      context.setFillStyle("#666666");
      context.fillText("集好店优惠", 38, 378);
      context.stroke();
    },
    setText2: function(context,price) {
      context.setFontSize(15);
      context.setTextAlign("left");
      context.setFillStyle("#E83221");
      context.fillText("现价:" + price, 28, 281);
      context.stroke();
    },
    setText3: function(context,price,amount) {
      var size = this.setCanvasSize();
      context.setFontSize(13);
      context.setTextAlign("right");
      context.setFillStyle("#999");
      context.fillText("原价:" + price, size.w, 281);
      context.stroke();
      context.setFontSize(13);
      context.setTextAlign("right");
      context.setFillStyle("#999");
      context.fillText("销量:" + amount, size.w, 253);
      context.stroke();
    },
    setText4: function(context) {
      var size = this.setCanvasSize();
      context.setFontSize(12);
      context.setTextAlign("right");
      context.setFillStyle("#666");
      context.fillText("长按识别二维码", size.w-10, 410);
      context.stroke();
    },
    drawImage: function(name, desc,price1,price2,amount) {//name,desc,现价,原价,销量
      var size = this.setCanvasSize();
      var context = wx.createCanvasContext('myCanvas');
      context.drawImage(this.data.shareBg, 0, 0, size.w+90, size.h); //宽度70，居中，距离上15
      rectPath(context, 15, 15, size.w, size.h-30);
      context.drawImage(this.data.headImg, 28, 28, size.w - 26, 200); //宽度70，居中，距离上15
      context.save();
      context.drawImage(this.data.erwmImg, size.w - 90, 312, 80, 80); //二维码，宽度100，居中
      this.setTitle(context,name);
      // this.setText1(context,desc);
      drawDashLine(context, 28, 300, size.w, 300, 4);//横向虚线
      this.setText2(context,price1);
      this.setText3(context,price2,amount);
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

// get推广素材list信息
function getProductListInfor() {
    let self = this;
    let data = {

    }
}