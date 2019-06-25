import {constant} from 'utils/constant';
import {errDialog,loading} from 'utils/util';
import {service} from 'service';
import {ToastPannel} from 'components/toast/toast.js';
App({
    ToastPannel,
    onLaunch: function(options) {
        wx.showShareMenu({
            withShareTicket: true
        });
        console.log('app');
        console.log(options);
        wx.setStorageSync('scene', options.scene);
        if (options.shareTicket) {
            wx.getShareInfo({
                shareTicket: options.shareTicket,
                success: function(res) {
                    console.log(res)
                }
            });
        }

        // 判断是否由分享进入小程序
        if (options.scene == 1007 || options.scene == 1008) {
          this.globalData.share = true
        } else {
          this.globalData.share = false
        };
        //获取设备顶部导航栏的高度（不同设备窗口高度不一样）
        wx.getSystemInfo({
          success: (res) => {
            this.globalData.barHeight = res.statusBarHeight;
            this.globalData.screenHeight = res.screenHeight;
            console.log("状态栏高="+res.statusBarHeight);
            console.log("屏幕高="+res.screenHeight);
          }
        })        
    },
    onHide: function() {
        console.log('App Hide')
    },
    onShow: function(options) {
        console.log(options);
        wx.setStorageSync('scene', options.scene);
        const updateManager = wx.getUpdateManager();
        updateManager.onCheckForUpdate(function(res) {
            console.log("版本更新是否完成===="+res.hasUpdate)
        })
    },
    globalData: {
        locationName: null,
        userInfo: null,
        rawData: null,
        iv: null,
        signature: null,
        share: false,// 分享默认为false
        barHeight:0,
        screenHeight:0
    }
})