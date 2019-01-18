import { errDialog, loading } from '../../utils/util'
import { constant } from '../../utils/constant';
import { service } from '../../service';
var app = getApp();
Page({
    data: {
        myId:'',
        fanList: [],
        isSelf:1,
        userId:'',
        isShowNodata: false
    },
    getFans: function() {
        service.fanList({userId:this.data.userId}).subscribe({
            next: res => {
                if (res.length > 0) {
                    this.setData({ fanList: res })
                } else {
                    this.setData({ isShowNodata: true });
                }
            },
            error: err => this.showToast(err),
            complete: () => wx.hideToast()
        })
    },
    toHisCircle: function(e) {
        wx.navigateTo({
            url: '/pages/myCircle/index?id=' + e.currentTarget.dataset.id
        });
    },
    followUser: function(e) {
        service.attent({
            attentionUserId: e.currentTarget.dataset.id,
            attent: e.currentTarget.dataset.attent == 0 ? 1 : 0
        }).subscribe({
            next: res => {
                var txt = e.currentTarget.dataset.attent == 0?'关注成功！':'你已取消关注';
                this.showToast(txt);
                this.getFans();
            },
            error: err => this.showToast(err),
            complete: () => wx.hideToast()
        })
    },
    onLoad: function(options) {
        new app.ToastPannel();
        this.setData({myId:app.globalData.userInfo.id})
        this.setData({isSelf:options.isSelf});
        this.setData({userId:options.id});
        var txt = options.isSelf==1?"我的":"TA的";
        wx.setNavigationBarTitle({ title: txt+'粉丝' });
        this.getFans();
    }
});