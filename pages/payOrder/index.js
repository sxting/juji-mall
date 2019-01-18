import { service } from '../../service';
import {constant} from '../../utils/constant';
var app = getApp();
Page({
    data: {
        constant:{},
        isChecked: true,
        merchantInfo: {},
        timer: null,
        count: 180,
        restTime: "03:00",
        payInfo: {},
        isShowConfirmModal: true,
        confirmTitle: '',
        confirmContent: '',
        totalPay: "0.00",
        disabled:false
    },
    onLoad: function(options) {
        this.setData({constant:constant});
        wx.setNavigationBarTitle({ title: '订单支付', });
        this.setData({ 
            merchantInfo: app.globalData.merchantInfo,
            payInfo: app.globalData.payInfo,
            totalPay: parseFloat(app.globalData.payInfo.totalPay).toFixed(2) 
        });
        this.showRestTime();
    },
    switchChange(e) {
        console.log(e.detail.value);
        this.setData({ isChecked: e.detail.value });
    },
    showRestTime: function() {
        var restTime = 180;
        if (!this.data.timer) {
            this.data.count = restTime;
            this.data.timer = setInterval(() => {
                if (this.data.count > 0 && this.data.count <= restTime) {
                    var curCount = this.data.count - 1;
                    this.setData({ count: curCount });
                    this.setData({ restTime: this.getTime(this.data.count) });
                } else {
                    clearInterval(this.data.timer);
                    if(this.data.payInfo.wxpay==0){
                        this.setData({ disabled:true});
                    }
                    this.setData({ count: null });
                }
            }, 1000);
        }
    },
    getTime: function(seconds) {
        var second = seconds % 60;
        var minute = '0' + parseInt(seconds / 60);
        return minute + ":" + (second < 10 ? '0' + second : second);
    },
    toPay: function() {
        var payInfo = this.data.payInfo;
        if(payInfo.wxpay==0){
            wx.showLoading({title: '正在扣款...'});
            service.confirmOrder({
              orderId: payInfo.orderId
            }).subscribe({
                next: res => {
                    wx.navigateTo({ url: '/pages/tradeSuccess/index' });
                },
                error: err => {
                    wx.hideLoading();
                    this.showAlert(err);
                },
                complete: () => wx.hideLoading()
            });
        }else{
            wx.requestPayment({
                timeStamp: payInfo.timeStamp,
                nonceStr: payInfo.nonceStr,
                package: payInfo.package,
                signType: payInfo.signType,
                paySign: payInfo.paySign,
                success: () => {
                    wx.navigateTo({ url: '/pages/tradeSuccess/index' });
                },
                fail:() => {
                    this.setData({
                        isShowConfirmModal: false,
                        confirmTitle: '支付失败',
                        confirmContent: '支付遇到问题，请重新支付'
                    });
                }
            });
        }
    }
});