import {service} from '../../service';
import {constant} from '../../utils/constant';
var app = getApp();
Page({
  data: {
    constant:{},
    isShowModal: true,
    shopsNearby: [],
    shopact: 0,
    shopName: '',
    shopid: '',
    cardid: '',
    amount: '',
    isShowConfirmModal: true,
    confirmTitle: '',
    confirmContent: '',
    merchantInfo: {}
  },
  onLoad: function(option) {
    this.setData({constant:constant});
    wx.setNavigationBarTitle({title: '立即下单'});
    this.setData({cardid: option.cardid});
    let obj = {};
    obj.merchantId = option.id;
    if (wx.getStorageSync('curLongitude')) {
      obj.lng = wx.getStorageSync('curLongitude')
    }
    if (wx.getStorageSync('curLatitude')) {
      obj.lat = wx.getStorageSync('curLatitude')
    }
    // 附近门店列表
    service.listShops(obj).subscribe({
      next: res => {
        this.setData({
          shopsNearby: res,
          shopid: res[0].id,
          shopName: res[0].name
        });
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  onShow:function(){
    this.getCardPackage();
  },
  getCardPackage:function(){
    service.getCardPackage({
      cardId: this.data.cardid
    }).subscribe({
      next: res => {
        res.merchantLogo = constant.basePicUrl + res.merchantLogo +'/resize_80_0/mode_fill';
        this.setData({merchantInfo: res});
        app.globalData.merchantInfo = res;
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
  selectArea: function() {
    this.setData({
      isShowModal: false
    });
  },
  closeSelectArea: function() {
    this.setData({
      isShowModal: true
    });
  },
  changeShop: function(e) {
    this.setData({
      shopact: e.target.dataset.actindex,
      shopid: e.target.dataset.shopid,
      shopName: e.target.dataset.shopname,
      isShowModal:true
    });
  },
  dataChange: function(event) {
    this.setData({
      amount: event.detail.value
    });
  },
  tapwin:function(){
    console.log('点击边框位置');
  },
  showTips: function(){
    this.setData({
      isShowConfirmModal: false,
      confirmTitle: '提示',
      confirmContent: '使用他人共享的卡下单后扣除9张银票'
    });
  },
  showAlert: function(str){
    this.setData({
      isShowConfirmModal: false,
      confirmTitle: '下单失败',
      confirmContent: str,
      amount:''
    });
  },
  toPayOrder: function() {
    //校验输入的内容
    let reg = /(^[1-9](\d+)?(\.\d{1,2})?$)|(^0$)|(^\d\.\d{1,2}$)/;
    console.log(this.data.amount);
    if (!reg.test(this.data.amount)) {
      this.showAlert('输入的交易金额不符合规则');
      return;
    }
    if (this.data.amount == 0) {
      this.showAlert('请输入正确的交易金额');
      return;
    }
    if(this.data.amount>this.data.merchantInfo.balance){
      this.showAlert('可用余额不足');
      return;
    }
    //创建订单
    wx.showLoading({title: '正在下单...'});
    service.savePreOrder({
      shopId: this.data.shopid,
      cardId: this.data.cardid,
      pay: this.data.amount
    }).subscribe({
      next: res => {
          app.globalData.payInfo = res;
          wx.navigateTo({url: '/pages/payOrder/index'});
      },
      error: err => {
        wx.hideLoading();
        this.showAlert(err);
      },
      complete: () => wx.hideLoading()
    });
  }
})