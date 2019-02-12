import { service } from '../../service';
import { constant } from '../../utils/constant';
var app = getApp();
Page({
    data: {
        orderInfo:['','',''],
        amount: 0
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '订单详情', });
    },
    switchTab: function(event) {
        var thisIndex = event.currentTarget.dataset['index'];
        var thisType = event.currentTarget.dataset['type'];
        this.setData({ curTabIndex: thisIndex });
        this.setData({ isShowNodata: this.data.orderlist.length == 0 });
    },
    toPay: function() {
        var payInfo = this.data.payInfo;
        if (payInfo.wxpay == 0) {

        } else {

        }
    }
});