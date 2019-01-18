import { constant } from 'utils/constant';
import { errDialog, loading } from 'utils/util';
import { service } from 'service';
import { ToastPannel } from 'components/toast/toast.js';
App({
    ToastPannel,
    onLaunch: function(options) {
        var logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)
        // 登录
        wx.login({
            success: res => {
                wx.request({
                    url: 'https://w.juniuo.com/xppWxapp/login.json',
                    method: 'POST',
                    data: {
                        code: res.code,
                        appid: constant.APPID,
                        tplid: constant.TPLID,
                        fromUserId:options.query.userId||''
                    },
                    header: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    success: (res) => {
                        if (res.data.success) {
                            wx.setStorageSync('accessToken', res.data.data);
                            this.getMyInfo();
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
        merchantInfo:null,
        payInfo:null
    }
})