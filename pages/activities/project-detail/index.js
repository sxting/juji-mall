var util = require('../../../utils/util.js');
import { service } from '../../../service';
import { activitiesService } from '../shared/service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
var app = getApp();
Page({
  data: {
    productId: '',
    storeId: '',
    showPics: [],
    commentList: [],
    productInfo: {},
    description: [],
    recommendList: [],
    store: {},
    commentCount: 0,
    recommendCount: 0,
    pointBalance: 0,
    note: [],
    despImgHeightValues: [],
    isShowData: false,
    isHiddenClose: false,
    windowWidth: 345,
    windowHeight: 430,
    headImg: '',
    erwmImg: '',
    userImg: '',
    sceneId: '',
    isShowNewerGet: false,
    nickName: '',
    lat: '',
    lng: '',
    shared: 0,//首页分享按钮进入值为1
    type: '',
    activityOrderId: '',
    activityId: '',
    resData: '',
  },
  onLoad: function (options) {
    if (options.shared) {
      this.setData({ shared: options.shared });
    }
    wx.setNavigationBarTitle({ title: '商品详情' });
    // 2019041017405721382048345
    this.setData({ 
      productId: options.id, 
      activityId: options.activityId,
      type: options.type ? options.type : '' 
    });
    if (options.storeid) {
      this.setData({ storeId: options.storeid });
    }
    if (options.sceneid) {
      this.setData({ sceneId: options.sceneid });
    }
    // 查询商品详情
    getItemInfo.call(this);
  },
  onShow: function () {
    //评论列表
  },
  onShareAppMessage(res) {
    console.log(res);
    // this.share();
    if (res.from === 'button' && res.target.dataset.type === 'share2') {
      // 分享砍价
      return {
        title: JSON.parse(wx.getStorageSync('userinfo')).nickName + '分享给您一个心动商品，快来一起体验吧！',
        path: '/pages/login/index?pagetype=projectDetail&type=' + this.data.type + '&activityId=' + this.data.activityId + '&activityOrderId=' + this.data.activityOrderId,
        success: function (res) {
          console.log(res);
        },
        fail: function (res) {
          console.log(res);
        }
      }
    } else {
      // 分享商品
      return {
        title: JSON.parse(wx.getStorageSync('userinfo')).nickName + '分享给您一个心动商品，快来一起体验吧！',
        path: '/pages/login/index?pagetype=projectDetail&type=' + this.data.type + '&activityId=' + this.data.activityId,
        success: function (res) {
          console.log(res);
        },
        fail: function (res) {
          console.log(res);
        }
      }
    }
  },
  previewImage: function (e) {
    var arr = [];
    var url = constant.basePicUrl + e.currentTarget.dataset.url + '/resize_0_0/mode_fill';
    arr.push(url);
    wx.previewImage({
      urls: arr // 需要预览的图片http链接列表
    })
  },
  toMap: function (e) {
    if (e.currentTarget.dataset.lat && e.currentTarget.dataset.lng) {
      wx.navigateTo({
        url: '/pages/map/index?lat=' + e.currentTarget.dataset.lat + '&lng=' + e.currentTarget.dataset.lng,
      });
    }
  },
  
  callPhone: function () {
    wx.makePhoneCall({
      phoneNumber: '4000011139',
    });
  },
 
  toMerchantsList: function () {
    wx.navigateTo({
      url: '/pages/merchantsCanUse/index?id=' + this.data.productId
    });
  },
 
  toComDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    var storeid = e.currentTarget.dataset.storeid;
    wx.navigateTo({
      url: '/pages/comDetail/index?id=' + id + '&storeid=' + storeid
    });
  },
  call: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.store.phone 
    })
  },
  desImgLoad: function (event) {
    var arr = this.data.despImgHeightValues;
    arr.push(event.detail.height * 690 / event.detail.width);
    this.setData({
      despImgHeightValues: arr
    });
  },
  gohomepage: function () {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },
  toCommentList: function () {
    wx.navigateTo({
      url: '/pages/commentList/index?id=' + this.data.productId
    });
  },
  share: function () {
    var obj = {
      type: 'SHARE_PRODUCT',
      sharePath: '/pages/index/index'
    };
    service.share(obj).subscribe({
      next: res => {},
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
 
  // onShareAppMessage: function (res) {
  //   this.share();
  //   return {
  //     title: JSON.parse(wx.getStorageSync('userinfo')).nickName + '分享给您一个心动商品，快来一起体验吧！',
  //     path: '/pages/login/index?pagetype=projectDetail&type=' + this.data.type + '&activityId=' + this.data.activityId + '&activityOrderId=' + this.data.activityOrderId,
  //     success: function (res) {
  //       console.log(res);
  //       this.setData({
  //         showAlert1: true,
  //         showAlert2: false
  //       });
  //     },
  //     fail: function (res) {
  //       console.log(res);
  //     }
  //   }
  // },

  toCommentDetail: function (event) {
    wx.navigateTo({
      url: '/pages/commentDetail/index?id=' + event.currentTarget.dataset.comid
    });
  },
});

function getItemInfo() {
  let that = this;
  activitiesService.activity({
    activityId: this.data.activityId,
    activityOrderId: this.data.activityOrderId ? this.data.activityOrderId : '',
    activityType: this.data.type
  }).subscribe({
    next: res => {
      var picsStrArr = res.cover.split(',');
      picsStrArr.forEach(function (item, index) {
        picsStrArr[index] = constant.basePicUrl + item + '/resize_751_420/mode_fill'
      });
      new Promise(function (resolve, reject) {
        let str = JSON.parse(res.product.product.note);
        resolve(str);
      }).then(function (result) {
        that.setData({
          commentList: res.product.commentList,
          productInfo: res.product.product,
          description: JSON.parse(res.product.product.description),
          recommendList: res.product.recommendList,
          store: res.product.store,
          commentCount: res.product.commentCount,
          recommendCount: res.product.recommendList.length,
          note: result,
          showPics: picsStrArr,
          isShowData: true,
          lat: res.product.store ? res.product.store.lat : '',
          lng: res.product.store ? res.product.store.lng : '',
          resData: res
        });
      }).catch(function (err) {
        that.setData({
          commentList: res.product.commentList,
          productInfo: res.product.product,
          description: JSON.parse(res.product.product.description),
          recommendList: res.product.recommendList,
          store: res.product.store,
          commentCount: res.product.commentCount,
          recommendCount: res.product.recommendList.length,
          showPics: picsStrArr,
          isShowData: true,
          lat: res.product.store.lat,
          lng: res.product.store.lng,
          resData: res
        });
      })

    },
    error: err => console.log(err),
    complete: () => wx.hideToast()
  })
}
