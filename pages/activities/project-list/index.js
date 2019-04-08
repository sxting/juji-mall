// pages/activities/project-list/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sceneType: 'PINTUAN',//查看进入的是什么场景类型
    productList: ['','',''],
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({ 
      title: options.sceneType == 'PINTUAN'? '拼团列表': '砍价列表'
    });
    this.setData({
      // sceneType: options.sceneType
    })

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('加载');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 跳转我的砍价或者我的拼团页面
   */
  switchToOrderListPage: function(){

  },

  /**
   * 到项目详情
   */
  checkProductDetail: function(e){
    wx.navigateTo({
      url: '/pages/activities/project-detail/index?sceneType=' + this.data.sceneType + '&productId=' + e.currentTarget.dataset.productid
    });
  },
})