import {
  service
} from '../../service';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    merchantsList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '适用门店',
    });
    wx.hideShareMenu();
    if (options.id) {
      this.applyStoreList(options.id)
    } else {
      wx.showToast({
        title: '发生错误，未找到商品id',
        icon: 'none'
      })
      wx.navigateBack({
        delta: 1
      });
      return;
    }
  },
  applyStoreList: function(id) {
    service.applyStoreList({
      productId: id
    }).subscribe({
      next: res => {
        console.log('------适用门店列表------');
        console.log(res);
        this.setData({
          merchantsList:res
        })
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
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