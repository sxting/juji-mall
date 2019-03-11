// pages/jujiGarden/orderDetail/orderDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productUrl: '/images/newerGetBg.png',
    phone: '15210921650'


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '订单详情',
    })
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

  /**  拨打电话  **/
  onTelClick() {
    let self = this;
    wx.makePhoneCall({
      phoneNumber: self.data.phone
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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