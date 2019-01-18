import {errDialog,loading} from '../../utils/util';
import {constant} from '../../utils/constant';
import {service} from '../../service';
var app = getApp();
Page({
  data: {
    signature: "点击编辑签名",
    attent: 0,
    constant: constant,
    tablist: ['共享卡', '评价'],
    curTabIndex: 0,
    userInfo: {},
    curShowUserId: '',
    curShowUserName: '',
    isCurUserInfo: true, //是否是当前小程序用户的信息
    avatarUrl: '../../images/user.png',
    cardList: [],
    isShowNodata1: false,
    commentList: [], //评论列表
    isShowNodata2: false,
    isFocus:false,
    showCompile:true
  },
  //点赞
  toPraise: function (event) {
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
        let arr = that.data.commentList;
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
          commentList: arr
        });
        console.log(that.data.commentList);
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
  toPath: function(event) {
    var targetUrl = event.currentTarget.dataset.page;
    var isSelf = this.data.isCurUserInfo ? '1' : '0';
    wx.navigateTo({
      url: targetUrl + '?id=' + this.data.curShowUserId + '&isSelf=' + isSelf
    });
  },
  switchTab: function(e) {
    this.setData({
      curTabIndex: e.currentTarget.dataset.index
    });
  },
  focusInput: function(e) {
    if (this.data.signature == "点击编辑签名") {
      this.setData({
        signature: ""
      });
    }
  },
  bindInputFocu:function(){
    this.setData({showCompile:false})
    this.setData({isFocus:true})
  },
  toCommentDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/commentDetail/index?id=' + e.currentTarget.dataset.id
    });
  },
  toMerchant: function(e) {
    var id = e.currentTarget.dataset.id;
    var type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '/pages/businessDetails/index?id=' + e.currentTarget.dataset.id + '&cardType=' + type
    });
  },
  dataChange: function(e) {
    this.data.signature = e.detail.value;
  },
  followUser: function(e) {
    service.attent({
      attentionUserId: e.currentTarget.dataset.id,
      attent: this.data.attent == 0 ? 1 : 0
    }).subscribe({
      next: res => {
        this.setData({
          attent: this.data.attent == 0 ? 1 : 0
        });
        var txt = this.data.attent == 0 ? '你已取消关注' : '关注成功！';
        this.showToast(txt);
        this.getUserInfo();
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },
  changeSignature: function() {
    service.signature({
      signature: this.data.signature
    }).subscribe({
      next: res => {
        if (this.data.signature == "") {
          this.setData({
            signature: "点击编辑签名"
          });
        }else{
          this.showToast("签名修改成功");
          this.getUserInfo();
          this.setData({showCompile:true});
        }
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    });
  },
  toMyBussinessCard: function() {
    wx.navigateTo({
      url: '/pages/myBusinesscard/index?fansCount=' + this.data.userInfo.fansCount + '&attentCount=' + this.data.userInfo.attentCount
    });
  },
  getUserInfo: function() {
    service.userInfo({
      id: this.data.curShowUserId
    }).subscribe({
      next: res => {
        this.setData({
          userInfo: res,
          signature: res.signature || "点击编辑签名",
          curShowUserName: res.name,
          attent: res.attent
        });
        wx.setNavigationBarTitle({
          title: res.name
        });
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    });
  },
  getShareCard: function(id) {
    service.getShareCard({
      userId: id
    }).subscribe({
      next: res => {
        this.setData({
          cardList: res
        });
        if (this.data.cardList.length > 0) {
          var cardArr = res;
          var newCardList = [];
          for (var i = 0; i < cardArr.length; i++) {
            if (cardArr[i].share == 1) {
              newCardList.push(cardArr[i]);
            }
          }
          this.setData({
            cardList: newCardList
          });
          if (this.data.cardList.length == 0) {
            this.setData({
              isShowNodata1: true
            });
          }
        } else {
          this.setData({
            isShowNodata1: true
          });
        }
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    });
  },
  toCommentDetail: function(event) {
    wx.navigateTo({
      url: '/pages/commentDetail/index?id=' + event.currentTarget.dataset.comid
    });
  },
  toBusinessDetails: function(event) {
    wx.navigateTo({
      url: '../businessDetails/index?cardType=' + event.currentTarget.dataset.cardtype + '&id=' + event.currentTarget.dataset.busid
    });
  },
  getCommentList: function(id) {
    service.listUserComments({
      userId: id
    }).subscribe({
      next: res => {
        //修改图片路径
        console.log('-----用户的所有评价-----');
        console.log(res);
        this.setData({
          commentList: res
        });
        if (this.data.commentList.length == 0) {
          this.setData({
            isShowNodata2: true
          });
        }
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },
  onLoad: function(options) {
    new app.ToastPannel();
    this.getMyInfo(options.id);
    this.setData({
      curShowUserId: options.id
    });
    this.getShareCard(options.id);
    this.getCommentList(options.id);
  },
  onShow:function(){
    this.getUserInfo();
  },
  getMyInfo: function(id) {
    service.getMyInfo().subscribe({
      next: res => {
        this.setData({
          isCurUserInfo: id == res.id
        });
        if (res.name) {
          app.globalData.userInfo = res;
        }
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },
  onShareAppMessage: function(res) {
    if (res.from === 'button') {
      return {
        title: '快来[享拼拼]关注' + this.data.curShowUserName + '，会员权益免费拿！',
        path: '/pages/index/index?page=circle&id=' + this.data.curShowUserId + '&userId=' + app.globalData.userInfo.id
      }
    } else {
      return {
        title: '快来[享拼拼]关注' + this.data.curShowUserName + '，会员权益免费拿！',
        path: '/pages/index/index?page=circle&id=' + this.data.curShowUserId + '&userId=' + app.globalData.userInfo.id
      }
    }
  }
})