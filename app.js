import {
  constant
} from 'utils/constant';
import {
  errDialog,
  loading
} from 'utils/util';
import {
  service
} from 'service';
import {
  ToastPannel
} from 'components/toast/toast.js';
App({
  ToastPannel,
  onLaunch: function(options) {
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
    wx.showShareMenu({
      withShareTicket: true
    });
    console.log('app');
    console.log(options);
    wx.setStorageSync('scene', options.scene);
    if (options.shareTicket) {
      wx.getShareInfo({
        shareTicket: options.shareTicket,
        success: function (res) { 
          console.log(res)
        }
      });
    }
    
  },
  onHide: function(){
    console.log('App Hide')
  },
  onShow: function (options){
    console.log(options);
    wx.setStorageSync('scene', options.scene);
  },
  getMyInfo: function() {
    service.getMyInfo().subscribe({
      next: res => {
        if (res.name) {
          this.globalData.userInfo = res;
        }
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },
  globalData: {
    locationName: null,
    userInfo: null,
    rawData: null,
    iv: null,
    signature: null
  }
})