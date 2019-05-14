var util = require('../../../utils/util.js');
import { service } from '../../../service';
import { activitiesService } from '../shared/service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
var NP = require('../../../utils/number-precision.js');
var app = getApp();
Page({
  data: {
    nvabarData: {showCapsule: 1,title: '商品详情'},
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
    activityOrderId: '',
    progressId: '',
    self: '',
    showCom: false,
  },
  onLoad: function (options) {
    if (options.shared) {
      this.setData({ shared: options.shared });
    }
    wx.setNavigationBarTitle({ title: '商品详情' });
    this.setData({ 
      productId: options.id, 
      activityId: options.activityId,
      activityOrderId: options.activityOrderId ? options.activityOrderId : '',
      progressId: options.progressId ? options.progressId : '',
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
    this.setData({
      showCom: false
    })
    // 查询商品详情
    getItemInfo.call(this);
  },
  onShareAppMessage:function(res) {
    var nickName = JSON.parse(wx.getStorageSync('userinfo')).nickName;
    var activityId = this.data.activityId;
    var gender = JSON.parse(wx.getStorageSync('userinfo')).gender==1?'他':'她';
    var activityOrderId = this.data.activityOrderId;
    var picId = this.data.resData.cover;
    var productName = this.data.resData.productName;
    var price = Number(this.data.resData.activityPrice/100).toFixed(2);
    var oprice = Number(this.data.resData.originalPrice/100).toFixed(2);
    if (res.from === 'button' && res.target.dataset.type === 'pintuan') {
        return {
            title: '嗨！便宜一起拼￥' + price + '【' + productName + '】',
            path: '/pages/login/index?pagetype=5&type=SPLICED&activityId=' + activityId + '&activityOrderId=' + activityOrderId + '&invitecode=' + wx.getStorageSync('inviteCode'),
            imageUrl: constant.basePicUrl + picId + '/resize_560_420/mode_fill'
        }
    }
    if (res.from === 'button' && res.target.dataset.type === 'share2') {
        return {
            title: nickName+'邀请你帮'+gender+'砍价，'+price+'元得原价'+oprice+'元的'+productName,
            path: '/pages/login/index?pagetype=5&type=BARGAIN&activityId=' + activityId + '&activityOrderId=' + activityOrderId + '&invitecode=' + wx.getStorageSync('inviteCode'),
            imageUrl: constant.basePicUrl + picId + '/resize_560_420/mode_fill'
        }
    }
    return {
      title: nickName + '分享给您一个心动商品，快来一起体验吧！',
      path: '/pages/login/index?pagetype=5&type=' + this.data.type + '&activityId=' + this.data.activityId + '&invitecode=' + wx.getStorageSync('inviteCode'),
      imageUrl: constant.basePicUrl + picId + '/resize_560_420/mode_fill'
    }
  },
  onStartKanjia(e) {
    console.log(e.detail);
    if (e.detail) {
      this.setData({
        activityOrderId: e.detail.activityOrderId
      })
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

  toCommentDetail: function (event) {
    wx.navigateTo({
      url: '/pages/commentDetail/index?id=' + event.currentTarget.dataset.comid
    });
  },
});

function getItemInfo() {
  let that = this;
  console.log(this.data.activityOrderId);
  activitiesService.activity({
    activityId: this.data.activityId,
    activityOrderId: this.data.activityOrderId ? this.data.activityOrderId : '',
    activityType: this.data.type,
    progressId: this.data.progressId
  }).subscribe({
    next: res => {
      that.setData({
        showCom: true
      })
      var picsStrArr = res.cover.split(',');
      picsStrArr.forEach(function (item, index) {
        picsStrArr[index] = constant.basePicUrl + item + '/resize_751_420/mode_fill'
      });
      if (res.orderDigest) {
        res.yikan = NP.minus(res.originalPrice, res.orderDigest.currentSalesPrice)
      }
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
          resData: res,
          activityOrderId: res.orderDigest ? res.orderDigest.activityOrderId : '',
          self: (!res.orderDigest) || (res.orderDigest && res.orderDigest.isInitiator)
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
          resData: res,
          activityOrderId: res.orderDigest ? res.orderDigest.activityOrderId : '',
          self: (!res.orderDigest) || (res.orderDigest && res.orderDigest.isInitiator)
        });
      })

    },
    error: err => console.log(err),
    complete: () => wx.hideToast()
  })
}
