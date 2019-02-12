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
    userinfo: {},
    constant: {},
    cardType: '',
    isShowConfirmModal: true,
    confirmTitle: '',
    confirmContent: '',
    productId:'',
    merchantId: '',
    merchantInfo: {},
    shopsNearby: [],
    huiyuancards: [],
    merListComments: [],
    merListCommentsMin: [],
    isShowGxModal: true,
    isShowFocusModal: true,
    isShowMendianModal: true,
    isShowHycardModal: true,
    merPhoneNum: '',
    listShareCards: [],
    listShareCardsMax6: [],
    focusBoxMaker: true,
    gxcobj: [], //共享会员卡列表卡片详情展开标记
    showPics: ['../../images/homeBanner.png', '../../images/banner1.png', '../../images/freeGet.png']
  },
  onLoad: function (option) {
    // this.setData({
    //   userinfo: app.globalData.userInfo
    // });
    console.log(option);
    console.log(wx.getStorageSync('curLatitude'));
    console.log(wx.getStorageSync('curLongitude'));
    let lat = wx.getStorageSync('curLatitude');
    let lng = wx.getStorageSync('curLongitude');
    this.setData({
      productId: option.id
    });
    // 查询商户信息
    
    // 附近门店列表
    
  },
  onShow: function () {
    //评论列表
  },
  showPreBuyCardModal: function (event) {
    console.log('显示购卡成功确认框触发');
    console.log(event);
    this.setData({
      isShowConfirmModal: false,
      confirmTitle: event.detail.confirmTitle,
      confirmContent: event.detail.confirmContent
    });
  },
  showcardtiaojian: function (event) {
    console.log(event);
    console.log(event.currentTarget.dataset.maker);
    let arr = this.data.gxcobj;
    arr[event.currentTarget.dataset.maker] == 1 ? arr[event.currentTarget.dataset.maker] = 0 : arr[event.currentTarget.dataset.maker] = 1;
    this.setData({
      gxcobj: arr
    })

  },
  showGxModal: function () {
    this.setData({
      isShowGxModal: false
    });
  },
  closeModal: function () {
    this.setData({
      isShowGxModal: true
    });
  },
  closeMendianModal: function () {
    this.setData({
      isShowMendianModal: true
    });
  },
  showMendian: function () {
    this.setData({
      isShowMendianModal: false
    });
  },
  showHycardModal: function () {
    console.log('showHycardModal');
    this.setData({
      isShowHycardModal: false
    });
  },
  closeHycardModal: function () {
    this.setData({
      isShowHycardModal: true
    });
  },
  gohomepage: function () {
    wx.switchTab({
      url: '/pages/index/index'
    });
    //getCurrentPages() 函数用于获取当前页面栈的实例，以数组形式按栈的顺序给出，第一个元素为首页，最后一个元素为当前页面
    // wx.navigateBack({
    //   delta: getCurrentPages().length,
    //   url: '/pages/index/index'
    // });
  },
  toCommentList: function () {
    wx.navigateTo({
      url: '/pages/commentList/index'
    });
  },
  toShareCard: function () {
    wx.navigateTo({
      url: '/pages/shareCard/index?merchantId=' + this.data.merchantId
    });
  },
  closeFocusModal: function () {
    this.setData({
      isShowFocusModal: true
    });
  },
  toAttent: function (event) {
    console.log(event);
    wx.showLoading({
      title: '关注中'
    });
    let id = '',
      attent = 0,
      index = 0,
      that = this,
      ftype;
    id = event.target.dataset.atuserid;
    event.target.dataset.attent != 1 ? attent = 1 : attent = 0;
    // index = event.target.dataset.index;
    ftype = event.target.dataset.ftype;
    console.log('ftype: ' + ftype);
    service.attent({
      attentionUserId: id,
      attent: attent
    }).subscribe({
      next: res => {
        console.log('-----------关注返回结果---------');
        console.log(res);
        let comListCopy = this.data.merListCommentsMin;

        for (let i = 0; i < comListCopy.length; i++) {
          if (ftype == 2) { //评论用户使用的卡的用户
            if (comListCopy[i].cardUserDto.id == id) {
              comListCopy[i].cardUserDto.attent = attent;
              //如果这个卡的人就是评论的这个人，userDto的关注状态也要改变，显示"已关注"按钮
              if (comListCopy[i].userDto.id == id) {
                comListCopy[i].userDto.attent = attent;
              }
            }
          } else { //关注评论者 
            if (comListCopy[i].userDto.id == id) {
              comListCopy[i].userDto.attent = attent;
              //如果这个评论的人用的是自己的卡，cardUserDto的关注状态也要改变，显示“立即下单”按钮
              if (comListCopy[i].cardUserDto.id == id) {
                comListCopy[i].cardUserDto.attent = attent;
              }
            }
          }
        }

        this.setData({
          merListCommentsMin: comListCopy
        });

        console.log(this.data.merListCommentsMin);
        if (attent === 1) {
          this.setData({
            isShowFocusModal: false,
            focusBoxMaker: true
          });
        } else {
          this.setData({
            isShowFocusModal: false,
            focusBoxMaker: false
          });
        }

        wx.hideLoading();

      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
  attentUserCard: function (event) {
    console.log(event);
  },
  //点赞
  toPraise: function (event) {
    // wx.showLoading({
    //   title: '请稍候'
    // });
    console.log(event);
    console.log(event.currentTarget.dataset.maker);
    let that = this;
    let commentId = event.currentTarget.dataset.comid;
    let status = event.currentTarget.dataset.status;
    status == 1 ? status = 0 : status = 1;
    service.praise({
      commentId: commentId,
      status: status
    }).subscribe({
      next: res => {
        console.log('-----------点赞返回结果---------');
        console.log(res);
        let arr = that.data.merListCommentsMin;
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].id == commentId) {
            arr[i].praise = status;
            let praiseCount = arr[i].praiseCount;

            if (status == 1) {
              arr[i].praiseCount = ++praiseCount;
            } else {
              arr[i].praiseCount = --praiseCount;
            }
          }
        }

        that.setData({
          merListCommentsMin: arr
        });
        console.log(that.data.merListCommentsMin);

        // wx.hideLoading();
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
  /**
   * 用户点击右上角分享或页面中的分享
   */
  onShareAppMessage: function (res) {
    return {
      title: '[' + this.data.merchantInfo.name + ']' + '正在享拼拼上特价优惠，快来参加吧！',
      path: '/pages/index/index?page=business&id=' + this.data.merchantId + '&cardType=' + this.data.cardType + '&userId=' + app.globalData.userInfo.id
    }
  },
  toCommentDetail: function (event) {
    wx.navigateTo({
      url: '/pages/commentDetail/index?id=' + event.currentTarget.dataset.comid
    });
  },
  tapWin: function () {
    console.log('点击了边框部分');
  },
  _closeEvent: function () {
    console.log('触发模态窗口关闭');
    this.setData({
      isShowHycardModal: true
    });
  },
  /*打电话给商户*/
  callMer: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.merPhoneNum
    })
  },
  toUserCircle: function (event) {
    wx.navigateTo({
      url: '/pages/myCircle/index?id=' + event.currentTarget.dataset.userid
    });
  },
  toCreateOrder: function () {
    if (this.data.cardType == 1) {
      wx.navigateTo({
        url: '/pages/createOrder/index?cardid=' + this.data.huiyuancards[0].id + '&id=' + this.data.merchantId
      });
    } else {
      wx.navigateTo({
        url: '/pages/setupOrder/index?cardid=' + this.data.huiyuancards[0].id + '&id=' + this.data.merchantId
      });
    }
  }
})