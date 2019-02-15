import {
  service
} from '../../service';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showjuzigz: false,
    currentPointObj: {},
    canSignIn: true,
    avatar: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
    this.getInfo();
    //查询新用户见面礼

  },
  toJuzihl: function () {
    wx.navigateTo({
      url: '../juzihl/index'
    });
  },
  toIndex: function () {
    wx.switchTab({ url: '../index/index' });
  },
  toMyOrder: function () {
    wx.navigateTo({ url: '/pages/orderlist/index?index=3&status=CONSUME'});
  },
  getInfo: function () {
    service.userInfo({ openId: wx.getStorageSync('openid') }).subscribe({
      next: res => {
        this.setData({
          avatar: res.avatar
        });
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },
  toMyTrade: function(){
    wx.navigateTo({
      url: '/pages/myTrade/index'
    });
  },
  signIn:function(){
    service.signIn().subscribe({
      next: res => {
        console.log(res);
        if(res){
          this.setData({
            canSignIn: false
          });
          this.currentPoint();
        }
      }
    });
  },
  currentPoint: function () {
    service.currentPoint().subscribe({
      next: res => {
        console.log(res);
        this.setData({
          currentPointObj:res,
          canSignIn: res.canSignIn
        });
      }
    });
  },
  closejuzigzModal: function() {
    this.setData({
      showjuzigz: false
    });
  },
  juzigzModal: function() {
    if (this.data.showjuzigz) {
      this.setData({
        showjuzigz: false
      });
    } else {
      this.setData({
        showjuzigz: true
      });
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
    this.currentPoint();
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
  share: function (obj) {

    service.share(obj).subscribe({
      next: res => {
        console.log('---------分享返回--------');
        console.log(res);
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var obj = {
      type:'SHARE_PROGRAM',
      sharePath: '/pages/index/index'
    };
    this.share(obj);
    return {
      title: '朋友给你分享了桔集生活，快来看看吧！',
      path: '/pages/index/index'
    }
  }
})