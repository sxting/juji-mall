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
        pageNo:1,
        status:'',
        isFinall:false,
        amount: 0
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '我的订单' });
        this.setData({ curTabIndex: options.index,status:options.status });
        this.getData(options.status,1);
    },
    toDetail: function(e) {
        var id = e.currentTarget.dataset.id;
        var status = e.currentTarget.dataset.status;
        wx.navigateTo({ url: "/pages/orderDetail/index?id=" + id });
    },
    toComment: function(e) {
        var id = e.currentTarget.dataset['id'];
        var pid = e.currentTarget.dataset['pid'];
        wx.navigateTo({ url: "/pages/comment/index?id=" + id + "&pid=" + pid });
    },
    switchTab: function(event) {
        var thisIndex = event.currentTarget.dataset['index'];
        var thisStatus = event.currentTarget.dataset['status'];
        this.setData({ curTabIndex: thisIndex });
        this.getData(thisStatus,1);
    },
    getData: function(status,pageNo) {
        var obj = {
            status: status,
            pageNo: pageNo,
            pageSize: 10
        }
        service.orderlist(obj).subscribe({
            next: res => {
                if(res.content.length<20){
                  this.setData({isFinall:true});
                }else{
                  this.setData({isFinall:false});
                }
                if(pageNo==1){
                  this.setData({ orderlist:res.content});
                }else{
                  this.setData({ orderlist: this.data.orderlist.concat(res.content)});
                }
                this.setData({ isShowNodata: this.data.orderlist.length == 0 });
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    //下拉刷新
    onPullDownRefresh() {
        this.setData({ pageNo: 1 });
        this.getData(this.data.status,1);
    },

    //上拉加载
    onReachBottom() {
        var pageNo = this.data.pageNo+1;
        this.setData({pageNo:pageNo});
        this.getData(this.data.status,pageNo);
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