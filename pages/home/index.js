import { errDialog, loading} from '../../utils/util'
import {constant} from '../../utils/constant';
import {service} from '../../service';
Page({
  data: {
    constant:constant,
    curCity: '',
    nextPage: '',
    tablist: ['全部', '美食/休闲', '丽人/丽发'],
    curTabIndex: 0,
    isShowNodata: false,
    banners: ['../../images/banner1.png'],
    indicatorDots: true,
    autoplay: true,
    merchantListAll: [],
    merchantList: []
  },
  toCitylist: function() {
    this.data.nextPage = 'citylist';
    wx.navigateTo({url: '../citylist/index'});
  },
  toBusinessDetail: function(e) {
    var cardtype = e.currentTarget.dataset.type;
    var merchantId = e.currentTarget.dataset.id;
    this.data.nextPage = 'business';
    wx.navigateTo({ url: '../businessDetails/index?cardType=' + cardtype + '&id=' + merchantId});
  },
  switchTab: function(e) {
    var thisIndex = e.currentTarget.dataset.index;
    this.setData({
      curTabIndex: thisIndex
    });
  },
  switchTab: function(e) {
    var thisType = e.currentTarget.dataset.type;
    this.setData({
      curTabIndex: e.currentTarget.dataset.index
    });
    if (thisType == 0) {
      this.setData({
        merchantList: this.data.merchantListAll
      });
    } else {
      this.setData({
        merchantList: this.getMerchantListByType(thisType)
      });
    }
    this.setData({
      isShowNodata: this.data.merchantList.length == 0
    });
  },
  getMerchantListByType: function(type) {
    var merchantArr = this.data.merchantListAll;
    var newArr = [];
    for (var i = 0; i < merchantArr.length; i++) {
      if (merchantArr[i].type == type) {
        newArr.push(merchantArr[i]);
      }
    }
    return newArr;
  },
  getBannerList: function() {
    service.listBanners().subscribe({
      next: res => {
        this.setData({banners:res});
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },
  getMerchantList: function() {
    console.log('lng:' + wx.getStorageSync('curLongitude'));
    console.log('lat:' + wx.getStorageSync('curLatitude'));
    let obj = {cityId:''};
    if (wx.getStorageSync('curLongitude')) {
      obj.lng = wx.getStorageSync('curLongitude')
    }
    if (wx.getStorageSync('curLatitude')) {
      obj.lat = wx.getStorageSync('curLatitude')
    }
    service.listMerchants(obj).subscribe({
      next: res => {
        this.setData({
          merchantListAll: res,
          merchantList: res,
          isShowNodata: res.length == 0
        });
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },
  onShow: function() {
    if (this.data.nextPage == 'citylist') {
      // this.getMerchantList();
      // this.setData({curCity: wx.getStorageSync('curCity')});
    }
  },
  onLoad: function(options) {
    wx.setNavigationBarTitle({title: '商家'});
    // this.getBannerList();
    this.getMerchantList();
    this.setData({curCity: '北京'});
    // this.setData({curCity: wx.getStorageSync('curCity')});
  }
})