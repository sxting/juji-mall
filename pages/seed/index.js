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
    onShow: function(options) {
        this.setData({productList:[]});
        this.setData({providerId: wx.getStorageSync('providerId')});
        this.getData(); //获取活动列表
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
    getData: function(status) {
        var obj = {
            show:1,
            providerId: this.data.providerId,
            pageNo: this.data.pageNo,
            pageSize: 16
        };
        service.tweets(obj).subscribe({
            next: res => {
                if(res.length==0){
                    this.setData({
                        productList: [],
                        isShowNodata: true,
                        ifBottom:true
                    });
                }else{
                    this.setData({
                        productList: this.data.productList.concat(res.list),
                        isShowNodata: this.data.pageNo==1 && res.list.length==0,
                        ifBottom:res.list.length==0
                    });
                }
            },
            error: err => {
                this.setData({isShowNodata:true})
            },
            complete: () => wx.hideToast()
        });
    },
    //跳转到商品详情
    toDetail: function(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/seedDetail/index?share=0&id=' + id
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