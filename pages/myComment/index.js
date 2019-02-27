import {service} from '../../service';
import {constant} from '../../utils/constant';
import {errDialog,loading} from '../../utils/util';
var app = getApp();
Page({
    data: {
        commentlist: [],
        constant: constant,
        isShowNodata: false,
        pageNo: 1,
        isFinall: false,
        scorelist: []
    },
    getComments: function(pageNo) {
        var obj = {
            pageNo: pageNo,
            pageSize: 20
        }
        service.myComment(obj).subscribe({
            next: res => {
                if (res.list.length < 20) {
                    this.setData({
                        isFinall: true
                    });
                } else {
                    this.setData({
                        isFinall: false
                    });
                }
                for (var i = 0; i < res.list.length; i++) {
                    if (res.list[i].imgIds != "") {
                        res.list[i].imgIds = res.list[i].imgIds.split(',');
                    } else {
                        res.list[i].imgIds = [];
                    }
                }
                if (pageNo == 1) {
                    this.setData({
                        commentlist: res.list
                    });
                } else {
                    this.setData({
                        commentlist: this.data.commentlist.concat(res.list)
                    });
                }
                this.setData({
                    isShowNodata: this.data.commentlist.length == 0
                });
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    toComDetail: function(e) {
        var id = e.currentTarget.dataset['id'];
        wx.navigateTo({
            url: "/pages/comDetail/index?id=" + id
        });
    },

    //下拉刷新
    onPullDownRefresh() {
        this.setData({
            pageNo: 1
        });
        var obj = {
            pageNo: this.data.pageNo,
            pageSize: 20
        }
        service.myComment(obj).subscribe({
            next: res => {
                if (res.list.length < 20) {
                    this.setData({
                        isFinall: true
                    });
                } else {
                    this.setData({
                        isFinall: false
                    });
                }
                for (var i = 0; i < res.list.length; i++) {
                    if (res.list[i].imgIds != "") {
                        res.list[i].imgIds = res.list[i].imgIds.split(',');
                    } else {
                        res.list[i].imgIds = [];
                    }
                }
                this.setData({
                    commentlist: res.list
                });
                this.setData({
                    commentlist: res.list,
                    isShowNodata: this.data.commentlist.length == 0
                });
            },
            error: err => errDialog(err),
            complete: () => {
                setTimeout(() => {
                    wx.stopPullDownRefresh()
                }, 1000);
            }
        })
    },

    //上拉加载
    onReachBottom() {
        if (this.data.isFinall) { return; }
        var pageNo = this.data.pageNo + 1;
        this.getComments(pageNo);
    },

    onLoad: function(options) {
        wx.setNavigationBarTitle({
            title: '我的评价',
        });
        wx.hideShareMenu();
        this.getComments(1);
    }
})