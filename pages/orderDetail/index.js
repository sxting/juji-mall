import { errDialog, loading,barcode} from '../../utils/util';
import { service} from '../../service';
import { constant} from '../../utils/constant';
var app = getApp();
Page({
  data: {
    orderInfo: {},
    amount: 0,
    constant: constant,
    validEndTime:''
  },
  onLoad: function(options) {
    wx.setNavigationBarTitle({title: '订单详情'});
    this.getData(options.id);
  },
  toComDetail:function(e){
    var id = e.currentTarget.dataset['id'];
    var storeid = e.currentTarget.dataset['id'];
    wx.navigateTo({
      url: "/pages/comDetail/index?id=" + id+"&storeid=" + storeid
    });
  },
  toComment: function(e) {
    var id = e.currentTarget.dataset['id'];
    var pid = e.currentTarget.dataset['pid'];
    wx.navigateTo({
      url: "/pages/comment/index?id=" + id+"&pid=" + pid
    });
  },
  reFund:function(){
    wx.showModal({
      title: '退款后金额将原路返回',
      content: '退款金额为商品实付金额，商品优惠金额不予退款',
      showCancel:true,
      cancelColor:'#999999',
      confirmColor:'#333333',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  getData: function(orderId) {
    service.orderInfo({
      orderId: orderId
    }).subscribe({
      next: res => {
        this.setData({orderInfo: res});
        barcode('barcode', res.vouchers[0].voucherCode, 680, 200);
        this.setData({validEndTime:res.vouchers[0].validEndTime.split(' ')[0]})
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


