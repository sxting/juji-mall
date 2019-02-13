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
    console.log('app');
    
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
    userInfo: null,
    rawData: null,
    iv: null,
    signature:null
  }
})