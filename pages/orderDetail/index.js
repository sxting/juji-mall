import { errDialog, loading,barcode} from '../../utils/util';
import { service} from '../../service';
import { constant} from '../../utils/constant';
var app = getApp();
Page({
  data: {
    orderId:'',
    orderInfo: {},
    amount: 0,
    preOrderStr:'',
    constant: constant,
    voucherInfo:{}
  },
  onLoad: function(options) {
    wx.setNavigationBarTitle({title: '订单详情'});
    this.getData(options.id);
    this.setData({orderId: options.id});
  },
  toComDetail:function(e){
    var id = e.currentTarget.dataset['id'];
    wx.navigateTo({url: "/pages/comDetail/index?id=" + id});
  },
  toComment: function(e) {
    var id = e.currentTarget.dataset['id'];
    var pid = e.currentTarget.dataset['pid'];
    wx.navigateTo({url: "/pages/comment/index?id="+id+"&pid=" + pid});
  },
  reFund:function(){
    wx.showModal({
      title: '退款后金额将原路返回',
      content: '退款金额为商品实付金额，商品优惠金额不予退款',
      showCancel:true,
      cancelColor:'#999999',
      confirmColor:'#333333',
      success:(res) => {
        if (res.confirm) {
          service.refund({orderId: this.data.orderId}).subscribe({
            next: res => {
                wx.showToast({
                    title:"退款成功",
                    icon:"success"
                });
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
          })
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  },
  getData: function(orderId) {
    service.orderInfo({orderId: orderId}).subscribe({
      next: res => {
        this.setData({orderInfo: res});
        this.setData({preOrderStr:res.preOrderStr});
        if(res.status=='PAID'){
          barcode('barcode', res.vouchers[0].voucherCode, 680, 200);
          this.getListVoucher(res.vouchers[0].voucherCode);
        }
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  copyBtn: function (e) {
    wx.setClipboardData({
      data: this.data.orderInfo.orderId,
      success: (res) => {
        wx.showToast({title: '复制成功'});
      }
    });
  },
  getListVoucher:function(code){
    var obj = {
      code:code,
      openId:wx.getStorageSync('openid')
    }
    service.listVouchers(obj).subscribe({
      next: res => {
        this.setData({voucherInfo: res[0]});
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  toPay: function() {
    var payInfo = JSON.parse(this.data.preOrderStr);
    wx.requestPayment({
      timeStamp: payInfo.timeStamp,
      nonceStr: payInfo.nonceStr,
      package: payInfo.package,
      signType: payInfo.signType,
      paySign: payInfo.paySign,
      success(res2) {
        this.getData(this.data.orderId);
      },
      fail(res2) {
        if (res2.errMsg == 'requestPayment:fail cancel') {
          wx.showToast({
            title: '用户取消支付',
            icon: 'none'
          });
        }
      }
    });
  }
});


