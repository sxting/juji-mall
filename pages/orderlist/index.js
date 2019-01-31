import { service } from '../../service';
import { constant } from '../../utils/constant';
var app = getApp();
Page({
    data: {
        tablist: ['全部', '待付款', '待使用', '待评价'],
        curTabIndex: 0,
        isShowNodata: false,
        orderlist:['','',''],
        amount: 0
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '我的订单', });
    },
    switchTab: function(event) {
        var thisIndex = event.currentTarget.dataset['index'];
        var thisType = event.currentTarget.dataset['type'];
        this.setData({ curTabIndex: thisIndex });
        // if (thisType == 0) {
        //     this.setData({ orderlist: this.data.cardListAll });
        // } else {
        //     this.setData({ orderlist: this.getCardListByType(thisType) });
        // }
        this.setData({ isShowNodata: this.data.orderlist.length == 0 });
    },
    toPay: function() {
        var payInfo = this.data.payInfo;
        if (payInfo.wxpay == 0) {

        } else {

        }
    }
});