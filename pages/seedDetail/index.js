var util = require('../../utils/util.js');
import { constant } from '../../utils/constant';
import { errDialog, loading } from '../../utils/util';
import { service } from '../../service.js';

Page({
    data: {
        nvabarData: { showCapsule: 1, title: '种草'},
        providerId:'',
        productList: [],
        isShowNodata: false,
        pageNo: 1,
        ifBottom: false
    },
    onLoad: function(options) {
        this.setData({providerId: wx.getStorageSync('providerId')});
        this.getData(options.id); //获取活动列表
    },
    onReachBottom: function() {
        if (this.data.ifBottom) { //已经到底部了
            return;
        } else {
            this.setData({
                pageNo: this.data.pageNo + 1
            })
            this.getData();
        }
    },
    getData: function(id) {
        service.tweetDetail({tweetsId:id}).subscribe({
            next: res => {
                this.setData({

                });
            },
            error: err => {},
            complete: () => wx.hideToast()
        });
    },
    //跳转到商品详情
    toComDetail: function(e) {
        var id = e.currentTarget.dataset.id;
        var storeid = e.currentTarget.dataset.storeid;
        wx.navigateTo({
            url: '/pages/comDetail/index?share=0&id=' + id + '&storeid=' + storeid
        });
    },
    // 分享
    toComDetailAndShare: function(e) {
        var id = e.currentTarget.dataset.id;
        var storeid = e.currentTarget.dataset.storeid;
        wx.navigateTo({
            url: '/pages/comDetail/index?share=1&id=' + id + '&storeid=' + storeid
        });
    },
});