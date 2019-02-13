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
    paytype: 1
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
  toPay: function() {

    if (this.data.paytype == 1) {
      service.getPre({
        productId: this.data.productId
      }).subscribe({
        next: res => {
          console.log('--------下单前数据校验-------');
          console.log(res);
          if (res.pointBalance > this.data.product.point) {
            if (res.totalAll) {
              if (res.totalToday) {

              } else {
                wx.showToast('来晚了，商品今天买完了，请明天再来吧');
              }
            } else {
              wx.showToast('商品库存不足了，请看看别的商品吧');
            }
          } else {
            wx.showToast('当前桔子余额不足，请多赚些桔子吧');
          }
        },
        error: err => console.log(err),
        complete: () => wx.hideToast()
      })
    } else if (this.data.paytype == 2) {
      service.getPre({
        productId: this.data.productId
      }).subscribe({
        next: res => {
          console.log('--------下单前数据校验-------');
          console.log(res);
          if (res.pointBalance > this.data.product.point) {
            if (res.totalAll) {
              if (res.totalToday) {

              } else {
                wx.showToast('来晚了，商品今天买完了，请明天再来吧');
              }
            } else {
              wx.showToast('商品库存不足了，请看看别的商品吧');
            }
          } else {
            wx.showToast('当前桔子余额不足，请多赚些桔子吧');
          }
        },
        error: err => console.log(err),
        complete: () => wx.hideToast()
      })
    } else {
      service.getPre({
        productId: this.data.productId
      }).subscribe({
        next: res => {
          console.log('--------下单前数据校验-------');
          console.log(res);
          if (res.totalAll) {
            if (res.totalToday) {

            } else {
              wx.showToast('来晚了，商品今天买完了，请明天再来吧');
            }
          } else {
            wx.showToast('商品库存不足了，请看看别的商品吧');
          }
        },
        error: err => console.log(err),
        complete: () => wx.hideToast()
      })
    }

  }
});