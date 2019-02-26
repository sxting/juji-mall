import {
  constant
} from '../../utils/constant';
import {
  service
} from '../../service';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fromPage:'',
    productId:'',
    inviteCode:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu();
    console.log('---------授权页面----------');
    console.log(options);
    if (options.fromPage && options.productId){
      this.setData({
        fromPage: options.fromPage,
        productId: options.productId,
        inviteCode: options.inviteCode
      });
    }
    wx.getSetting({
      success: (res) => {
        console.log(res.authSetting['scope.userInfo']);
        if (res.authSetting['scope.userInfo']) {
          wx.reLaunch({
            url: '/pages/index/index'
          });
        }
      }
    });
  },
  getUserInfo: function(e) {
    console.log(e);
    if (e.detail.userInfo) {
      wx.setStorageSync('rawData', e.detail.rawData);
      if (e.currentTarget.dataset.pid && e.currentTarget.dataset.fp){
        wx.reLaunch({
          url: '/pages/' + e.currentTarget.dataset.fp + '/index?id=' + e.currentTarget.dataset.pid + '&inviteCode=' + e.currentTarget.dataset.inv,
        });
      } else {
        wx.reLaunch({
          url: '/pages/index/index',
        });
      }


    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})