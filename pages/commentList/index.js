import {service} from '../../service';
var app = getApp();
Page({
  data: {
    commentlist: [{},{}]
  },

  getComments:function(obj){

  },

  toCommentDetail:function(){

  },

  //下拉刷新
  onPullDownRefresh() {

  },

  //上拉加载
  onReachBottom() {

  },

  onLoad: function(options) {
      wx.setNavigationBarTitle({ title: '全部评价', });
  }
})