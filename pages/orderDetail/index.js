import { errDialog, loading,barcode} from '../../utils/util'
import {
  service
} from '../../service';
import {
  constant
} from '../../utils/constant';
var app = getApp();
Page({
  data: {
    orderInfo: {},
    amount: 0
  },
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '订单详情',
    });
    barcode('barcode', '1234567890123456789', 680, 200);
    if (options.id) {
      this.getData(options.id);
    } else {
      wx.showToast({
        title: '发生错误，未找到订单id',
        icon: 'none'
      })
      wx.navigateBack({delta: 1});
      return;
    }
  },
  toComment: function() {
    var id = event.currentTarget.dataset['id'];
    wx.navigateTo({
      url: "/pages/comment/index?id=" + id
    });
  },
  toPay() {

  },
  getData: function(orderId) {
    service.orderInfo({
      orderId: orderId
    }).subscribe({
      next: res => {
        this.setData({
          orderInfo: res
        });
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  toPay: function() {
    var payInfo = this.data.payInfo;
    if (payInfo.wxpay == 0) {

    } else {

    }
  }
});


