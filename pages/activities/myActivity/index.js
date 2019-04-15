import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
import { activitiesService } from '../shared/service.js'
var app = getApp();
Page({
    data: {
        constant: constant,
        isShowNodata: false,
        orderlist: [],
        pageNo: 1,
        type: '',
        isFinall: false,
        amount: 0,
        restHour:'10',
        restMinute:'00',
        restSecond:'00'
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: options.type == 'SPLICED' ? '我的拼团' : '我的砍价' });
        this.setData({type:options.type});
        this.getData(options.type,1)
    },
    toDetail: function(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({ url: "/pages/orderDetail/index?id=" + id });
    },
    getData: function(type, pageNo) {
        var obj = {
            providerId:wx.getStorageSync('providerId'),
            activityType: 'SPLICED',
            pageNo: pageNo,
            pageSize: 10
        }
        activitiesService.myOrder(obj).subscribe({
            next: res => {
                if (res.length < 10) {
                    console.log("到底了");
                    this.setData({ isFinall: true });
                } else {
                    this.setData({ isFinall: false });
                }
                if (pageNo == 1) {
                    this.setData({ orderlist: res });
                } else {
                    this.setData({ orderlist: this.data.orderlist.concat(res) });
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
        this.getData(this.data.type, 1);
    },

    //上拉加载
    onReachBottom() {
        if (this.data.isFinall) {
            return;
        }
        var pageNo = this.data.pageNo + 1;
        this.getData(this.data.type, pageNo);
    }
});