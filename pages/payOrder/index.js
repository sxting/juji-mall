import {
  service
} from '../../service';
import {
  constant
} from '../../utils/constant';
var app = getApp();
Page({
  data: {
    productId: '',
    storeId: '',
    store: {},
    productInfo: {},
    point: 0,
    count: 1,
    price: 0,
    paytype: 1,
    pointBalance: 0
  },
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '订单确认',
    });
    if (options.id && options.storeid && options.paytype) {
      this.setData({
        productId: options.id,
        storeId: options.storeid,
        paytype: options.paytype
      });
      this.getItemInfo();
      //查询用户橘子
      this.getPointBalance();
    } else {
      wx.showToast({
        title: '当前商品错误，原因 id=' + options.id + ' storeid=' + options.storeid + ' paytype=' + options.paytype,
        icon: 'none',
        duration: 2000
      });
      wx.navigateBack({
        delta: 1
      });
    }

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
  getItemInfo: function() {
    service.getItemInfo({
      productId: this.data.productId,
      storeId: this.data.storeId
    }).subscribe({
      next: res => {
        console.log(res);
        this.setData({
          productInfo: res.product,
          store: res.store,
          price: res.product.price,
          point: res.product.point
        });
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  delNumber: function() {
    var thisNum = this.data.count - 1;
    if (thisNum <= 0) {
      return;
    }
    this.setData({
      count: thisNum
    });
  },
  addNumber: function() {
    var thisNum = this.data.count + 1;
    this.setData({
      count: thisNum
    });
  },
  saveOrder:function(obj){
    service.saveOrder(obj).subscribe({
      next: res => {
        console.log('--------创建订单返回-------');
        console.log(res);
      },
      error: err => console.log(err)
    });
  },
  toPay: function() {
    var that = this;
    if (this.data.count > this.data.productInfo.limitPerOrderNum) {
      wx.showToast({
        title: '该商品每日限购' + this.data.productInfo.limitPerOrderNum + '件，请重新选择数量',
        icon: 'none',
        duration: 2000
      });
    }
    if (this.data.paytype == 1) {
      service.getPre({
        productId: this.data.productId
      }).subscribe({
        next: res => {
          console.log('--------下单前数据校验1-------');
          console.log(res);
          if (res.pointBalance > this.data.product.point) {
            //创建订单
            var orderObj = {
              itemRequests: [{
                merchantId: that.data.productInfo.merchantId,
                merchantName: that.data.productInfo.merchantName,
                num: that.data.count,
                originalPrice: that.data.productInfo.originalPrice,
                payAmount: that.data.productInfo.price * that.data.count,
                payPoint: that.data.productInfo.point * that.data.count,
                picId: that.data.productInfo.picId,
                point: that.data.productInfo.point,
                price: that.data.productInfo.price,
                productId: that.data.productInfo.productId,
                productName: that.data.productInfo.productName,
                type: that.data.productInfo.type
              }],
              openId: wx.getStorageSync('openid'),
              originAmount: that.data.productInfo.originalPrice * that.data.count,
              payAmount: that.data.productInfo.price * that.data.count,
              payPoint: that.data.productInfo.point * that.data.count,
              payType: 'MIX',
              providerId: that.data.productInfo.providerId,
              providerName: that.data.productInfo.providerName
            };
            service.saveOrder(orderObj).subscribe({
              next: res1 => {
                console.log('--------创建订单返回1-------');
                console.log(res1);
              },
              error: err => console.log(err)
            });
          } else {
            wx.showToast({
              title: '当前桔子余额不足，请多赚些桔子吧',
              icon: 'none',
              duration: 2000
            });
          }
        },
        error: err => console.log(err)
      })
    } else if (this.data.paytype == 2) {
      service.getPre({
        productId: this.data.productId
      }).subscribe({
        next: res => {
          console.log('--------下单前数据校验2-------');
          console.log(res);
          if (res.pointBalance > this.data.product.point) {
            //创建订单
            var orderObj = {
              itemRequests: [{
                merchantId: that.data.productInfo.merchantId,
                merchantName: that.data.productInfo.merchantName,
                num: that.data.count,
                originalPrice: that.data.productInfo.originalPrice,
                payAmount: 0,
                payPoint: that.data.productInfo.point * that.data.count,
                picId: that.data.productInfo.picId,
                point: that.data.productInfo.point,
                price: that.data.productInfo.price,
                productId: that.data.productInfo.productId,
                productName: that.data.productInfo.productName,
                type: that.data.productInfo.type
              }],
              openId: wx.getStorageSync('openid'),
              originAmount: that.data.productInfo.originalPrice * that.data.count,
              payAmount: 0,
              payPoint: that.data.productInfo.point * that.data.count,
              payType: 'POINT',
              providerId: that.data.productInfo.providerId,
              providerName: that.data.productInfo.providerName
            };
            service.saveOrder(orderObj).subscribe({
              next: res1 => {
                console.log('--------创建订单返回2-------');
                console.log(res1);
              },
              error: err => console.log(err)
            });
          } else {
            wx.showToast({
              title: '当前桔子余额不足，请多赚些桔子吧',
              icon: 'none',
              duration: 2000
            });
          }
        },
        error: err => console.log(err)
      })
    } else {
      service.getPre({
        productId: this.data.productId
      }).subscribe({
        next: res => {
          console.log('--------下单前数据校验3-------');
          console.log(res);

          // if (res.totalAll+this.data.count > this.data.productInfo.limitMaxNum) {
          //   if (res.totalToday+this.data.count > this.data.productInfo.limitPerDayNum) {
          //创建订单
          var orderObj = {
            itemRequests: [{
              merchantId: that.data.productInfo.merchantId,
              merchantName: that.data.productInfo.merchantName,
              num: that.data.count,
              originalPrice: that.data.productInfo.originalPrice,
              payAmount: that.data.productInfo.price * that.data.count,
              payPoint: 0,
              picId: that.data.productInfo.picId,
              point: that.data.productInfo.point,
              price: that.data.productInfo.price,
              productId: that.data.productInfo.productId,
              productName: that.data.productInfo.productName,
              type: that.data.productInfo.type
            }],
            openId: wx.getStorageSync('openid'),
            originAmount: that.data.productInfo.originalPrice * that.data.count,
            payAmount: that.data.productInfo.price * that.data.count,
            payPoint: 0,
            payType: 'WECHAT',
            providerId: that.data.productInfo.providerId,
            providerName: that.data.productInfo.providerName
          };
          service.saveOrder(orderObj).subscribe({
            next: res1 => {
              console.log('--------创建订单返回3-------');
              console.log(res1);
              var payInfo = JSON.parse(res1.payInfo);
              wx.requestPayment({
                timeStamp: payInfo.timeStamp,
                nonceStr: payInfo.nonceStr,
                package: payInfo.package,
                signType: payInfo.signType,
                paySign: payInfo.paySign,
                success(res2) {
                  console.log(res2);
                  wx.navigateTo({
                    url: '/pages/orderDetail/index?id='+res1.orderId,
                  })
                },
                fail(res2) {
                  console.log(res2);
                  if (res2.errMsg =='requestPayment:fail cancel'){
                    wx.showToast({
                      title: '用户取消支付',
                      icon: 'none'
                    })
                  }
                  
                }
              });
            },
            error: err => console.log(err)
          });

          


          //   } else {
          //     wx.showToast({
          //       title: '该商品今日还能购买'+(this.data.limitPerDayNum-res.totalToday)+'件，请重新选择数量',
          //       icon: 'none',
          //       duration: 2000
          //     });
          //   }
          // } else {
          //   wx.showToast({
          //     title: '还能购买'+(this.data.productInfo.limitMaxNum-res.totalAll)+'件，请重新选择数量',
          //     icon: 'none',
          //     duration: 2000
          //   });
          // }
        },
        error: err => console.log(err)
      })
    }

  }
});