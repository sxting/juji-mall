import { service } from '../../service';
import {constant} from '../../utils/constant';
var app = getApp();
Page({
  data: {
    constant:{},
    merchantInfo:{},
    payInfo:{}
  },
  onUnload:function(){
      wx.navigateBack({delta:2});
  },
  onLoad: function (options) {
    this.setData({constant:constant});
    wx.setNavigationBarTitle({title: '交易成功'});
      this.setData({
        merchantInfo:app.globalData.merchantInfo,
        payInfo:app.globalData.payInfo
      });
  },
  toReply: function(){
    wx.navigateTo({url: '/pages/createReply/index?orderId='+this.data.payInfo.orderId});
  }
})