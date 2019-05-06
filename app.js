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
    },
    onHide: function() {
        console.log('App Hide')
    },
    onShow: function(options) {
        console.log(options);
        wx.setStorageSync('scene', options.scene);
        const updateManager = wx.getUpdateManager()
        updateManager.onCheckForUpdate(function(res) {
            // 请求完新版本信息的回调
            console.log(res.hasUpdate)
        })
        updateManager.onUpdateReady(function() {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success(res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                }
            })
        })
        updateManager.onUpdateFailed(function() {
            // 新版本下载失败
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