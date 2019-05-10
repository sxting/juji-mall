import {service} from '../../service';
import {constant} from '../../utils/constant';
import { errDialog, loading, showAlert } from '../../utils/util'
var app = getApp();

Page({
  data: {
    nvabarData: {showCapsule: 1,title: '订单确认'},
    productId: '',
    storeId: '',
    store: {},
    productInfo: {},
    point: 0,
    count: 1,
    price: 0,
    paytype: 1,
    sceneId:"",
    pointBalance: 0,
    alreadyPay: false,
    showProduct:false,
    activityId: '', //拼团或者砍价的活动id
    activityOrderId: '',//拼团或者砍价活动订单id
    type: '',//场景类型
    kanjiaData: '',
    splicedRuleId: '',
    orderBizType:'NORMAL'
  },
  onLoad: function(options) {
    console.log("确认订单页面");
    console.log(options);
    if(options.orderType){
      this.setData({orderBizType:options.orderType});
    }
    wx.setNavigationBarTitle({title: '订单确认'});
    wx.hideShareMenu();
    console.log(options);
    if (options.resData) {
      this.setData({
        kanjiaData: JSON.parse(options.resData)
      })
    }
    if (options.id && options.paytype) {
      this.setData({
        productId: options.id ? options.id : '',
        storeId: options.storeid ? options.storeid: '',
        paytype: options.paytype,
        sceneId: options.sceneid?options.sceneid:''
      });
    }
    if(options.type){
        this.setData({
          type: options.type
        })
    }
    this.setData({
      activityOrderId: options.activityOrderId ? options.activityOrderId : ''
    })
    if(options.activityId){
        this.setData({
          activityId: options.activityId,
          splicedRuleId: options.splicedRuleId ? options.splicedRuleId : ''
        })
      this.getActivityInfo();
    }else{
      this.getItemInfo();
    }

    //查询用户橘子
    this.getPointBalance();
  },
  //收集formid做推送
  collectFormIds: function (e) {
    console.log(e.detail);
    service.collectFormIds({
      formId: e.detail.formId
    }).subscribe({
      next: res => {
        console.log(res)
      }
    });
  },
  toMyOrder: function() {
    wx.redirectTo({
      url: '/pages/orderlist/index?index=1&status=CREATED'
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
  getActivityInfo:function(){
    service.activity({
      activityId: this.data.activityId,
      activityOrderId: this.data.activityOrderId,
      activityType: this.data.orderBizType,
      progressId: ''
    }).subscribe({
      next: res => {
        console.log(res);
        this.setData({
          productInfo: res.product.product,
          store: res.product.store,
          price: res.activityPrice,
          point: '',
          showProduct: true,
          kanjiaData: res
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
          point: res.product.point,
          showProduct: true
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
  saveOrder: function(obj) {
    service.saveOrder(obj).subscribe({
      next: res => {
        console.log('--------创建订单返回-------');
        console.log(res);
      },
      error: err => console.log(err)
    });
  },
  toPay: function(e) {
    console.log('-------点击测试-------');
    var that = this;
    console.log('是否支付'+that.data.alreadyPay);
    if (that.data.alreadyPay) {
      return;
    } else {
      that.setData({
        alreadyPay : true
      });
    }
    if (that.data.paytype == 1) { //混合支付
      service.getPre({
        productId: that.data.productId
      }).subscribe({
        next: res => {
          console.log('--------下单前数据校验1混合支付-------');
          console.log(res);
          if (res.pointBalance >= that.data.productInfo.point * that.data.count) {
            //判断条件 如果：过往已经购买的数量 + 要买的数量 > 限制购买的最大数量 处理：禁止下单
            if (res.totalAll + that.data.count <= that.data.productInfo.limitMaxNum) {
              //判断条件 如果：今日已经购买的数量 + 要买的数量 > 今日限制购买的最大数量 处理：禁止下单
              if (res.totalToday + that.data.count <= that.data.productInfo.limitPerDayNum) {
                //判断条件 如果：要买的数量 > 每个订单限制购买的最大数量 处理：禁止下单
                if (that.data.count <= that.data.productInfo.limitPerOrderNum) {
                  //创建订单
                  var orderObj = {
                    itemRequests: [{
                      sceneId:that.data.sceneId,
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
                    providerName: that.data.productInfo.providerName,
                    orderBizType:that.data.orderBizType
                  };
                  service.saveOrder(orderObj).subscribe({
                    next: res1 => {
                      console.log('--------创建订单返回1混合支付-------');
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
                          wx.redirectTo({
                            url: '/pages/orderDetail/index?id=' + res1.orderId,
                          });
                          that.setData({
                            alreadyPay: false
                          });
                        },
                        fail(res2) {
                          console.log(res2);
                          if (res2.errMsg == 'requestPayment:fail cancel') {
                            wx.showToast({
                              title: '用户取消支付',
                              icon: 'none'
                            });
                            //跳转到待支付列表
                            that.toMyOrder();
                            that.setData({
                              alreadyPay: false
                            });
                          }
                        }
                      });
                    },
                    error: err =>{
                      wx.showModal({
                        title: '错误',
                        content: err,
                      });
                      that.setData({
                        alreadyPay: false
                      });
                    }
                      

                  });
                } else {
                  wx.showModal({
                    title: '提示',
                    content: '该商品每单最多可以购买' + that.data.productInfo.limitPerOrderNum + '件'
                  });
                  that.setData({
                    alreadyPay: false
                  });
                }
              } else {
                wx.showModal({
                  title: '提示',
                  content: '该商品今日还可以购买' + (that.data.productInfo.limitPerDayNum - res.totalToday) + '件'
                });
                that.setData({
                  alreadyPay: false
                });
              }
            } else {
              wx.showModal({
                title: '提示',
                content: '该商品您最多还可以购买' + (that.data.productInfo.limitMaxNum - res.totalAll) + '件'
              });
              that.setData({
                alreadyPay: false
              });
            }
          } else {
            wx.showModal({
              title: '提示',
              content: '当前桔子余额不足，请多赚些桔子吧'
            });
            that.setData({
              alreadyPay: false
            });
          }
        },
        error: err => {
          wx.showModal({
            title: '错误',
            content: err,
          });
          that.setData({
            alreadyPay: false
          });
        }
      })
    } else if (that.data.paytype == 2) { //桔子支付
      service.getPre({
        productId: that.data.productId
      }).subscribe({
        next: res => {
          console.log('--------下单前数据校验2桔子支付-------');
          console.log(res);
          if (res.pointBalance >= that.data.productInfo.point * that.data.count) {
            //判断条件 如果：过往已经购买的数量 + 要买的数量 > 限制购买的最大数量 处理：禁止下单
            if (res.totalAll + that.data.count <= that.data.productInfo.limitMaxNum) {
              //判断条件 如果：今日已经购买的数量 + 要买的数量 > 今日限制购买的最大数量 处理：禁止下单
              if (res.totalToday + that.data.count <= that.data.productInfo.limitPerDayNum) {
                //判断条件 如果：要买的数量 > 每个订单限制购买的最大数量 处理：禁止下单
                if (that.data.count <= that.data.productInfo.limitPerOrderNum) {
                  //创建订单
                  var orderObj = {
                    itemRequests: [{
                      sceneId:that.data.sceneId,
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
                    providerName: that.data.productInfo.providerName,
                    orderBizType:that.data.orderBizType
                  };
                  service.saveOrder(orderObj).subscribe({
                    next: res1 => {
                      console.log('--------创建订单返回2桔子支付-------');
                      console.log(res1);
                      //兑换成功什么都不返回
                      wx.redirectTo({
                        url: '/pages/orderDetail/index?id=' + res1.orderId,
                      });
                      that.setData({
                        alreadyPay: false
                      });
                    },
                    error: err => {
                      wx.showModal({
                        title: '错误',
                        content: err,
                      });
                      that.setData({
                        alreadyPay: false
                      });
                    }
                  });
                } else {
                  wx.showModal({
                    title: '提示',
                    content: '该商品每单最多可以购买' + that.data.productInfo.limitPerOrderNum + '件'
                  });
                  that.setData({
                    alreadyPay: false
                  });
                }
              } else {
                wx.showModal({
                  title: '提示',
                  content: '该商品今日还可以购买' + (that.data.productInfo.limitPerDayNum - res.totalToday) + '件'
                });
                that.setData({
                  alreadyPay: false
                });
              }
            } else {
              wx.showModal({
                title: '提示',
                content: '该商品您最多还可以购买' + (that.data.productInfo.limitMaxNum - res.totalAll) + '件'
              });
              that.setData({
                alreadyPay: false
              });
            }
          } else {
            wx.showModal({
              title: '提示',
              content: '当前桔子余额不足，请多赚些桔子吧'
            });
            that.setData({
              alreadyPay: false
            });
          }
        },
        error: err => {
          wx.showModal({
            title: '错误',
            content: err,
          });
          that.setData({
            alreadyPay: false
          });
        }
      })
    } else if (that.data.paytype == 3) { //人民币优惠支付
      service.getPre({
        productId: that.data.productId
      }).subscribe({
        next: res => {
          console.log('--------下单前数据校验3微信支付-------');
          console.log(res);
          //判断条件 如果：过往已经购买的数量 + 要买的数量 > 限制购买的最大数量 处理：禁止下单
          if (res.totalAll + that.data.count <= that.data.productInfo.limitMaxNum) {
            //判断条件 如果：今日已经购买的数量 + 要买的数量 > 今日限制购买的最大数量 处理：禁止下单
            if (res.totalToday + that.data.count <= that.data.productInfo.limitPerDayNum) {
              //判断条件 如果：要买的数量 > 每个订单限制购买的最大数量 处理：禁止下单
              if (that.data.count <= that.data.productInfo.limitPerOrderNum) {
                //创建订单
                var orderObj = {
                  itemRequests: [{
                    sceneId:that.data.sceneId,
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
                  providerName: that.data.productInfo.providerName,
                  orderBizType:that.data.orderBizType
                };
                service.saveOrder(orderObj).subscribe({
                  next: res1 => {
                    console.log('--------创建订单返回3微信支付--------');
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
                        wx.redirectTo({
                          url: '/pages/orderDetail/index?id=' + res1.orderId,
                        });
                        that.setData({
                          alreadyPay: false
                        });
                      },
                      fail(res2) {
                        console.log(res2);
                        if (res2.errMsg == 'requestPayment:fail cancel') {
                          wx.showToast({
                            title: '用户取消支付',
                            icon: 'none'
                          });
                          //跳转到待支付列表
                          that.toMyOrder();
                          that.setData({
                            alreadyPay: false
                          });
                        }

                      }
                    });
                  },
                  error: err => {
                    wx.showModal({
                      title: '错误',
                      content: err,
                    });
                    that.setData({
                      alreadyPay: false
                    });
                  }
                });
              } else {
                wx.showModal({
                  title: '提示',
                  content: '该商品每单最多可以购买' + that.data.productInfo.limitPerOrderNum + '件'
                });
                that.setData({
                  alreadyPay: false
                });
              }
            } else {
              wx.showModal({
                title: '提示',
                content: '该商品今日还可以购买' + (that.data.productInfo.limitPerDayNum - res.totalToday) + '件'
              });
              that.setData({
                alreadyPay: false
              });
            }
          } else {
            wx.showModal({
              title: '提示',
              content: '该商品您最多还可以购买' + (that.data.productInfo.limitMaxNum - res.totalAll) + '件'
            });
            that.setData({
              alreadyPay: false
            });
          }
        },
        error: err => {
          wx.showModal({
            title: '错误',
            content: err,
          })
          that.setData({
            alreadyPay: false
          });
        }
      })
    } else if (that.data.paytype == 4){//原价支付
      service.getPre({
        productId: that.data.productId
      }).subscribe({
        next: res => {
          console.log('--------下单前数据校验4微信支付原价-------');
          console.log(res);
          //判断条件 如果：过往已经购买的数量 + 要买的数量 > 限制购买的最大数量 处理：禁止下单
          if (res.totalAll + that.data.count <= that.data.productInfo.limitMaxNum) {
            //判断条件 如果：今日已经购买的数量 + 要买的数量 > 今日限制购买的最大数量 处理：禁止下单
            if (res.totalToday + that.data.count <= that.data.productInfo.limitPerDayNum) {
              //判断条件 如果：要买的数量 > 每个订单限制购买的最大数量 处理：禁止下单
              if (that.data.count <= that.data.productInfo.limitPerOrderNum) {
                //创建订单
                var orderObj = {
                  itemRequests: [{
                    sceneId:that.data.sceneId,
                    merchantId: that.data.productInfo.merchantId,
                    merchantName: that.data.productInfo.merchantName,
                    num: that.data.count,
                    originalPrice: that.data.productInfo.originalPrice,
                    payAmount: that.data.productInfo.price * that.data.count,
                    payPoint: 0,
                    picId: that.data.productInfo.picId,
                    point: that.data.productInfo.point,
                    price: that.data.productInfo.originalPrice,
                    productId: that.data.productInfo.productId,
                    productName: that.data.productInfo.productName,
                    type: that.data.productInfo.type
                  }],
                  openId: wx.getStorageSync('openid'),
                  originAmount: that.data.productInfo.originalPrice * that.data.count,
                  payAmount: that.data.productInfo.originalPrice * that.data.count,
                  payPoint: 0,
                  payType: 'WECHAT',
                  providerId: that.data.productInfo.providerId,
                  providerName: that.data.productInfo.providerName,
                  orderBizType:that.data.orderBizType
                };
                service.saveOrder(orderObj).subscribe({
                  next: res1 => {
                    console.log('--------创建订单返回4微信支付原价--------');
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
                        wx.redirectTo({
                          url: '/pages/orderDetail/index?id=' + res1.orderId,
                        });
                        that.setData({
                          alreadyPay: false
                        });
                      },
                      fail(res2) {
                        console.log(res2);
                        if (res2.errMsg == 'requestPayment:fail cancel') {
                          wx.showToast({
                            title: '用户取消支付',
                            icon: 'none'
                          });
                          //跳转到待支付列表
                          that.toMyOrder();
                          that.setData({
                            alreadyPay: false
                          });
                        }

                      }
                    });
                  },
                  error: err => {
                    wx.showModal({
                      title: '错误',
                      content: err,
                    });
                    that.setData({
                      alreadyPay: false
                    });
                  }
                });
              } else {
                wx.showModal({
                  title: '提示',
                  content: '该商品每单最多可以购买' + that.data.productInfo.limitPerOrderNum + '件'
                });
                that.setData({
                  alreadyPay: false
                });
              }
            } else {
              wx.showModal({
                title: '提示',
                content: '该商品今日还可以购买' + (that.data.productInfo.limitPerDayNum - res.totalToday) + '件'
              });
              that.setData({
                alreadyPay: false
              });
            }
          } else {
            wx.showModal({
              title: '提示',
              content: '该商品您最多还可以购买' + (that.data.productInfo.limitMaxNum - res.totalAll) + '件'
            });
            that.setData({
              alreadyPay: false
            });
          }
        },
        error: err => {
          wx.showModal({
            title: '错误',
            content: err,
          })
          that.setData({
            alreadyPay: false
          });
        }
      })
    } else if (that.data.paytype == 5){
      if (this.data.orderBizType == 'SPLICED'){
        let data = { 
          activityId: that.data.activityId,
          activityOrderId: that.data.activityOrderId,
          splicedRuleId: that.data.splicedRuleId
        };
        service.splicedPayment(data).subscribe({
          next: res => {
            console.log(res);
            var payInfo = JSON.parse(res.payInfo);
            wx.requestPayment({
              timeStamp: payInfo.timeStamp,
              nonceStr: payInfo.nonceStr,
              package: payInfo.package,
              signType: payInfo.signType,
              paySign: payInfo.paySign,
              success(res1) {
                wx.redirectTo({
                  url: '/pages/activities/my-collage/index?progressId=' + res.progressId + '&activityOrderId=' + that.data.activityOrderId + '&activityType=SPLICED' + '&activityId=' + that.data.activityId,
                });
              },
              fail(res) {
                if (res.errMsg == 'requestPayment:fail cancel') {
                  wx.showToast({
                    title: '用户取消支付',
                    icon: 'none'
                  });
                  that.toMyOrder();
                  that.setData({alreadyPay: false});
                }
              }
            });
          },
          error: err => {
              wx.showModal({
                title: '支付失败',
                content: err,
              });
              that.setData({
                alreadyPay: false
              });
          },
          complete: () => wx.hideToast()
        })
      }
    } else if (that.data.paytype == 6) {
      let data = {};
      if (that.data.activityOrderId) {
        data = {
          activityOrderId: that.data.activityOrderId
        }
      }
      service.bargainPayment(data).subscribe({
        next: res => {
          console.log(res);
          var payInfo = JSON.parse(res.payInfo);
          wx.requestPayment({
            timeStamp: payInfo.timeStamp,
            nonceStr: payInfo.nonceStr,
            package: payInfo.package,
            signType: payInfo.signType,
            paySign: payInfo.paySign,
            success(res2) {
              wx.redirectTo({
                url: '/pages/orderDetail/index?id=' + res.orderId,
              });
            },
            fail(res2) {
              if (res2.errMsg == 'requestPayment:fail cancel') {
                wx.showToast({
                  title: '用户取消支付',
                  icon: 'none'
                });
                that.setData({alreadyPay: false});
              }
            }
          });
        },
        error: err => {
            wx.showModal({
              title: '支付失败',
              content: err,
            });
            that.setData({
              alreadyPay: false
            });
        },
        complete: () => wx.hideToast()
      })
    } else if(that.data.paytype == 7){
      service.secKillPay({
        productId: that.data.productId,
        activityId:that.data.activityId
      }).subscribe({
        next: res => {
          console.log(res);
          var payInfo = JSON.parse(res.payInfo);
          wx.requestPayment({
            timeStamp: payInfo.timeStamp,
            nonceStr: payInfo.nonceStr,
            package: payInfo.package,
            signType: payInfo.signType,
            paySign: payInfo.paySign,
            success(obj) {
              wx.redirectTo({url: '/pages/orderDetail/index?id=' + res.orderId});
            },
            fail(obj) {
              if (obj.errMsg == 'requestPayment:fail cancel') {
                wx.showToast({
                  title: '用户取消支付',
                  icon: 'none'
                });
                that.setData({alreadyPay: false});
              }
            }
          });
        },
        error: err => {
            wx.showModal({
              title: '提示',
              content: err,
            });
            that.setData({
              alreadyPay: false
            });
        },
        complete: () => wx.hideToast()
      })
    } else{
      wx.showModal({
        title: '错误',
        content: '支付类型错误',
      })
    }

  }
});