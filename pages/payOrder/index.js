import { service } from '../../service';
import {constant} from '../../utils/constant';
var app = getApp();
Page({
    data: {
        merchantInfo: {},
        amount:0
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '订单确认', });
    },
    delNumber: function() {
        var thisNum = this.data.amount - 1;
        if (thisNum <= 0) { return; }
        this.setData({ amount: thisNum });
    },
    addNumber: function() {
        var thisNum = this.data.amount + 1;
        this.setData({ amount: thisNum });
    },
    toPay: function() {
        var payInfo = this.data.payInfo;
        if(payInfo.wxpay==0){

        }else{

        }
    }
});