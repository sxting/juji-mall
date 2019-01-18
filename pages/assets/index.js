import { errDialog, loading } from '../../utils/util'
import { constant } from '../../utils/constant';
import { service } from '../../service';
Page({
  data: {
  	balance:0.00
  },
  toPath:function(event){
    var targetUrl=event.currentTarget.dataset['page'];
    wx.navigateTo({url: targetUrl})
  },
  getWallet:function(){
  	service.getWallet({
  		openId:""
  	}).subscribe({
      next: res => {
      	this.setData({balance:res.balance})
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },
  gerRecord:function(){
  	service.walletRecord({
  		openId:wx.getStorageSync('openId')
  	}).subscribe({
      next: res => {

      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },
  onLoad: function(options) {
    wx.setNavigationBarTitle({title: '钱包'});
    this.getWallet();
  }
})