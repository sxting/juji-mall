import {service} from '../../service';
import { errDialog, loading } from '../../utils/util'
var app = getApp();
Page({
  data: {
    nvabarData: {showCapsule: 0,title: '',isIndex:1},
    showjuzigz: false,
    currentPointObj: {},
    canSignIn: true,
    avatar: '',
    conHeight:400
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.getSystemInfo({
      success: (res) => {
        var conHeight = res.windowHeight-app.globalData.barHeight-45;
        this.setData({conHeight:conHeight})
      }
    });      
    wx.hideShareMenu();
    this.getInfo();
  },
  showDesModal:function(e){
    console.log(e);
    let des = '';
    switch (e.currentTarget.dataset.mt){
      case '1':des = '今日赚取的桔子数量';break;
      case '2':des = '今日小程序内分享的次数';break;
      case '3':des = '今日完成的赚桔子任务';break;
    }
    wx.showModal({
      title: '',
      content: des,
      showCancel:false
    })
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
      // error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },
  toMyTrade: function(){
    wx.navigateTo({
      url: '/pages/myTrade/index'
    });
  },
  signIn:function(e){
    console.log(e.detail.formId)
    service.collectFormIds({
      formId:e.detail.formId
    }).subscribe({
      next: res => {
        console.log(res)
      }
    });
    service.signIn().subscribe({
      next: res => {
        console.log(res);
        if(res){
          this.setData({
            canSignIn: false
          });
          wx.showToast({
            title: '签到成功！',
            icon: 'none'
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
      },
      // error: err => errDialog(err)
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
    this.getInfo();
    service.currentPoint().subscribe({
      next: res => {
        console.log(res);
        this.setData({
          currentPointObj: res,
          canSignIn: res.canSignIn
        });
      },
      error: err => console.log(err),
      complete: () => {
        setTimeout(() => {
          wx.stopPullDownRefresh()
        }, 1000);
      }
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  share: function (obj) {

    service.share(obj).subscribe({
      next: res => {
        console.log('---------分享接口返回--------');
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
      title: JSON.parse(wx.getStorageSync('userinfo')).nickName +'给您分享了桔集小程序，一起享受好店优惠吧！',
      path: '/pages/login/index?invitecode=' + wx.getStorageSync('inviteCode'),
      imageUrl: '/images/shareImg.png'
    }
  }
})