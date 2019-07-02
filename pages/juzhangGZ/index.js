// pages/juzhangGZ/index.js
import { service } from '../../service';
import { errDialog, loading } from '../../utils/util'
var app = getApp();

Page({
  data: {
    nvabarData: { showCapsule: 1, title: '桔长升降级规则' },
  },

  onLoad: function (options) {
    wx.getSystemInfo({
      success: (res) => {
        var conHeight = res.windowHeight - app.globalData.barHeight - 45;
        this.setData({ conHeight: conHeight })
      }
    });
  },

  goBack() {
    wx.navigateBack({
      delta: 1
    })
  }


})