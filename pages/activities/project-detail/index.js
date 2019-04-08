var util = require('../../../utils/util.js');
import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
var app = getApp();
Page({
  data: {
    productId: '',
    storeId: '',
    showPics: [],
    commentList: [],
    productInfo: {},
    description: [],
    recommendList: [],
    store: {},
    commentCount: 0,
    recommendCount: 0,
    pointBalance: 0,
    note: [],
    despImgHeightValues: [],
    isShowData: false,
    isHiddenClose: false,
    isShowModal: true,
    windowWidth: 345,
    windowHeight: 430,
    shareBg: '../../../images/shareBg.png',
    headImg: '',
    erwmImg: '',
    userImg: '',
    sceneId: '',
    isShowNewerGet: false,
    userImgUrl: '../../../images/shareBg.png',
    nickName: '',
    lat: '',
    lng: '',
    share: 0,//首页分享按钮进入值为1
    type: ''
  },
  onLoad: function (options) {
    if (options.share) {
      this.setData({ share: options.share });
    }
    wx.setNavigationBarTitle({ title: '商品详情' });
    this.setData({ productId: options.id, type: options.type ? options.type : '' });
    if (options.storeid) {
      this.setData({ storeId: options.storeid });
    }
    if (options.sceneid) {
      this.setData({ sceneId: options.sceneid });
    }
    // 查询商品详情
    this.getItemInfo();
  },
  onShow: function () {
    //评论列表
  },
  previewImage: function (e) {
    var arr = [];
    var url = constant.basePicUrl + e.currentTarget.dataset.url + '/resize_0_0/mode_fill';
    arr.push(url);
    wx.previewImage({
      urls: arr // 需要预览的图片http链接列表
    })
  },
  toMap: function (e) {
    if (e.currentTarget.dataset.lat && e.currentTarget.dataset.lng) {
      wx.navigateTo({
        url: '/pages/map/index?lat=' + e.currentTarget.dataset.lat + '&lng=' + e.currentTarget.dataset.lng,
      });
    }
  },
  
  callPhone: function () {
    wx.makePhoneCall({
      phoneNumber: '4000011139',
    });
  },
 
  toMerchantsList: function () {
    wx.navigateTo({
      url: '/pages/merchantsCanUse/index?id=' + this.data.productId
    });
  },
 
  toComDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    var storeid = e.currentTarget.dataset.storeid;
    wx.navigateTo({
      url: '/pages/comDetail/index?id=' + id + '&storeid=' + storeid
    });
  },
  call: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.store.phone 
    })
  },
  getItemInfo: function () {
    let that = this;
    service.getItemInfo({
      productId: this.data.productId,
      storeId: this.data.storeId
    }).subscribe({
      next: res => {
        var picsStrArr = res.product.picIds.split(',');
        picsStrArr.forEach(function (item, index) {
          picsStrArr[index] = constant.basePicUrl + item + '/resize_751_420/mode_fill'
        });
        new Promise(function (resolve, reject) {
          let str = JSON.parse(res.product.note);
          resolve(str);
        }).then(function (result) {
          that.setData({
            commentList: res.commentList,
            productInfo: res.product,
            description: JSON.parse(res.product.description),
            recommendList: res.recommendList,
            store: res.store,
            commentCount: res.commentCount,
            recommendCount: res.recommendList.length,
            note: result,
            showPics: picsStrArr,
            isShowData: true,
            lat: res.store.lat,
            lng: res.store.lng
          });
          if (that.data.share == 1) {
            that.showShare();
          }
        }).catch(function (err) {
          that.setData({
            commentList: res.commentList,
            productInfo: res.product,
            description: JSON.parse(res.product.description),
            recommendList: res.recommendList,
            store: res.store,
            commentCount: res.commentCount,
            recommendCount: res.recommendList.length,
            showPics: picsStrArr,
            isShowData: true,
            lat: res.store.lat,
            lng: res.store.lng
          });
          if (that.data.share == 1) {
            that.showShare();
          }
        })

      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  desImgLoad: function (event) {
    var arr = this.data.despImgHeightValues;
    arr.push(event.detail.height * 690 / event.detail.width);
    this.setData({
      despImgHeightValues: arr
    });
  },
  gohomepage: function () {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },
  toCommentList: function () {
    wx.navigateTo({
      url: '/pages/commentList/index?id=' + this.data.productId
    });
  },
  share: function () {
    var obj = {
      type: 'SHARE_PRODUCT',
      sharePath: '/pages/index/index'
    };
    service.share(obj).subscribe({
      next: res => {
        
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
 
  onShareAppMessage: function (res) {
    this.share();
    this.setData({ isShowModal: true });
    return {
      title: JSON.parse(wx.getStorageSync('userinfo')).nickName + '分享给您一个心动商品，快来一起体验吧！',
      path: '/pages/login/index?pagetype=1&pid=' + this.data.productId + '&storeid=' + this.data.storeId + '&invitecode=' + wx.getStorageSync('inviteCode')
    }
  },
  toCommentDetail: function (event) {
    wx.navigateTo({
      url: '/pages/commentDetail/index?id=' + event.currentTarget.dataset.comid
    });
  },
  // 点击分享
  showShare: function () {
    service.userInfo({ openId: wx.getStorageSync('openid') }).subscribe({
      next: res => {
        this.setData({
          nickName: res.nickName,
          userImgUrl: res.avatar
        });
        wx.showLoading({ title: '生成分享图片' });
        wx.downloadFile({
          url: constant.basePicUrl + this.data.productInfo.picId + '/resize_750_420/mode_fill',
          success: (res) => {
            if (res.statusCode === 200) {
              this.setData({ headImg: res.tempFilePath });
              wx.downloadFile({
                url: this.data.userImgUrl,
                success: (obj) => {
                  if (obj.statusCode === 200) {
                    this.setData({ userImg: obj.tempFilePath });
                    this.getQrCode();
                  } else {
                    wx.hideLoading();
                  }
                },
                fail: (err) => {
                  console.log('头像下载失败');
                }
              });
            } else {
              wx.hideLoading();
            }
          }
        });
      },
      // error: err => errDialog(err),
      complete: () => { }
    })
  },
  closeModal: function () {
    this.setData({ isShowModal: true });
  },
  getQrCode: function () {
    service.getQrCode({ productId: this.data.productId, path: 'pages/login/index' }).subscribe({
      next: res => {
        var picId = res;
        wx.downloadFile({
          url: constant.basePicUrl + picId + '/resize_200_200/mode_fill',
          success: (res1) => {
            if (res1.statusCode === 200) {
              this.setData({ erwmImg: res1.tempFilePath });
              var info = this.data.productInfo;
              wx.hideLoading();
              var price1 = Number(info.price / 100).toFixed(2) + '元';
              var name = info.productName;
              var price2 = Number(info.originalPrice / 100).toFixed(2) + '元';
              var storeLen = info.productStores.length;
              this.drawImage(info.merchantName, name, '', price1, price2, storeLen);//参数依次是storeName,desc,现价,原价,门店数
              this.setData({ isShowModal: false });
            } else {
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
  drawImage: function (merchant, name, desc, price1, price2, storeLen) {
    var size = { w: 260, h: 424 };
    var context = wx.createCanvasContext('myCanvas');
    context.drawImage(this.data.shareBg, 0, 0, size.w, size.h);
    context.drawImage("../../../images/logo.png", 20, 18, 20, 21);
    setText(context, "“桔”美好生活，集好店优惠", 52, 35, "#000", 15, 'left');
    context.drawImage(this.data.headImg, 10, 52, size.w - 20, 138);
    rectPath(context, 10, 190, size.w - 20, 134);
    setText(context, merchant, 20, 210, "#999", 10, 'left');//商户名
    drawText(context, name, 20, 230, 50, 216);//商品名字
    setText(context, "适用" + storeLen + "家门店", size.w - 20, 210, "#999", 10, 'right');//适用门店

    context.drawImage("../../../images/price.png", 20, 263, 30, 13);
    setText(context, price1, 55, 275, '#E83221', 14, 'left');//价格
    setText(context, "原价:" + price2, size.w - 20, 275, '#999', 10, 'right');//原价

    context.drawImage("../../../images/gou.png", 20, 293, 10, 10);
    setText(context, "可退款", 35, 302, '#999', 9, 'left');
    context.drawImage("../../../images/gou.png", 80, 293, 10, 10);
    setText(context, "可转赠", 95, 302, '#999', 9, 'left');

    rectPath(context, 0, 334, size.w, 88);
    context.drawImage('../../../images/erbg.png', 70, 387, 103, 18);
    setText(context, "长按识别小程序码", 77, 400, '#333', 11, 'left');


    context.save();
    context.beginPath();
    context.arc(35, 375, 25, 0, Math.PI * 2, false);
    context.clip();
    context.drawImage(this.data.userImg, 10, 350, 50, 50);
    context.restore();

    context.drawImage(this.data.erwmImg, size.w - 80, 342.5, 70, 70);
    setText(context, this.data.nickName, 70, 360, "#333", 12, 'left');
    setText(context, "私藏好物，分享给你", 70, 379, '#666', 11, 'left');
    context.draw();
  },
  savePic: function (e) {
    var type = e.currentTarget.dataset.type;
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'myCanvas',
      success: function (res) {
        wx.getSetting({
          success(rep) {
            if (!rep.authSetting['scope.writePhotosAlbum']) {
              wx.authorize({
                scope: 'scope.writePhotosAlbum',
                success() {
                  that.saveAsPhoto(res.tempFilePath, type);
                },
                fail() {
                  wx.openSetting({
                    success: function () {
                      console.log("openSetting: success");
                    },
                    fail: function () {
                      console.log("openSetting: fail");
                    }
                  });
                }
              })
            } else {
              that.saveAsPhoto(res.tempFilePath, type);
            }
          },
          fail() {
            console.log("getSetting: fail");
          }
        })
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },
  saveAsPhoto: function (imgUrl, type) {
    wx.saveImageToPhotosAlbum({
      filePath: imgUrl,
      success: (res) => {
        this.share();//分享获得桔子
        this.closeModal();
        if (type == 1) {
          wx.showToast({
            title: "已保存至相册",
            icon: "success"
          });
        } else {
          errDialog('图文海报已保存到微信本地相册，打开微信发送给朋友吧!');
        }
      },
      fail: function (res) {
        console.log(res);
      }
    })
  }
});

function setText(ctx, str, x, y, color, size, align) {
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

function drawBar(ctx, x1, x2, y) {
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
  if (str.length > 36) {
    var str = str.substring(0, 36) + '...';
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
