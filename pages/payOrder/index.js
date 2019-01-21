import { service } from '../../service';
import {constant} from '../../utils/constant';
var app = getApp();
Page({
    data: {
        merchantInfo: {}
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '订单确认', });
    },
    toPay: function() {
        var payInfo = this.data.payInfo;
        if(payInfo.wxpay==0){

        }else{

        }
    }
});