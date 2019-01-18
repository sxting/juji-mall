import { service } from '../../service';
import { constant } from '../../utils/constant';
var app = getApp();

Page({
    data: {
        constant:{},
        merchantInfo: {},
        amount: 1,
        shopsNearby: [],
        shopact: 0,
        shopid: '',
        cardId: '',
        shopName: '',
        isShowConfirmModal: true,
        confirmTitle: '',
        confirmContent: '',
        isDisabled:false,
        isShowModal: true
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '立即下单' });
        this.setData({cardid:options.cardid});
        this.getMerchantList(options.id);
    },
    getCardPackage:function(){
      service.getCardPackage({cardId: this.data.cardid}).subscribe({
          next: res => {
            res.merchantLogo = constant.basePicUrl + res.merchantLogo +'/resize_80_0/mode_fill';
            app.globalData.merchantInfo = res;
            this.setData({constant:constant});
            this.setData({merchantInfo:res});
          },
          error: err => console.log(err),
          complete: () => wx.hideToast()
      });
    },
    showTips: function(){
      this.setData({
        isShowConfirmModal: false,
        confirmTitle: '提示',
        confirmContent: '使用他人共享的卡下单后扣除9张银票'
      });
    },
    getMerchantList: function(id){
      let obj = {};
      obj.merchantId = id;
      if (wx.getStorageSync('curLongitude')) {
        obj.lng = wx.getStorageSync('curLongitude')
      }
      if (wx.getStorageSync('curLatitude')) {
        obj.lat = wx.getStorageSync('curLatitude')
      }
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
      });
    },
    onShow:function(){
      this.getCardPackage();
    },
    delNumber: function() {
        var thisNum = this.data.amount - 1;
        if (thisNum <= 0) { return; }
        this.setData({ amount: thisNum });
    },
    addNumber: function() {
        var thisNum = this.data.amount + 1;
        this.setData({ amount: thisNum });
    },
    selectArea: function() {
        this.setData({isShowModal:false});
    },
    closeSelectArea: function() {
        this.setData({isShowModal:true});
    },
    changeShop: function(e) {
        this.setData({
            shopact: e.target.dataset.actindex,
            shopid: e.target.dataset.shopid,
            shopName: e.target.dataset.shopname,
            isShowModal:true
        });
    },
    showAlert(str){
      this.setData({
        isShowConfirmModal: false,
        confirmTitle: '下单失败',
        confirmContent: str,
        amount:1
      });
    },
    saveOrder:function(){
      if(this.data.amount>this.data.merchantInfo.times){
        this.showAlert('剩余可用次数不足');
        return;
      }
      wx.showLoading({title: '正在下单...'});
      service.savePreOrder({
          shopId: this.data.shopid,
          cardId: this.data.cardid,
          payTimes: this.data.amount
      }).subscribe({
          next: res => {
              app.globalData.payInfo = res;
              wx.navigateTo({ url: '/pages/payOrder/index' });
          },
          error: err => {
            wx.hideLoading();
            this.showAlert(err);
          },
          complete: () => wx.hideLoading()
      });
    }
})