var util = require('../../utils/util.js');
import {
  service
} from '../../service';
import {
  constant
} from '../../utils/constant';
var app = getApp();
Page({
  data: {
    productId: '',
    storeId: '',
    showPics: [],
    commentList: [],
    productInfo: {},
    description:[],
    recommendList: [],
    store: {},
    commentCount: 0,
    recommendCount: 0,
    pointBalance: 0,
    note:[],
    despImgHeightValues:[]
  },
  onLoad: function(option) {
    wx.setNavigationBarTitle({
      title: '商品详情'
    });
    console.log(option);
    if (!option.id) {
      wx.showToast({
        title: '发生错误，未找到商品id',
        icon: 'none'
      })
      wx.navigateBack({
        delta: 1
      });
      return ;
    } 
    console.log(wx.getStorageSync('curLatitude'));
    console.log(wx.getStorageSync('curLongitude'));
    let lat = wx.getStorageSync('curLatitude');
    let lng = wx.getStorageSync('curLongitude');
    this.setData({
      productId: option.id,
      storeId: option.storeid
    });
    this.getItemInfo();
    //查询用户橘子
    this.getPointBalance();

  },
  toMerchantsList:function(){
    wx.navigateTo({
      url: '/pages/merchantsCanUse/index?id=' + this.data.productId 
    });
  },
  toCreateOrder: function() { //跳转订单确认 桔子和人民币组合订单
    wx.navigateTo({
      url: '/pages/payOrder/index?paytype=1&id=' + this.data.productId + '&storeid=' + this.data.storeId
    });
  },
  toCreateOrderByPoint: function() { //只用桔子下单
    wx.navigateTo({
      url: '/pages/payOrder/index?paytype=2&id=' + this.data.productId + '&storeid=' + this.data.storeId
    });
  },
  toCreateOrderByRmb: function() { //只用人民币下单
    wx.navigateTo({
      url: '/pages/payOrder/index?paytype=3&id=' + this.data.productId + '&storeid=' + this.data.storeId
    });
  },
  toGetPoint: function() { //跳转到任务页面赚桔子
    wx.switchTab({
      url: '../juzi/index'
    });
  },
  getPointBalance: function() {

    service.getPointBalance().subscribe({
      next: res => {
        console.log('--------查询桔子余额-------');
        console.log(res);
        this.setData({
          pointBalance: res
        });
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  toComDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    var storeid = e.currentTarget.dataset.storeid;
    console.log(id);
    wx.navigateTo({
      url: '/pages/comDetail/index?id=' + id + '&storeid=' + storeid
    });
  },
  onShow: function() {
    //评论列表
  },
  call: function() {
    wx.makePhoneCall({
      phoneNumber: this.data.store.phone // 仅为示例，并非真实的电话号码
    })
  },
  getItemInfo: function() {
    service.getItemInfo({
      productId: this.data.productId,
      storeId: this.data.storeId
    }).subscribe({
      next: res => {
        console.log(res);
        var picsStrArr = res.product.picIds.split(',');
        picsStrArr.forEach(function(item,index){
          picsStrArr[index] = constant.basePicUrl + item + '/resize_0_0/mode_fill'
        });
        this.setData({
          commentList: res.commentList,
          productInfo: res.product,
          description: JSON.parse(res.product.description),
          recommendList: res.recommendList,
          store: res.store,
          commentCount: res.commentCount,
          recommendCount: res.recommendList.length,
          note: JSON.parse(res.product.note),
          showPics: picsStrArr
        });
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  desImgLoad: function (event){
    console.log(event.detail);
    var arr = this.data.despImgHeightValues;
    arr.push(event.detail.height * 690 / event.detail.width);
    this.setData({
      despImgHeightValues: arr
    });
  },
  gohomepage: function() {
    wx.switchTab({
      url: '/pages/index/index'
    });
    //getCurrentPages() 函数用于获取当前页面栈的实例，以数组形式按栈的顺序给出，第一个元素为首页，最后一个元素为当前页面
    // wx.navigateBack({
    //   delta: getCurrentPages().length,
    //   url: '/pages/index/index'
    // });
  },
  toCommentList: function() {
    wx.navigateTo({
      url: '/pages/commentList/index?id=' + this.data.productId
    });
  },
  toShareCard: function() {
    wx.navigateTo({
      url: '/pages/shareCard/index?merchantId=' + this.data.merchantId
    });
  },
  share: function (obj){
    
    service.share(obj).subscribe({
      next: res=>{
        console.log('---------分享返回--------');
        console.log(res);
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  /**
   * 用户点击右上角分享或页面中的分享
   */
  onShareAppMessage: function(res) {
    console.log(res);
    var type = this.data.productInfo.type;
    var obj = {};
    if (type == 'POINT') {
      obj.type = 'SHARE_EXCHANGE';
    } else {
      obj.type = 'SHARE_PRODUCT';
    }
    obj.sharePath = '/pages/comDetail/index?id=' + this.data.productId + '&storeid=' + this.data.storeId;
    this.share(obj);
    return {
      title: '朋友给你分享了优惠商品，快来看看吧！',
      path: '/pages/comDetail/index?id=' + this.data.productId + '&storeid=' + this.data.storeId
    }
  },
  toCommentDetail: function(event) {
    wx.navigateTo({
      url: '/pages/commentDetail/index?id=' + event.currentTarget.dataset.comid
    });
  }
})