// pages/payrecord/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recordList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options.merchantId = '101542271446184185';
    if (options.merchantId){
      wx.request({
        url: 'https://juji-dev.juniuo.com/mini/payRecords.json',
        method: 'GET',
        data: {
          merchantId: options.merchantId
        },
        header: {
          'content-type': 'application/json',
          'Access-Token': wx.getStorageSync('accessToken')
        },
        success: (res) => {
          console.log(res);
          if (res.data.errorCode == '0') {
            this.setData({
              recordList: res.data.data.list
            });
            console.log(this.data.recordList)
          } else {
            wx.showModal({
              title: '错误：' + res.data.errorCode,
              content: res.data.errorInfo,
            })
          }
        }
      })
    }else{
      wx.showModal({
        title: '系统错误',
        content: '未能获取到商户信息',
      });
      return ;
    }
    
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