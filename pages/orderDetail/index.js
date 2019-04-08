import { errDialog, loading,barcode,formatDate} from '../../utils/util';
import { service} from '../../service';
import { constant} from '../../utils/constant';
var app = getApp();
var timer = null;
Page({
  data: {
    orderId:'',
    orderInfo: {},
    amount: 0,
    preOrderStr:'',
    constant: constant,
    voucherInfo:{},
    vouchers:[],
    validEndDate:''
  },
  onLoad: function(options) {
    wx.setNavigationBarTitle({title: '订单详情'});
    wx.hideShareMenu();
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
      title: '订单号已复制',
      content: '请联系客服进行退款',
      cancelText:'关闭',
      confirmText:'联系客服',
      success:(res) => {
        if (res.confirm) {
          wx.switchTab({
            url: '../user/index'
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
          if(!timer){
            this.getListVoucher(res.vouchers[0].voucherCode);
          }
        }
        this.setData({vouchers:res.vouchers});
        if(res.status=='CONSUME'||res.status=='FINISH'){
          console.log('已完成的订单');
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
        console.log(res[0].validEndDate);
        // var timestamp = new Date(res[0].validEndDate+':123').getTime()+2000;
        // console.log(timestamp);
        // var dealDate =  formatDate(timestamp);
        this.setData({validEndDate:res[0].validEndDate.substring(0,10)});
        if(this.data.orderInfo.status=='PAID'&&this.data.voucherInfo.validDays>0){
          barcode('barcode', this.data.orderInfo.vouchers[0].voucherCode, 664, 136);
          // timer = setInterval(()=>{
          //   this.getData(this.data.orderId);
          // },1000)
        }
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  toPay: function() {
    var payInfo = JSON.parse(this.data.preOrderStr);
    var that = this;
    wx.requestPayment({
      timeStamp: payInfo.timeStamp,
      nonceStr: payInfo.nonceStr,
      package: payInfo.package,
      signType: payInfo.signType,
      paySign: payInfo.paySign,
      success(res2) {
        that.getData(that.data.orderId);
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


