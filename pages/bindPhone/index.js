// pages/bindPhone/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phoneValue: '',
    code: '',
    intextReady: false
  },
  getCode:function(){
    if (this.data.phoneValue.length === 11 && this.isNumber(Number(this.data.phoneValue))) {
      console.log('123456');
    }else{
      console.log('输入的手机号不正确');
    }
  },
  isNumber:function(n){
    return n===+n;
  },
  inphonenum: function(e) {
    if (e.detail.value) {
      if (this.data.code) {
        this.setData({
          phoneValue: e.detail.value,
          intextReady: true
        });
      } else {
        this.setData({
          phoneValue: e.detail.value,
          intextReady: false
        });
      }
    }else{
      this.setData({
        phoneValue: e.detail.value,
        intextReady: false
      });
    }
  },
  incode: function(e) {
    if (e.detail.value) {
      if (this.data.phoneValue) {
        this.setData({
          code: e.detail.value,
          intextReady: true
        });
      } else {
        this.setData({
          code: e.detail.value,
          intextReady: false
        });
      }
    }else{
      this.setData({
        code: e.detail.value,
        intextReady: false
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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