import { service } from '../../service';
import { constant } from '../../utils/constant';
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
        wx.navigateTo({url: "/pages/createReply/index?id="+id});
    },
    toPay(){
        
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