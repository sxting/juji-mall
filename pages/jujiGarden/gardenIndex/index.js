import { errDialog, loading } from '../../../utils/util'
import { service } from '../../../service';
import { constant } from '../../../utils/constant';
var app = getApp();
Page({
    data: {
        status:'3',
        juminNumList: [],//队员人数
        hadNumber: 2
    },
    apply:function(e){
        this.setData({status:'2'});
    },
    toPage: function(e) {
        var page = e.currentTarget.dataset.page;
        wx.navigateTo({ url: page });
    },
    onLoad: function() {
        wx.setNavigationBarTitle({ title: '桔园' });
        this.data.juminNumList = [];
        if (this.data.hadNumber > 0) {
          for (let i = 0; i < this.data.hadNumber; i++) {
            let list = 'yes';
            this.data.juminNumList.push(list);
          }
          for (let j = 0; j < (10 -  parseInt(this.data.hadNumber)); j++){
            this.data.juminNumList.push('');
          }
        }
        this.setData({
          juminNumList: this.data.juminNumList,
        })
    },
    onShow: function() {
        this.getInfo();
    },
    getInfo: function() {
        service.userInfo({ openId: wx.getStorageSync('openid') }).subscribe({
            next: res => {
                this.setData({

                });
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
});