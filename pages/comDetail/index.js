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
    erwmImg: '../../images/erwmImg.png'

  },
  onLoad: function(option) {
    new app.ToastPannel();
    wx.setNavigationBarTitle({
      title: '商品详情'
    });
    console.log(option);
    if (!option.id) {
      wx.showToast({
        title: '发生错误，未找到商品id',
        icon: 'none'
      });
      wx.navigateTo({
        url: '/pages/index/index',
      })
      return ;
    }
    let lat = wx.getStorageSync('curLatitude');
    let lng = wx.getStorageSync('curLongitude');
    this.setData({
      productId: option.id,
      storeId: option.storeid
    });
    let that = this;
    if(wx.getStorageSync('token')){
      console.log('token存在');
      this.getItemInfo();
      //查询用户橘子
      this.getPointBalance();
    }else{
      console.log('token不存在');
      //新用户 授权 登录 跳转
      // wx.switchTab({
      //   url: '/pages/index/index',
      // });

      new Promise(function (resolve, reject) {
        console.log('Promise is ready!');
        wx.getSetting({
          success: (res) => {
            console.log(res.authSetting['scope.userInfo']);
            if (!res.authSetting['scope.userInfo']) {
              wx.reLaunch({
                url: '/pages/login/index?fromPage=comDetail&productId=' + that.data.productId + '&inviteCode=' + option.inviteCode
              });
            } else { //如果已经授权
              //判断rowData是否存在
              if (wx.getStorageSync('rawData')) { //如果存在
                resolve();
              } else { //如果不存在rowData
                reject('未获取rawData');
              }
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

          wx.request({
            url: 'https://c.juniuo.com/shopping/user/login.json',
            method: 'GET',
            data: {
              code: code,
              appId: constant.APPID,
              isMock: false, //测试标记
              inviteCode: option.inviteCode,
              rawData: wx.getStorageSync('rawData')
            },
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

    }

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
      url: '/pages/payOrder/index?paytype=1&id=' + this.data.productId + '&storeid=' + this.data.storeId
    });
  },
  toCreateOrderByPoint: function() { //只用桔子下单
    wx.navigateTo({
      url: '/pages/payOrder/index?paytype=2&id=' + this.data.productId + '&storeid=' + this.data.storeId
    });
  },
  toCreateOrderByRmb: function () { //人民币优惠购买
    wx.navigateTo({
      url: '/pages/payOrder/index?paytype=3&id=' + this.data.productId + '&storeid=' + this.data.storeId
    });
  },
  toCreateOrderByOriPrice: function () { //原价购买
    wx.navigateTo({
      url: '/pages/payOrder/index?paytype=4&id=' + this.data.productId + '&storeid=' + this.data.storeId
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
          picsStrArr[index] = constant.basePicUrl + item + '/resize_690_420/mode_fill'
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
            isShowData: true
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
            isShowData: true
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
      type:'SHARE_PROGRAM',
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
    return {
      title: JSON.parse(wx.getStorageSync('userinfo')).nickName+'分享给您一个心动商品，快来一起体验吧！',
      path: '/pages/comDetail/index?id=' + this.data.productId + '&storeid=' + this.data.storeId + '&inviteCode=' + wx.getStorageSync('inviteCode'),
      imageUrl:constant.basePicUrl+this.data.productInfo.picId+'/resize_360_360/mode_fill',
      success: (res) => {
          this.share();
      },
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
      url: constant.basePicUrl+this.data.productInfo.picId+'/resize_240_240/mode_fill',
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

function drawDashLine(ctx, x1, y1, x2, y2, dashLength){  //传context对象，始点x和y坐标，终点x和y坐标，虚线长度
  ctx.setStrokeStyle("#eeeeee")//设置线条的颜色
  ctx.setLineWidth(1)//设置线条宽度
  var dashLen = dashLength === undefined ? 3 : dashLength,
  xpos = x2 - x1, //得到横向的宽度;
  ypos = y2 - y1, //得到纵向的高度;
  numDashes = Math.floor(Math.sqrt(xpos * xpos + ypos * ypos) / dashLen); 
  //利用正切获取斜边的长度除以虚线长度，得到要分为多少段;
  for(var i=0; i<numDashes; i++){
     if(i % 2 === 0){
         ctx.moveTo(x1 + (xpos/numDashes) * i, y1 + (ypos/numDashes) * i); 
         //有了横向宽度和多少段，得出每一段是多长，起点 + 每段长度 * i = 要绘制的起点；
      }else{
          ctx.lineTo(x1 + (xpos/numDashes) * i, y1 + (ypos/numDashes) * i);
      }
   }
  ctx.stroke();
}