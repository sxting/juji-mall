import { errDialog, loading } from '../../utils/util'
import { service } from '../../service';
import { constant } from '../../utils/constant';
var app = getApp();
Page({
    data: {
        nickName: '***',
        avatar: '',
        phoneNum: '',
        bindPhone:""
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
            complete: () => wx.hideToast()
        })
    },
    bindPhone:function(){
        var bindPhone = this.data.bindPhone;
        service.bindPhone({phone:bindPhone}).subscribe({ 
            next: res => {
                wx.showToast({
                    title:"绑定成功",
                    icon:"success"
                });
                this.setData({phoneNum:this.data.bindPhone});
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    getUserPhoneNumber: function(e) {
        var errMsg = e.detail.errMsg;
        if(errMsg = 'getPhoneNumber:ok'){
            let data = {encryptData: e.detail.encryptedData,iv: e.detail.iv}
            service.decodeUserPhone(data).subscribe({
                next: res => {
                    this.setData({bindPhone: res.phoneNumber});
                    this.bindPhone();
                },
                error: err => errDialog(err),
                complete: () => wx.hideToast()
            })
        }
    },
    callPhone: function() {
        wx.makePhoneCall({
            phoneNumber: '4000011139',
        });
    }
});