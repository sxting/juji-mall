var util = require('../../utils/util.js');
import { service } from '../../service';
import { constant } from '../../utils/constant';
import { errDialog, loading } from '../../utils/util';
var app = getApp();
Page({
  data: {
    productId: '',
    storeId: '',
    showPics: [],
    commentList: [],
    productInfo: {},
    description:[],
    recommendList: [],
    store: {},
    commentCount: 0,
    recommendCount: 0,
    pointBalance: 0,
    note:[],
    despImgHeightValues:[],
    isShowData:false,
    isHiddenClose:false,
    isShowModal:true,
    windowWidth: 345,
    windowHeight: 430,
    shareBg: '../../images/shareBg.png',
    headImg: '../../images/shareMinPro.png',
    erwmImg: '../../images/erwmImg.png',
    sceneId:'',
    isShowNewerGet: false,
    lat:'',
    lng:''
  },
  onLoad: function(option) {
    new app.ToastPannel();
    wx.setNavigationBarTitle({title: '商品详情'});
    console.log(option);
    if (!option.id) {
      if (option.scene) {
        let scene = decodeURIComponent(option.scene);
        this.setData({sceneId: scene});

        wx.request({
          url: constant.apiUrl + '/qr/getBySceneId.json?sceneId='+scene,
          method: 'GET',
          header: {
            'content-type': 'application/json',
          },
          success: (res) => {
              this.setData({
                productId: res.data.data.productId
              });
              if (wx.getStorageSync('token')) {
                console.log('token存在');
                this.getItemInfo();
                //查询用户橘子
                this.getPointBalance();
                //查询新用户见面礼
                service.isNewer().subscribe({
                  next: res2 => {
                    console.log(res2);
                    this.setData({
                      isShowNewerGet: res2
                    });

                  },
                  error: err => console.log(err)
                });

              } else {
                console.log('token不存在');
                //新用户 授权 登录 跳转
                this.mainFnc(option,1);
              }
          }
        });


        // service.getComIdByscence({ sceneId: scene }).subscribe({
        //   next: res => {
        //     this.setData({
        //       productId: res.productId
        //     });
        //     if (wx.getStorageSync('token')) {
        //       console.log('token存在');
        //       this.getItemInfo();
        //       //查询用户橘子
        //       this.getPointBalance();
        //     } else {
        //       console.log('token不存在');
        //       //新用户 授权 登录 跳转
        //       this.mainFnc(option,1);
        //     }
        //   },
        //   error: err => console.log(err),
        //   complete: () => wx.hideToast()
        // });

      }else{
        wx.showToast({
          title: '发生错误，未找到商品id',
          icon: 'none'
        });
        this.gohomepage();
        return;
      }

    }else{
      this.setData({
        productId: option.id,
        storeId: option.storeid
      });

      if (wx.getStorageSync('token')) {
        console.log('token存在');
        this.getItemInfo();
        //查询用户橘子
        this.getPointBalance();
        //查询新用户见面礼
        service.isNewer().subscribe({
          next: res2 => {
            console.log(res2)
            this.setData({
              isShowNewerGet: res2
            });

          },
          error: err => console.log(err)
        });
      } else {
        console.log('token不存在');
        //新用户 授权 登录 跳转
        this.mainFnc(option,2);
      }
    }


  },
  mainFnc: function (option,type){
    let that = this;
    new Promise(function (resolve, reject) {
      console.log('Promise is ready!');
      wx.getSetting({
        success: (res) => {
          console.log(res.authSetting['scope.userInfo']);
          if (!res.authSetting['scope.userInfo']) {
              wx.reLaunch({url: '/pages/login/index?fromPage=comDetail&productId=' + that.data.productId + '&inviteCode=' + option.inviteCode});
          } else { //如果已经授权
            //判断rowData是否存在
            // if (wx.getStorageSync('rawData')) { //如果存在
              resolve();
            // } else { //如果不存在rowData
            //   reject('未获取rawData');
            // }
          }
        }
      });
    }).then(function () {

      return new Promise(function (resolve1, reject1) {
        wx.login({
          success: res => {
            console.log('code: ' + res.code);
            console.log(constant.APPID);
            resolve1(res.code);
          }
        });

      })
    }).then(function (code) {
      if(type==1){
        var requestObj = {
          code: code,
          appId: constant.APPID,
          isMock: false, //测试标记
          sceneId: that.data.sceneId,
          rawData: wx.getStorageSync('rawData')
        }
      }else{
        var requestObj = {
          code: code,
          appId: constant.APPID,
          isMock: false, //测试标记
          inviteCode: option.inviteCode,
          rawData: wx.getStorageSync('rawData')
        }
      }
      wx.request({
        url: constant.apiUrl + '/user/login.json',
        method: 'GET',
        data: requestObj,
        header: {
          'content-type': 'application/json',
        },
        success: (res1) => {
          console.log(res1);

          if (res1.data.errorCode == '200') {
            wx.setStorageSync('token', res1.data.data.token);
            wx.setStorageSync('openid', res1.data.data.openId);
            wx.setStorageSync('inviteCode', res1.data.data.inviteCode);
            wx.setStorageSync('userinfo', JSON.stringify(res1.data.data));

            that.getItemInfo();
            //查询用户橘子
            that.getPointBalance();

          } else {
            wx.showModal({
              title: '错误',
              content: '登录失败，错误码:' + res1.data.errorCode + ' 返回错误: ' + res1.data.errorInfo
            });
          }
        }
      });

    }).catch(function (err) {
      console.log(err);
      wx.showModal({
        title: '错误',
        content: err
      });
    });
  },
  //关闭新用户见面礼
  closeGetNewer: function () {
    this.setData({
      isShowNewerGet: false
    });
  },
  toMap: function(e){
    console.log(e);
    if (e.currentTarget.dataset.lat && e.currentTarget.dataset.lng){
      wx.navigateTo({
        url: '/pages/map/index?lat=' + e.currentTarget.dataset.lat + '&lng=' + e.currentTarget.dataset.lng,
      });
    }
  },
  toBuy:function(){
    if(this.data.productInfo.type=='PRODUCT'&&this.data.productInfo.point>0&&this.data.productInfo.price>0){
      if(this.data.productInfo.price>0&&this.data.pointBalance>=this.data.productInfo.point){
        this.toCreateOrder();
      }else{
        this.toGetPoint();
      }
    }
    if(this.data.productInfo.type=='PRODUCT'&&this.data.productInfo.point==0&&this.data.productInfo.price>0){
      this.toCreateOrderByRmb();
    }
    if(this.data.productInfo.type=='POINT'){
      this.toCreateOrderByPoint();
    }
    if(this.data.pointBalance<this.data.productInfo.point||!this.data.pointBalance){
      this.toGetPoint();
    }
  },
  toPro:function(e){
    wx.navigateTo({
      url: '/pages/jujiGarden/recommend/index?productid='+e.currentTarget.dataset.id
    });
  },
  callPhone: function () {
    wx.makePhoneCall({
      phoneNumber: '4000011139',
    });
  },
  //收集formid做推送
  collectFormIds:function(e){
    console.log(e.detail);
    service.collectFormIds({
      formId: e.detail.formId
    }).subscribe({
      next: res => {
        console.log(res)
      }
    });
  },
  toMerchantsList:function(){
    wx.navigateTo({
      url: '/pages/merchantsCanUse/index?id=' + this.data.productId 
    });
  },
  toCreateOrder: function() { //跳转订单确认 桔子和人民币组合订单
    wx.navigateTo({
      url: '/pages/payOrder/index?paytype=1&id=' + this.data.productId + '&storeid=' + this.data.storeId + '&sceneid='+this.data.sceneid
    });
  },
  toCreateOrderByPoint: function() { //只用桔子下单
    wx.navigateTo({
      url: '/pages/payOrder/index?paytype=2&id=' + this.data.productId + '&storeid=' + this.data.storeId + '&sceneid='+this.data.sceneid
    });
  },
  toCreateOrderByRmb: function () { //人民币优惠购买
    wx.navigateTo({
      url: '/pages/payOrder/index?paytype=3&id=' + this.data.productId + '&storeid=' + this.data.storeId + '&sceneid='+this.data.sceneid
    });
  },
  toCreateOrderByOriPrice: function () { //原价购买
    wx.navigateTo({
      url: '/pages/payOrder/index?paytype=4&id=' + this.data.productId + '&storeid=' + this.data.storeId + '&sceneid='+this.data.sceneid
    });
  },
  toGetPoint: function() { //跳转到任务页面赚桔子
    wx.switchTab({
      url: '../juzi/index'
    });
  },
  getPointBalance: function() {

    service.getPointBalance().subscribe({
      next: res => {
        console.log('--------查询桔子余额-------');
        console.log(res);
        this.setData({
          pointBalance: res
        });
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  toComDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    var storeid = e.currentTarget.dataset.storeid;
    console.log(id);
    wx.navigateTo({
      url: '/pages/comDetail/index?id=' + id + '&storeid=' + storeid
    });
  },
  onShow: function() {
    //评论列表
  },
  call: function() {
    wx.makePhoneCall({
      phoneNumber: this.data.store.phone // 仅为示例，并非真实的电话号码
    })
  },
  getItemInfo: function() {
    let that = this;
    service.getItemInfo({
      productId: this.data.productId,
      storeId: this.data.storeId
    }).subscribe({
      next: res => {
        console.log(res);
        var picsStrArr = res.product.picIds.split(',');
        picsStrArr.forEach(function(item,index){
          picsStrArr[index] = constant.basePicUrl + item + '/resize_751_420/mode_fill'
        });
        new Promise(function(resolve,reject){
          let str = JSON.parse(res.product.note);
          resolve(str);
        }).then(function(result){
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
        }).catch(function(err){
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
        })
        
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  desImgLoad: function (event){
    console.log(event.detail);
    var arr = this.data.despImgHeightValues;
    arr.push(event.detail.height * 690 / event.detail.width);
    this.setData({
      despImgHeightValues: arr
    });
  },
  gohomepage: function() {
    wx.switchTab({
      url: '/pages/index/index'
    });
    //getCurrentPages() 函数用于获取当前页面栈的实例，以数组形式按栈的顺序给出，第一个元素为首页，最后一个元素为当前页面
    // wx.navigateBack({
    //   delta: getCurrentPages().length,
    //   url: '/pages/index/index'
    // });
  },
  toCommentList: function() {
    wx.navigateTo({
      url: '/pages/commentList/index?id=' + this.data.productId
    });
  },
  toShareCard: function() {
    wx.navigateTo({
      url: '/pages/shareCard/index?merchantId=' + this.data.merchantId
    });
  },
  share: function (){
    var obj = {
      type:'SHARE_PRODUCT',
      sharePath: '/pages/index/index'
    };
    service.share(obj).subscribe({
      next: res=>{
        console.log('---------分享返回--------');
        console.log(res);
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  /**
   * 用户点击右上角分享或页面中的分享
   */
  onShareAppMessage: function(res) {
    this.share();
    this.setData({ isShowModal: true });
    return {
      title: JSON.parse(wx.getStorageSync('userinfo')).nickName+'分享给您一个心动商品，快来一起体验吧！',
      path: '/pages/comDetail/index?id=' + this.data.productId + '&storeid=' + this.data.storeId + '&inviteCode=' + wx.getStorageSync('inviteCode'),
      // imageUrl:constant.basePicUrl+this.data.productInfo.picId+'/resize_360_360/mode_fill'
    }
  },
  toCommentDetail: function(event) {
    wx.navigateTo({
      url: '/pages/commentDetail/index?id=' + event.currentTarget.dataset.comid
    });
  },

  // 点击分享
  showShare:function(){
    wx.showLoading({title: '生成图片...'});
    wx.downloadFile({
      url: constant.basePicUrl+this.data.productInfo.picId+'/resize_751_420/mode_fill',
      success: (res) => {
        if (res.statusCode === 200) {
            this.setData({headImg:res.tempFilePath});
            this.getQrCode();
        }else{
          wx.hideLoading();
        }
      }
    });
  },
  closeModal:function(){
      this.setData({isShowModal:true});
  },
  getQrCode: function() {
      service.getQrCode({ productId:this.data.productId,path: 'pages/comDetail/index'}).subscribe({
          next: res => {
            var picId = res;
            wx.downloadFile({
              url: constant.basePicUrl+picId+'/resize_200_200/mode_fill',
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
      size.w = 256;
      size.h = 424;
      return size;
  },
  setTitle: function(context,name) {
      context.setFontSize(12);
      context.setTextAlign("left");
      context.setFillStyle("#333");
      context.fillText(name, 20, 210);
      context.stroke();

      context.setFontSize(15);
      context.setTextAlign("left");
      context.setFillStyle("#000");
      context.fillText("“桔”美好生活，集好店优惠", 40, 35);
      context.stroke();
  },
  setText2: function(context,price1,price2) {
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
  setText3: function(context,amount) {
      var size = this.setCanvasSize();
      context.setFontSize(10);
      context.setTextAlign("right");
      context.setFillStyle("#999999");
      context.fillText("销量:" + amount, size.w-20, 262);
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
  drawImage: function(name, desc,price1,price2,amount) {//name,desc,现价,原价,销量
      var size = this.setCanvasSize();
      var context = wx.createCanvasContext('myCanvas');
      context.drawImage(this.data.shareBg, 0, 0, size.w, size.h); //宽度70，居中，距离上15
      context.drawImage("../../images/logo.png", 20, 18, 20, 21); //宽度70，居中，距离上15
      context.drawImage(this.data.headImg, 10, 52, size.w - 20,138); //宽度70，居中，距离上15
      rectPath(context, 10, 190, size.w-20, 219);
      context.drawImage(this.data.erwmImg, size.w/2 - 40, 292.5, 80, 80); //二维码，宽度100，居中
      this.setTitle(context,name);
      context.drawImage("../../images/price.png", 20, 224, 30,13); //宽度70，居中，距离上15
      context.drawImage("../../images/gou.png", 20, 252.5, 10,10); //宽度70，居中，距离上15
      context.drawImage("../../images/gou.png", 80, 252.5, 10,10); //宽度70，居中，距离上15
      this.setText5(context);
      drawDashLine(context, 15, 280, size.w-15, 280, 4);//横向虚线
      this.setText2(context,price1,price2);
      this.setText3(context,amount);
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
});

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

function drawDashLine(ctx, x1, y1, x2, y2, dashLength){  //传context对象，始点x和y坐标，终点x和y坐标，虚线长度
  ctx.beginPath();
  ctx.setStrokeStyle("#eeeeee")//设置线条的颜色
  ctx.setLineWidth(1)//设置线条宽度
  var dashLen = dashLength === undefined ? 3 : dashLength,
  xpos = x2 - x1, //得到横向的宽度;
  ypos = y2 - y1, //得到纵向的高度;
  numDashes = Math.floor(Math.sqrt(xpos * xpos + ypos * ypos) / dashLen);
  for(var i=0; i<numDashes; i++){
     if(i % 2 === 0){
         ctx.moveTo(x1 + (xpos/numDashes) * i, y1 + (ypos/numDashes) * i);
      }else{
          ctx.lineTo(x1 + (xpos/numDashes) * i, y1 + (ypos/numDashes) * i);
      }
   }
  ctx.stroke();
}