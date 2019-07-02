// pages/memberzq/index.js
import { service } from '../../service';
var app = getApp();

Page({
  data: {
    nvabarData: { showCapsule: 0, title: '' },
    locationPcode: '',
    locationCode: '',
    locationName: '',
    recommendPage: [
      {},
      {},
    ],
    sortIndex: 1,
    pageNo: 1,
    pageSize: 5,
    providerId: '',
    pullUpFlag: true,
    sortField: 'IDX'
  },

  onLoad: function (options) {
    this.getCurLocation();
    // this.getRecommendPage();
  },

  onShow: function () {
    var that = this;
  },

  getCurLocation: function () {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        wx.setStorageSync('curLatitude', res.latitude);
        wx.setStorageSync('curLongitude', res.longitude);
        console.log('--------位置调用成功--------');
        var obj = {
          latitude: res.latitude,
          longitude: res.longitude
        }
      },
      fail: function (err) {
        console.log('---------位置调用失败或是被拒绝--------');
        console.log(err);
        wx.showModal({
          title: '无法获取地理位置',
          content: '无法获取附近的优惠信息，您可以在小程序设置界面（「右上角」 - 「关于」 - 「右上角」 - 「设置」）中设置对该小程序的授权状态，并在授权之后重启小程序。'
        })
      }
    })
  },

  //跳转到商品详情
  toComDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    var storeid = e.currentTarget.dataset.storeid;
    console.log(id);
    wx.navigateTo({
      url: '/pages/comDetail/index?referer=0&id=' + id + '&storeid=' + storeid
    });
  },

  toPage() {
    wx.navigateTo({
      url: '/pages/member/index'
    });
  },

  getRecommendPage: function () {
    var obj = {
      providerId: this.data.providerId,
      type: 'POINT',
      sortField: 'IDX',
      sortOrder: 'ASC',
      pageNo: this.data.pageNo,
      pageSize: this.data.pageSize
    };
    service.getRecommendPage(obj).subscribe({
      next: res => {
        console.log(res);
        this.setData({
          recommendPage: res.list
        });
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    //判断是否还可以上拉
    if (this.data.pullUpFlag) {
      let p = ++this.data.pageNo;
      console.log('page:' + p);

      let obj = {
        providerId: this.data.providerId,
        type: 'POINT',
        sortField: this.data.sortField,
        sortOrder: this.data.sortArray[Number(this.data.sortIndex) - 1],
        pageNo: p,
        pageSize: this.data.pageSize,
        longitude: wx.getStorageSync('curLongitude'),
        latitude: wx.getStorageSync('curLatitude')
      };

      service.getRecommendPage(obj).subscribe({
        next: res => {
          console.log(res);
          this.setData({
            recommendPage: this.data.recommendPage.concat(res.list)
          });
          if (res.countPage <= this.data.pageNo) {
            this.setData({
              pullUpFlag: false
            });
          }
        },
        error: err => console.log(err),
        complete: () => wx.hideToast()
      });
    } else {
      return;
    }
  },
})