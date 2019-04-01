import {
  service
} from '../../service';
import { constant } from '../../utils/constant';
var app = getApp();
Page({
  data: {
    commentlist: [],
    pageNo: 1,
    pageSize: 10
  },
  previewImage: function (e) {
    var arr = [];
    var url = constant.basePicUrl + e.currentTarget.dataset.url + '/resize_0_0/mode_fill';
    arr.push(url);
    wx.previewImage({
      urls: arr // 需要预览的图片http链接列表
    })
  },

  getComments: function(obj) {

  },

  toCommentDetail: function() {

  },

  //下拉刷新
  onPullDownRefresh() {

  },

  //上拉加载
  onReachBottom() {

  },
  commentPage: function(id) {
    service.commentPage({
      productId: id,
      pageNo: this.data.pageNo,
      pageSize: this.data.pageSize
    }).subscribe({
      next: res => {
        console.log('------所有评论-----');
        console.log(res);
        this.setData({
          commentlist:res.list
        });
      },
      error: err => console.log(err)
    })
  },

  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '用户评价',
    });
    wx.hideShareMenu();
    console.log(options);
    if (options.id) {
      this.commentPage(options.id);
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

  }
})