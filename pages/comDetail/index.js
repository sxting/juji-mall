var util = require('../../utils/util.js');
import {
  service
} from '../../service';
import {
  constant
} from '../../utils/constant';
var app = getApp();
Page({
  data: {
    productId: '',
    storeId: '',
    showPics: [],
    commentList: [],
    productInfo: {},
    description:[],
    recommendList: [],
    store: {},
    commentCount: 0,
    recommendCount: 0,
    pointBalance: 0,
    note:[],
    despImgHeightValues:[],
    isShowData:false
  },
  onLoad: function(option) {
    wx.setNavigationBarTitle({
      title: '商品详情'
    });
    console.log(option);
    if (!option.id) {
      wx.showToast({
        title: '发生错误，未找到商品id',
        icon: 'none'
      });
      wx.navigateTo({
        url: '/pages/index/index',
      })
      return ;
    } 
    console.log(wx.getStorageSync('curLatitude'));
    console.log(wx.getStorageSync('curLongitude'));
    let lat = wx.getStorageSync('curLatitude');
    let lng = wx.getStorageSync('curLongitude');
    this.setData({
      productId: option.id,
      storeId: option.storeid
    });
    let that = this;
    if(wx.getStorageSync('token')){
      console.log('token存在');
      this.getItemInfo();
      //查询用户橘子
      this.getPointBalance();
    }else{
      console.log('token不存在');
      //新用户 授权 登录 跳转
      // wx.switchTab({
      //   url: '/pages/index/index',
      // });

      new Promise(function (resolve, reject) {
        console.log('Promise is ready!');
        wx.getSetting({
          success: (res) => {
            console.log(res.authSetting['scope.userInfo']);
            if (!res.authSetting['scope.userInfo']) {
              wx.reLaunch({
                url: '/pages/login/index?fromPage=comDetail&productId=' + that.data.productId
              });
            } else { //如果已经授权
              //判断rowData是否存在
              if (wx.getStorageSync('rawData')) { //如果存在
                resolve();
              } else { //如果不存在rowData
                reject('未获取rawData');
              }
            }
          }
        });
      }).then(function () {

        return new Promise(function (resolve1, reject1) {
          wx.login({
            success: res => {
              console.log('code: ' + res.code);
              console.log(constant.APPID);
              resolve1(res.code);
            }
          });

        })
      }).then(function (code) {

          wx.request({
            url: 'https://c.juniuo.com/shopping/user/login.json',
            method: 'GET',
            data: {
              code: code,
              appId: constant.APPID,
              isMock: false, //测试标记
              inviteCode: option.inviteCode,
              rawData: wx.getStorageSync('rawData')
            },
            header: {
              'content-type': 'application/json',
            },
            success: (res1) => {
              console.log(res1);

              if (res1.data.errorCode == '200') {
                wx.setStorageSync('token', res1.data.data.token);
                wx.setStorageSync('openid', res1.data.data.openId);
                wx.setStorageSync('userinfo', JSON.stringify(res1.data.data));

                that.getItemInfo();
                //查询用户橘子
                that.getPointBalance();

              } else {
                wx.showModal({
                  title: '错误',
                  content: '登录失败，错误码:' + res1.data.errorCode + ' 返回错误: ' + res1.data.errorInfo
                });
              }
            }
          });

        }).catch(function (err) {
          console.log(err);
          wx.showModal({
            title: '错误',
            content: err
          });
        });

    }

  },
  //收集formid做推送
  collectFormIds:function(e){
    console.log(e.detail);
    service.collectFormIds({
      formId: e.detail.formId
    }).subscribe({
      next: res => {
        console.log(res)
      }
    });
  },
  toMerchantsList:function(){
    wx.navigateTo({
      url: '/pages/merchantsCanUse/index?id=' + this.data.productId 
    });
  },
  toCreateOrder: function() { //跳转订单确认 桔子和人民币组合订单
    wx.navigateTo({
      url: '/pages/payOrder/index?paytype=1&id=' + this.data.productId + '&storeid=' + this.data.storeId
    });
  },
  toCreateOrderByPoint: function() { //只用桔子下单
    wx.navigateTo({
      url: '/pages/payOrder/index?paytype=2&id=' + this.data.productId + '&storeid=' + this.data.storeId
    });
  },
  toCreateOrderByRmb: function () { //人民币优惠购买
    wx.navigateTo({
      url: '/pages/payOrder/index?paytype=3&id=' + this.data.productId + '&storeid=' + this.data.storeId
    });
  },
  toCreateOrderByOriPrice: function () { //原价购买
    wx.navigateTo({
      url: '/pages/payOrder/index?paytype=4&id=' + this.data.productId + '&storeid=' + this.data.storeId
    });
  },
  toGetPoint: function() { //跳转到任务页面赚桔子
    wx.switchTab({
      url: '../juzi/index'
    });
  },
  getPointBalance: function() {

    service.getPointBalance().subscribe({
      next: res => {
        console.log('--------查询桔子余额-------');
        console.log(res);
        this.setData({
          pointBalance: res
        });
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  toComDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    var storeid = e.currentTarget.dataset.storeid;
    console.log(id);
    wx.navigateTo({
      url: '/pages/comDetail/index?id=' + id + '&storeid=' + storeid
    });
  },
  onShow: function() {
    //评论列表
  },
  call: function() {
    wx.makePhoneCall({
      phoneNumber: this.data.store.phone // 仅为示例，并非真实的电话号码
    })
  },
  getItemInfo: function() {
    service.getItemInfo({
      productId: this.data.productId,
      storeId: this.data.storeId
    }).subscribe({
      next: res => {
        console.log(res);
        var picsStrArr = res.product.picIds.split(',');
        picsStrArr.forEach(function(item,index){
          picsStrArr[index] = constant.basePicUrl + item + '/resize_690_420/mode_fill'
        });
        this.setData({
          commentList: res.commentList,
          productInfo: res.product,
          description: JSON.parse(res.product.description),
          recommendList: res.recommendList,
          store: res.store,
          commentCount: res.commentCount,
          recommendCount: res.recommendList.length,
          note: JSON.parse(res.product.note),
          showPics: picsStrArr,
          isShowData: true
        });
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  desImgLoad: function (event){
    console.log(event.detail);
    var arr = this.data.despImgHeightValues;
    arr.push(event.detail.height * 690 / event.detail.width);
    this.setData({
      despImgHeightValues: arr
    });
  },
  gohomepage: function() {
    wx.switchTab({
      url: '/pages/index/index'
    });
    //getCurrentPages() 函数用于获取当前页面栈的实例，以数组形式按栈的顺序给出，第一个元素为首页，最后一个元素为当前页面
    // wx.navigateBack({
    //   delta: getCurrentPages().length,
    //   url: '/pages/index/index'
    // });
  },
  toCommentList: function() {
    wx.navigateTo({
      url: '/pages/commentList/index?id=' + this.data.productId
    });
  },
  toShareCard: function() {
    wx.navigateTo({
      url: '/pages/shareCard/index?merchantId=' + this.data.merchantId
    });
  },
  share: function (obj){
    
    service.share(obj).subscribe({
      next: res=>{
        console.log('---------分享返回--------');
        console.log(res);
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  /**
   * 用户点击右上角分享或页面中的分享
   */
  onShareAppMessage: function(res) {
    console.log(res);
    // var type = this.data.productInfo.type;
    // var obj = {};
    // if (type == 'POINT') {
    //   obj.type = 'SHARE_EXCHANGE';
    // } else {
    //   obj.type = 'SHARE_PRODUCT';
    // }
    // obj.sharePath = '/pages/comDetail/index?id=' + this.data.productId + '&storeid=' + this.data.storeId;
    // this.share(obj);
    return {
      title: JSON.parse(wx.getStorageSync('userinfo')).nickName+'分享给您一个心动商品，快来一起体验吧！',
      path: '/pages/comDetail/index?id=' + this.data.productId + '&storeid=' + this.data.storeId + '&inviteCode=' + wx.getStorageSync('inviteCode')
    }
  },
  toCommentDetail: function(event) {
    wx.navigateTo({
      url: '/pages/commentDetail/index?id=' + event.currentTarget.dataset.comid
    });
  }
})