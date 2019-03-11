// pages/jujiGarden/gardenHome/gardenHome.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    juyuanBgFrist: '/images/juyuan-bg1.jpg',
    juyuanBgSecond: '/images/juyuan-bg2.jpg',
    juminNumList: [],//队员人数
    hadNumber: 2
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.juminNumList = [];
    if (this.data.hadNumber > 0) {
      for (let i = 0; i < this.data.hadNumber; i++) {
        let list = 'yes';
        this.data.juminNumList.push(list);
      }
      for (let j = 0; j < (10 -  parseInt(this.data.hadNumber)); j++){
        this.data.juminNumList.push('');
      }
    }
    this.setData({
      juminNumList: this.data.juminNumList,
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

  /**
   * 邀请新人加入桔园
   */
  inviteNewMembers: function (res) {
    return {
      title: JSON.parse(wx.getStorageSync('userinfo')).nickName + '邀请您桔园结义成为桔长，购物最高可享40%商品返利',
      path: '',
      imageUrl: ''
    }
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