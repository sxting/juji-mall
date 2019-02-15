import { service } from '../../service';
import { constant } from '../../utils/constant';
import { errDialog, loading } from '../../utils/util';
var app = getApp();
Page({
    data: {
        tablist: [{ name: '全部', status: 'ALL' }, { name: '待付款', status: 'CREATED' }, { name: '待使用', status: 'PAID' }, { name: '待评价', status: 'CONSUME' }],
        curTabIndex: 0,
        constant: constant,
        isShowNodata: false,
        orderlist: [],
        amount: 0
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '我的订单' });
        this.setData({ curTabIndex: options.index });
        this.getData(options.status);
    },
    toDetail: function(e) {
        var id = e.currentTarget.dataset.id;
        var status = e.currentTarget.dataset.status;
        wx.navigateTo({ url: "/pages/orderDetail/index?id=" + id });
        // if(status=="CREATED"||status=="CONSUME"||status=="PAID"){}
    },
    toComment: function(e) {
        var id = e.currentTarget.dataset['id'];
        var pid = e.currentTarget.dataset['pid'];
        wx.navigateTo({ url: "/pages/comment/index?id=" + id + "&pid=" + pid });
    },
    switchTab: function(event) {
        var thisIndex = event.currentTarget.dataset['index'];
        var thisStatus = event.currentTarget.dataset['status'];
        console.log(thisIndex);
        this.setData({ curTabIndex: thisIndex });
        this.getData(thisStatus);
    },
    getData: function(status) {
        var obj = {
            status: status,
            pageNo: 1,
            pageSize: 50
        }
        service.orderlist(obj).subscribe({
            next: res => {
                this.setData({ orderlist: res.content });
                this.setData({ isShowNodata: this.data.orderlist.length == 0 });
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    toPay: function(e) {
        var payInfo = JSON.parse(e.currentTarget.dataset['pre']);
        wx.requestPayment({
            timeStamp: payInfo.timeStamp,
            nonceStr: payInfo.nonceStr,
            package: payInfo.package,
            signType: payInfo.signType,
            paySign: payInfo.paySign,
            success(res2) {
                wx.navigateTo({ url: "/pages/orderDetail/index?id=" + e.currentTarget.dataset['id'] });
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