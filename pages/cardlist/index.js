// pages/cardlist/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardList:[],
    current: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      wx.request({
        url: constant.jujipayUrl +'/mini/mycard.json',
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'Access-Token': wx.getStorageSync('accessToken')
        },
        success: (res) => {
          console.log(res);
          if(res.data.errorCode=='0'){
            this.setData({
              cardList: res.data.data
            });
            console.log(this.data.cardList)
          }else{
            wx.showModal({
              title: '错误：'+res.data.errorCode,
              content: res.data.errorInfo,
            })
          }
        }
      })

  },
  toRecord: function(e){
    console.log(e);
    wx.navigateTo({
      url: '/pages/payrecord/index?merchantId=' + e.currentTarget.dataset.mid,
    })
  },
  toggleCard:function(e){//切换卡片高度
      console.log(e);
      this.setData({
        current: e.currentTarget.dataset.index
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