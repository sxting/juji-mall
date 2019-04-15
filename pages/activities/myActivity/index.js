import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
var app = getApp();
Page({
    data: {
        constant: constant,
        isShowNodata: false,
        orderlist: [{},{}],
        pageNo: 1,
        status: '',
        isFinall: false,
        amount: 0
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: options.type == 'SPLICED' ? '我的拼团' : '我的砍价' });
        // this.getData(options.type,1)
    },
    toDetail: function(e) {
        var id = e.currentTarget.dataset.id;
        var status = e.currentTarget.dataset.status;
        wx.navigateTo({ url: "/pages/orderDetail/index?id=" + id });
    },
    getData: function(type, pageNo) {
        var obj = {
            providerId:wx.getStorageSync('providerId'),
            activityType: type,
            pageNo: pageNo,
            pageSize: 10
        }
        service.orderlist(obj).subscribe({
            next: res => {
                if (res.content.length < 10) {
                    console.log("到底了");
                    this.setData({ isFinall: true });
                } else {
                    this.setData({ isFinall: false });
                }
                if (pageNo == 1) {
                    this.setData({ orderlist: res.content });
                } else {
                    this.setData({ orderlist: this.data.orderlist.concat(res.content) });
                }
                this.setData({ isShowNodata: this.data.orderlist.length == 0 });
            },
            // error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    //下拉刷新
    onPullDownRefresh() {
        this.setData({ pageNo: 1 });
        this.getData(this.data.status, 1);
    },

    //上拉加载
    onReachBottom() {
        if (this.data.isFinall) {
            return;
        }
        var pageNo = this.data.pageNo + 1;
        this.getData(this.data.status, pageNo);
    }
});