import { errDialog, loading } from '../../utils/util'
import { service } from '../../service';
import { constant } from '../../utils/constant';
var app = getApp();
Page({
    data: {
        nickName: '微信名字',
        avatar: '',
        phoneNum: '',
    },
    toJuzi: function() {
        wx.switchTab({ url: '../juzi/index' });
    },
    toPage: function(e) {
        var page = e.currentTarget.dataset.page;
        console.log(page);
        wx.navigateTo({ url: page });
    },
    onLoad: function() {
        wx.setNavigationBarTitle({ title: '我的' });
    },
    onShow: function() {
        this.getInfo();
    },
    getInfo: function() {
        service.userInfo({ openId: wx.getStorageSync('openid') }).subscribe({
            next: res => {
                this.setData({
                    nickName: res.nickName,
                    phoneNum: res.phone,
                    avatar: res.avatar
                });
            },
            // error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
  callPhone: function(){
    wx.makePhoneCall({
      phoneNumber: '4000011139',
    });
  }
});


