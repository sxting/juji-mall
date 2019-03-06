// pages/payresult/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addMoney:0,
    prepayMoney:0,
    wxPayMoney:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!options.orderId) {
      wx.showModal({
        title: '系统错误',
        content: '未能获取到订单',
      })
      return;
    } else {
      wx.request({
        url: 'https://juji-dev.juniuo.com/customer/order/getOrdersDetail.json',
        method: 'GET',
        data: {
          orderId: options.orderId
        },
        header: {
          'content-type': 'application/json',
          'Access-Token': wx.getStorageSync('accessToken')
        },
        success: (res) => {
           console.log(res);
           if(res.data.errorCode=='0'){
             this.setData({
               addMoney: res.data.data.addMoney?Number(res.data.data.addMoney):0,
               prepayMoney: res.data.data.prepayMoney?Number(res.data.data.prepayMoney):0,
               wxPayMoney: res.data.data.wxPayMoney?Number(res.data.data.wxPayMoney):0
             });
           }else{
             wx.showModal({
               title: '错误: ' + res.data.errorCode,
               content: res.data.errorInfo,
             })
           }
        }
      })
    }
  },

  toCardList:function(){
    wx.redirectTo({
      url: '/pages/cardlist/index',
    });
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

  phoneCall: function(){
    wx.makePhoneCall({
      phoneNumber: '4000011139'
    })
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