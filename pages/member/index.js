// pages/member/index.js
import { service } from '../../service';
import { errDialog, loading } from '../../utils/util'
var app = getApp();

Page({
  data: {
    nvabarData: { showCapsule: 0, title: '开通会员', isIndex: 2 },
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


})