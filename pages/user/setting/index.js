import { errDialog, loading } from '../../../utils/util'
import { constant } from '../../../utils/constant';
import { service } from '../../../service';
var app = getApp();
Page({
    data: {
        isShowModal: true
    },
    changeTel: function() {
        wx.navigateTo({ url: '../setting/changeTel' });
    },
    closeModal: function() {
        this.setData({ isShowModal: true });
    },
    openModal: function() {
        this.setData({ isShowModal: false });
    },
    getUserInfo: function(e) {
        app.globalData.userInfo = e.detail.userInfo;
        this.setData({ isShowModal: true });
        var userInfo = e.detail.userInfo;
        service.userUpdate({
            mobile: "",
            name: userInfo.nickName,
            img: userInfo.avatarUrl,
            sex: userInfo.gender,
            city: userInfo.city
        }).subscribe({
            next: res => {
                wx.showToast({
                    title: "更新资料成功",
                    icon: "success"
                });
            },
            error: err => errDialog(err),
            complete: () => wx.hideLoading()
        });
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '设置' });
    }
})