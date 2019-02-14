import { service } from '../../service';
import { constant } from '../../utils/constant';
import { errDialog, loading} from '../../utils/util'
var app = getApp();
Page({
    data: {
        orderInfo:{},
        amount: 0
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '订单详情', });
        this.getData(options.id);
    },
    switchTab: function(event) {
        var thisType = event.currentTarget.dataset['type'];
        this.setData({ isShowNodata: this.data.orderlist.length == 0 });
    },
    toComment:function(){
        var id = event.currentTarget.dataset['id'];
        wx.navigateTo({url: "/pages/comment/index?id="+id});
    },
    toPay(){
          var obj = {
            openid: wx.getStorageSync('openid')
          };
          service.testPreOrder(obj).subscribe({
            next: res2 => {
              console.log(res2);
              wx.requestPayment({
                timeStamp: res2.timeStamp,
                nonceStr: res2.nonceStr,
                package: res2.package,
                signType: res2.signType,
                paySign: res2.paySign,
                success(res3) {
                  // alert('支付成功');
                },
                fail(res3) {
                  // alert('支付失败');
                }
              })
            },
            error: err => console.log(err)
          });

    },
    getData:function(orderId){
        service.orderInfo({orderId:orderId}).subscribe({
          next: res => {
            this.setData({orderInfo:res});
          },
          error: err => errDialog(err),
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