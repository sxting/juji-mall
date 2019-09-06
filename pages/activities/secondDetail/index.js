var util = require('../../../utils/util.js');
import { service } from '../../../service';
import { activitiesService } from '../shared/service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
var NP = require('../../../utils/number-precision.js');
var app = getApp();
Page({
    data: {
        nvabarData: {showCapsule: 1,title: '商品详情'},
        activityId:'',
        productId: '',
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
        activityStatus: '',
        despImgHeightValues: [],
        isShowData: false,
        storeInfo: {},
        resData: '',
        ruleInfo: {},
        productProgress: 0,
        remind: false,
        productSkus:[],
        defaultSku:{},
        ruleMaps:{},
        curSkuId:'',
        curSkuMajorId:'',
        isShowSelect:false,
        inviteCode:'',
        isBack: false,
        isShowModal:true,
        shareType:1,
        phone:'',
        shareBg: '/images/shareBg.png',
        headImg: '',
        erwmImg: '',
        userImg:'',
        sceneId:'',
        isShowProfit:true,
        userImgUrl:'/images/shareBg.png',
        nickName:'',
    },
    showModal:function(){
        this.setData({isShowModal:false});
    },
    closeModal:function(){
        this.setData({isShowModal:true});
    },
    showTips1:function(){
        errDialog("请先保存图片后将图片发给要分享的好友");
    },
    onLoad: function(options) {
        const updateManager = wx.getUpdateManager();
        updateManager.onUpdateReady(function() {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success(res) {
                    if (res.confirm) {
                        updateManager.applyUpdate()
                    }
                }
            })
        });

        var shareType = wx.getStorageSync('shareType');
        this.setData({shareType:shareType==1});

        var inviteCode = wx.getStorageSync('inviteCode');
        this.setData({
            productId: options.id,
            activityId: options.activityId,
            inviteCode: options.invitecode?options.invitecode:inviteCode
        });
        var phone = JSON.parse(wx.getStorageSync('userinfo')).phone;
        console.log(phone);
        this.setData({phone:phone});
        // 查询商品详情
        this.getData();
    },
    onHide: function() {
        this.setData({ isBack: true });
    },
    onShow: function() {
        this.setData({isShowSelect:false});
        if (this.data.isBack) {
            this.getData(); // 返回刷新
        }
    },
    collectFormIds: function(e) {
        service.collectFormIds({
            formId: e.detail.formId
        }).subscribe({
            next: res => {console.log(res)}
        });
    },
    onShareAppMessage: function(res) {
        var picId = this.data.resData.cover;
        var productName = this.data.resData.productName;
        var price = Number(this.data.resData.activityPrice / 100).toFixed(2);
        var shareTxt = this.data.productInfo.shareText;
        var shareImg = this.data.productInfo.shareImg;
        return {
            title: shareTxt?shareTxt:price + '元秒杀'+productName+'，手慢无！',
            path: '/pages/login/index?pagetype=6&pid='+this.data.productId+'&activityId=' + this.data.activityId + '&invitecode=' + wx.getStorageSync('inviteCode'),
            imageUrl:constant.basePicUrl + (shareImg?shareImg:this.data.resData.cover) + '/resize_560_420/mode_fill'
        }
    },
    previewImage: function(e) {
        var arr = [];
        var url = constant.basePicUrl + e.currentTarget.dataset.url + '/resize_750_0/mode_fill';
        arr.push(url);
        wx.previewImage({urls: arr});
    },
    toMap: function(e) {
        wx.openLocation({
            latitude: this.data.store.lat,
            longitude: this.data.store.lng,
            name: this.data.store.name,
            address: this.data.store.address,
            scale: 15
        });
    },
    toMerchantsList: function() {
        wx.navigateTo({
            url: '/pages/merchantsCanUse/index?id=' + this.data.productId
        });
    },
    toComDetail: function(e) {
        var id = e.currentTarget.dataset.id;
        var storeid = e.currentTarget.dataset.storeid;
        wx.navigateTo({
            url: '/pages/comDetail/index?id=' + id + '&storeid=' + storeid
        });
    },
    call: function() {
        wx.makePhoneCall({
            phoneNumber: this.data.store.phone
        })
    },
    desImgLoad: function(e) {
        var arr = this.data.despImgHeightValues;
        arr.push(e.detail.height * 690 / e.detail.width);
        this.setData({
            despImgHeightValues: arr
        });
    },
    toIndex: function() {
        wx.switchTab({
            url: '/pages/index/index'
        });
    },
    toCommentList: function() {
        wx.navigateTo({
            url: '/pages/commentList/index?id=' + this.data.productId
        });
    },
    getData: function() {
        activitiesService.activity({
            activityId: this.data.activityId,
            activityType: 'SEC_KILL'
        }).subscribe({
            next: res => {
                this.setData({showCom: true});
                var picsStrArr = res.cover.split(',');
                picsStrArr.forEach(function(item, index) {
                    picsStrArr[index] = constant.basePicUrl + item + '/resize_751_420/mode_fill';
                });
                this.setData({
                    commentList: res.product.commentList,
                    productInfo: res.product.product,
                    description: JSON.parse(res.product.product.description),
                    recommendList: res.product.recommendList,
                    store: res.product.store,
                    commentCount: res.product.commentCount,
                    recommendCount: res.product.recommendList.length,
                    note: JSON.parse(res.product.product.note),
                    showPics: picsStrArr,
                    isShowData: true,
                    remind: res.isRemind,
                    resData: res,
                    activityStatus:res.activityStatus,
                    ruleMaps:res.ruleMaps,
                    productSkus:res.product.product.productSkus,
                    curSkuId:res.product.product.defaultSku.skuId,
                    curSkuMajorId:res.product.product.defaultSku.id
                });
                this.setData({ 
                    productProgress: Math.round(100 - (res.balanceStock * 100) / res.activityStock)
                });
                var skuObj = this.data.ruleMaps[this.data.curSkuId];
                this.setData({ defaultSku:skuObj[0]});
                console.log("获取默认规格");
                console.log(this.data.defaultSku);
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    toSecondKill: function() {
        if(Object.keys(this.data.productSkus).length>1){
            this.toggleSelect();
        }else{
            this.okSelect();
        }
    },
    toggleSelect:function(){
      this.setData({isShowSelect:!this.data.isShowSelect});
    },
    selectType:function(e){
        if(e.currentTarget.dataset.stock==0){return;}
        this.setData({curSkuId:e.currentTarget.dataset.skuid,curSkuMajorId:e.currentTarget.dataset.id});
        var skuObj = this.data.ruleMaps[this.data.curSkuId];
        this.setData({ defaultSku:skuObj[0]});
    },
    okSelect:function(){
        if(this.data.defaultSku.balanceStock==0){errDialog("此规格库存不足");return};

        wx.getSetting({
            success: (res) => {
                if (res.authSetting['scope.userInfo']) {
                    wx.navigateTo({
                        url: '/pages/payOrder/index?paytype=7&orderType=SEC_KILL&id=' + this.data.productId + '&activityId=' + this.data.activityId + '&splicedRuleId=' + this.data.defaultSku.secKillRuleId + '&skuId=' + this.data.curSkuId + '&smId=' + this.data.curSkuMajorId + '&inviteCode=' + this.data.inviteCode
                    }); 
                } else {
                    wx.navigateTo({
                        url: '/pages/authorize/index?pagetype=1&paytype=7&orderType=SEC_KILL&id=' + this.data.productId + '&activityId=' + this.data.activityId + '&splicedRuleId=' + this.data.defaultSku.secKillRuleId + '&skuId=' + this.data.curSkuId + '&smId=' + this.data.curSkuMajorId + '&inviteCode=' + this.data.inviteCode
                    });
                }
            }
        }); 
    },
    toRemainMe: function(e) {
        let data = { encryptData: e.detail.encryptedData, iv: e.detail.iv }
        service.decodeUserPhone(data).subscribe({
            next: res => {
                this.bindPhone(res.phoneNumber);
                this.bindPhone(); //授权以后绑定手机号码
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },
    bindPhone:function (phone) {
        service.bindPhone({ phone: phone }).subscribe({
            next: res => {
                this.remainUser()
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },
    remainUser:function(){
        activitiesService.remind({
            activityId: this.data.activityId
        }).subscribe({
            next: res => {
                this.setData({ remind: true })
                wx.showToast({title: "提醒成功",icon: "success"});
            },
            error: err => {
                wx.showToast({ title: err });
            },
            complete: () => wx.hideToast()
        });
    },
  showShareModal:function(){
    wx.reportAnalytics('detail_ue', {ue: '保存推广图片'});
    console.log('生成分享图片');
    console.log(constant.basePicUrl + this.data.productInfo.picId +'/resize_750_420/mode_filt/format_jpg/quality_70');
    service.userInfo({ openId: wx.getStorageSync('openid') }).subscribe({
        next: res => {
            this.setData({
                nickName: res.nickName,
                userImgUrl: res.avatar
            });
            wx.showLoading({title: '生成分享图片'});
            wx.downloadFile({
              url: constant.basePicUrl + this.data.productInfo.picId +'/resize_750_420/mode_filt/format_jpg/quality_70',
              success: (res) => {
                if (res.statusCode === 200) {
                    this.setData({headImg:res.tempFilePath});
                    console.log(this.data.userImgUrl);
                    wx.downloadFile({
                      url: this.data.userImgUrl,
                      success: (obj) => {
                        if (obj.statusCode === 200) {
                          this.setData({userImg:obj.tempFilePath});
                          this.getQrCode();
                        }else{
                          wx.hideLoading();
                        }
                      },
                      fail:(err)=>{
                          console.log('头像下载失败');
                      }
                    });
                }else{
                  wx.hideLoading();
                }
              }
            });
        },
        // error: err => errDialog(err),
        complete: () => {}
    })
  },
  saveShareImage:function(){
    this.showShareModal();
  },
  toggleSelect:function(){
    if(this.data.productSkus.length>1){
      this.setData({isShowSelect:!this.data.isShowSelect});
    }else{
      console.log("下单页面");
      this.okSelect();
    }
  },
  // 点击分享
  showShare:function(){
    this.setData({isShowModal:false});
    this.setData({isShowCanvas:true});
  },
  closeModal:function(){
      this.setData({isShowModal:true});
  },
  getQrCode: function() {
      service.getQrCode({ productId:this.data.productId,path: 'pages/login/index'}).subscribe({
          next: res => {
            var picId = res;
            wx.downloadFile({
              url: constant.basePicUrl + picId +'/resize_200_200/mode_filt/format_jpg/quality_0',
              success: (res1) => {
                if (res1.statusCode === 200) {
                    this.setData({erwmImg:res1.tempFilePath});
                    var info = this.data.productInfo;
                    var point = info.point==null||info.point==0?'':info.point+'桔子';
                    var price = info.price==null||info.price==0?'':Number(info.price/100).toFixed(2)+'元';
                    var link = (info.price!=null&&info.price!=0)&&(info.point!=null&&info.point!=0)?'+':'';
                    var price1 = point + link + price;
                    var name = info.productName;
                    var price2 = Number(info.originalPrice / 100).toFixed(2) + '元';
                    var storeLen = info.productStores.length;
                    this.setData({isShowCanvas:false});
                    this.drawImage(info.merchantName,name,'',price1,price2,storeLen);//参数依次是storeName,desc,现价,原价,门店数
                    this.setData({isShowModal:false});
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
  drawImage: function(merchant,name,desc,price1,price2,storeLen) {
      var size = {w:260,h:424};
      var context = wx.createCanvasContext('myCanvas');
      context.drawImage(this.data.shareBg, 0, 0, size.w, size.h);
      context.drawImage("/images/logo.png", 20, 18, 20, 21);
      setText(context,"“桔”美好生活，集好店优惠", 52, 35,"#000",15,'left');
      context.drawImage(this.data.headImg, 10, 52, size.w - 20,138);
      rectPath(context, 10, 190, size.w-20, 134);
      setText(context,merchant, 20, 210,"#999",10,'left');//商户名
      drawText(context,name,20,230,50,216);//商品名字
      setText(context,"适用"+storeLen+"家门店", size.w - 20, 210,"#999",10,'right');//适用门店

      context.drawImage("/images/price.png", 20, 263, 30,13);
      setText(context,price1, 55, 275,'#E83221',14,'left');//价格
      setText(context,"原价:" + price2, size.w - 20, 275,'#999',10,'right');//原价

      context.drawImage("/images/gou.png", 20, 293, 10,10);
      setText(context,"可退款", 35, 302,'#999',9,'left');
      context.drawImage("/images/gou.png", 80, 293, 10,10);
      setText(context,"可转赠", 95, 302,'#999',9,'left');

      rectPath(context, 0, 334, size.w, 88);
      context.drawImage('/images/erbg.png', 70, 387, 103, 18);
      setText(context,"长按识别小程序码", 77, 400,'#333',11,'left');

      context.save();
      context.beginPath();
      context.arc(35, 375, 25, 0, Math.PI * 2, false);
      context.clip();
      context.drawImage(this.data.userImg, 10, 350, 50, 50);
      context.restore();

      context.drawImage(this.data.erwmImg, size.w - 80, 342.5, 70, 70);
      var name = this.data.nickName;
      var nickName = name.length>8?name.substring(0,8)+'...':name;
      setText(context,nickName, 70, 360,"#333",12,'left');
      setText(context,"私藏好物，分享给你", 70, 379,'#666',11,'left');
      context.draw(true,()=>{
        wx.hideLoading();
        this.savePic();
      });
  },
  savePic: function(e) {
      var that = this;
      wx.canvasToTempFilePath({
          canvasId: 'myCanvas',
          success: function(res) {
              wx.getSetting({
                  success(rep) {
                      if (!rep.authSetting['scope.writePhotosAlbum']) {
                          wx.authorize({
                              scope: 'scope.writePhotosAlbum',
                              success() {
                                  that.saveAsPhoto(res.tempFilePath);
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
                          that.saveAsPhoto(res.tempFilePath);
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
          },
          fail: function(res) {
              console.log(res);
          }
      })
  }
});

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


function getObjById(arr,id){
  for(var i=0;i<arr.length;i++){
    if(arr[i].skuId == id){
      return arr[i];
    }
  }
}