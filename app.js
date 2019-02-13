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
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 登录
    wx.login({
      success: res => {
        console.log(res.code);
        console.log(constant.APPID);
        wx.request({
            url: 'https://shopping.juniuo.com/user/login.json',
            method: 'GET',
            data: {
              code: res.code,
              appId: constant.APPID,
              isMock: true, //测试标记
              rawData: ''
            },
            header: {
              'content-type': 'application/json',
            },
            success: (res1) => {
                console.log(res1); 
                if(res1.data.errorCode=='200'){
                  wx.setStorageSync('token', res1.data.data.token);
                  wx.setStorageSync('openid', res1.data.data.openId);
                  wx.setStorageSync('userinfo', JSON.stringify(res1.data.data));
                }else{

                }
                
            }
        })
      }
    });
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
    merchantInfo: null,
    payInfo: null
  }
})