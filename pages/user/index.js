var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickName:'微信名字',
    phoneNum:''
  },
  toJuzi:function(){
    console.log('juzi');
    wx.switchTab({
      url: '../juzi/index'
    });
  },
  toPage: function(e) {
      var page = e.currentTarget.dataset.page;
      wx.navigateTo({url: page});
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: '我的' });
    if (app.globalData.userInfo){
      let userinfo = app.globalData.userInfo;
      this.setData({
        nickName: userinfo.nickName,
        phoneNum: userinfo.phone,
        avatar:userinfo.avatar
      });
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

  getInfo:function(){
    service.userInfo({openId:wx.getStorageSync('openId')}).subscribe({
      next: res => {
        this.setData({

        });
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
});