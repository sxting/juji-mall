// pages/member/index.js
import { service } from '../../service';
import { errDialog, loading } from '../../utils/util'
var app = getApp();

Page({
  data: {
    nvabarData: { showCapsule: 1, title: '开通会员', isIndex: 2 },
  },

  onLoad: function (options) {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#FF6400',
    })
    wx.getSystemInfo({
      success: (res) => {
        var conHeight = res.windowHeight - app.globalData.barHeight - 45;
        this.setData({ conHeight: conHeight })
      }
    });
    
  },

  onShow: function () {

  },

  share: function (obj) {
    service.share(obj).subscribe({
      next: res => {
        console.log('---------分享接口返回--------');
        console.log(res);
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },

  onShareAppMessage: function (res) {
    var obj = {
      type: 'SHARE_PROGRAM',
      sharePath: '/pages/member/index'
    };
    this.share(obj);
    return {
      title: '桔集：聚集优质好店，体验美好生活，加入成为会员吧！',
      imageUrl: '/images/shareImg.png',
      path: '/pages/login/index?pagetype=7&invitecode=' + wx.getStorageSync('inviteCode')
    }
  },

  buy() {

  },
})