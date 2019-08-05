// pages/jujiGarden/myUserH5/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      // url: 'http://jujiwxapp.juniuo.com/myteam?' + decodeURIComponent('token=' + wx.getStorageInfoSync('token') + '&avatar=' + wx.getStorageInfoSync('avatar') + '&nickName=' + wx.getStorageInfoSync('nickName'))
      url: `https://jujiwxapp.juniuo.com/myteam?token=${wx.getStorageSync('token')}&avatar=${encodeURIComponent(wx.getStorageSync('avatar'))}&nickName=${encodeURIComponent(wx.getStorageSync('nickName'))}` 
    })
  },

  // 接收 h5 页面传递过来的参数
  handlePostMessage: function (e) {
    const data = e.detail;
    console.log(data);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})