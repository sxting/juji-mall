import {
  constant
} from '../../utils/constant';
import {
  service
} from '../../service';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {showCapsule: 1,title: '支付结果'},
    addMoney:0,
    prepayMoney:0,
    wxPayMoney:0,
    payUrl: 'https://juji.juniuo.com',
    showDetail: false,
    recommendList: [],
    type:'',
    point: 0,
    preBalance: 0,
    balance: 0,
    givingMoney: 0,
    aMoney:0, //储值金额 不算赠送
    zhuheAmount: 0,
    providerId: '',
    merchantId:'',
     yiye: false,
      yiyeInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!options.orderId) {
      wx.showModal({
        title: '系统错误',
        content: '未能获取到订单',
      })
      return;
    } else {
      let payUrl = wx.getStorageSync('payUrl');
      if (payUrl) {
        this.setData({
          payUrl: payUrl
        });
      } else {
        this.setData({
          payUrl: constant.jujipayUrl
        });
      }
      if(options.from && options.from === 'yiye') {
          this.setData({
              yiye: true
          })
          service.crossOrderState({ orderId: options.orderId }).subscribe({
              next: res => {
                  if (res.status == 'PAID') {
                      this.setData({
                          yiyeInfo: res
                      })
                  }
              },
              error: err => console.log(err),
              complete: () => wx.hideToast()
          })
      } else {
          this.setData({
              yiye: false
          })
          wx.request({
              url: this.data.payUrl + '/customer/order/getOrdersDetail.json',
              method: 'GET',
              data: {
                  orderId: options.orderId
              },
              header: {
                  'content-type': 'application/json',
                  'Access-Token': wx.getStorageSync('accessToken')
              },
              success: (res) => {
                  console.log(res);
                  if (res.data.errorCode == '0') {
                      this.setData({
                          type: res.data.data.type,
                          zhuheAmount: res.data.data.wxPayMoney && res.data.data.wxPayMoney > 0 && res.data.data.prepayMoney > 0 ? (Number(res.data.data.prepayMoney) + Number(res.data.data.wxPayMoney)).toFixed(2) : res.data.data.prepayMoney,
                          aMoney: res.data.data.givingMoney ? (Number(res.data.data.addMoney) - Number(res.data.data.givingMoney)).toFixed(2) : res.data.data.addMoney,
                          givingMoney: res.data.data.givingMoney ? res.data.data.givingMoney : 0,
                          preBalance: res.data.data.preBalance ? res.data.data.preBalance : 0,
                          balance: res.data.data.accountDto.balance,
                          point: res.data.data.point,
                          addMoney: res.data.data.addMoney ? Number(res.data.data.addMoney) : 0,
                          prepayMoney: res.data.data.prepayMoney ? Number(res.data.data.prepayMoney) : 0,
                          wxPayMoney: res.data.data.wxPayMoney ? Number(res.data.data.wxPayMoney) : 0
                      });
                      this.setData({ merchantId: res.data.data.accountDto.merchantId })
                      var obj = {
                          latitude: res.data.data.store.lat,
                          longitude: res.data.data.store.lng
                      }
                      this.setData({ providerId: res.data.data.agentId });
                      wx.request({
                          url: constant.apiUrl + '/recommend/hot.json',
                          method: 'GET',
                          data: {
                              providerId: res.data.data.agentId,
                              merchantId: this.data.merchantId,
                              storeId: res.data.data.accountDto.storeId
                          },
                          success: (res2) => {
                              console.log(res2);
                              if (res2.data.errorCode == '200') {
                                  this.setData({
                                      recommendList: res2.data.data
                                  })
                              }
                          }
                      })
                  } else {
                      wx.showModal({
                          title: '错误: ' + res.data.errorCode,
                          content: res.data.errorInfo,
                      })
                  }
              }
          });
      }
    }
  },

  toCardList:function(){
    wx.navigateTo({
      url: '/pages/cardlist/index',
    });
  },

  onShow: function () {
    // wx.setStorageSync('scene', '1011');//测试用
    let scene = wx.getStorageSync('scene');
    if (scene == '1011' || scene == '1012' || scene == '1013') {//扫描二维码场景值
      return;
    } else {
      wx.reLaunch({
        url: '/pages/index/index?referer=3',
      })
    }
  },
  //切换详情的隐藏与显示
  toggleDetailWrap: function(){
    this.setData({
      showDetail: !this.data.showDetail
    });
  },
  goIndex: function(){
    wx.reLaunch({
      url: '/pages/index/index?referer=3',
    });
  },
  toComDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    var storeid = e.currentTarget.dataset.storeid;
    console.log(id);
    wx.navigateTo({
      url: '/pages/comDetail/index?referer=3&id=' + id + '&storeid=' + storeid
    });
  },
  phoneCall: function(){
    wx.makePhoneCall({
      phoneNumber: '4000011139'
    })
  },

    goOrderDetail() {
        wx.navigateTo({
            url: '/pages/orderDetail/index?id=' + this.data.yiyeInfo.productOrderId,
        })
    },

    goBack() {
        wx.navigateBack({ delta: 2 });
    }
})