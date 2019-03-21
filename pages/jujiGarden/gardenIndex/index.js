import { errDialog, loading } from '../../../utils/util'
import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { jugardenService } from '../shared/service.js'
var app = getApp();
var timeVal;

Page({
  data: {
    juminNumList: [],//队员人数
    hadNumber: 0,
    storeId: '',
    openId: wx.getStorageSync('openid'),//邀请者id
    role: '',//桔园角色
    isAuthed:false,//是否实名认证
    todaySaleRebate: 0,//今日销售收入
    todaySettlementAmount: 0,//今日提现 
    totalSettlementAmount: 0,//累计提现
    invitedLeaderCount: 0,
    invitedMemberCount: 0,
  },

  onLoad: function (options) {
    let self = this;
    wx.setNavigationBarTitle({ title: '桔园' });
    console.log(wx.getExtConfigSync());
    if (options.type && options.type == 'share') {//分享进来
      let self = this;
      wx.login({
        success: function (result) {
          wx.getUserInfo({
            withCredentials: true,
            success: function (res) {
              self.setData({
                getUserInfo: true
              })
              let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
              let appId = 'wxb03b0ab93bb60ecc';
              if (result.code) {
                logIn.call(self, result.code, extConfig.theAppid ? extConfig.theAppid : appId, res.rawData);
              } else {
                console.log('获取用户登录态失败！' + result.errMsg)
              }
            },
            fail: function () {
              self.setData({
                getUserInfo: false
              })
            }
          });
        },
        fail: function (res) {
          self.setData({
            getUserInfo: false
          })
        },
        complete: function (res) { },
      });
    }
    getGardenInfor.call(self);//get首页信息,获取分销角色
  },

  onShow: function () {
    let self = this;
    getGardenInfor.call(self);//get首页信息,获取分销角色
  },

  // 申请成为桔长
  apply:function(e){
    let self = this;
    joinDistributor.call(self);
  },

  // 跳转页面
  toPage: function(e) {
      var page = e.currentTarget.dataset.page;
      wx.navigateTo({ url: page });
  },

  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function () {
    let self = this;
    return {
      title: JSON.parse(wx.getStorageSync('rawData')).nickName + '邀请您桔园结义成为桔长，购物返利最高可享40%商品返利',
      path: '/pages/jujiGarden/gardenIndex/index?inviteCode=' + wx.getStorageSync('inviteCode'),
      imageUrl: '/images/banner-invent.png',
      success: function (res) {
        // 转发成功
        console.log(res + '转发成功');
      },
      fail: function (res) {
        // 转发失败
        console.log(res);
      }
    }
  }
});

// 首页信息获取 
function getGardenInfor(){
  let self = this;
  jugardenService.getGardenHomeInfor().subscribe({
    next: res => {
      if (res) {
        console.log(res);
        if (res.role == 'MEMBER' || res.role == 'UNDEFINED'){//桔民
          this.data.juminNumList = [];
          this.data.hadNumber = parseInt(res.invitedLeaderCount) + parseInt(res.invitedMemberCount);
          if (this.data.hadNumber > 0) {
            for (let i = 0; i < this.data.hadNumber; i++) {
              let list = 'yes';
              this.data.juminNumList.push(list);
            }
            for (let j = 0; j < (10 - parseInt(this.data.hadNumber)); j++) {
              this.data.juminNumList.push('');
            }
          }else{
            for (let j = 0; j < 10; j++) {
              this.data.juminNumList.push('');
            }
          }
        }
        this.setData({
          role: res.role,
          juminNumList: this.data.juminNumList,
          hadNumber: this.data.hadNumber,
          todaySaleRebate: res.todaySaleRebate ? res.todaySaleRebate: 0,
          todaySettlementAmount: res.todaySettlementAmount ? res.todaySettlementAmount : 0,
          totalSettlementAmount: res.totalSettlementAmount ? res.totalSettlementAmount : 0,
          invitedLeaderCount: res.invitedLeaderCount? res.invitedLeaderCount : 0,
          invitedMemberCount: res.invitedMemberCount? res.invitedMemberCount : 0,
        })
        if (res.role == 'LEADER'){//动态设置title背景色
          wx.setNavigationBarColor({
            frontColor: '#000000', // 必写项
            backgroundColor: '#FFDC00', // 必写项
          })
        }
      }
    },
    error: err => errDialog(err),
    complete: () => wx.hideToast()
  })
}

// 加入分销  成为桔民
function joinDistributor() {
  let self = this;
  let data = {
    parentId: this.data.openId
  }
  jugardenService.joinDistributor(data).subscribe({
    next: res => {
      if (res) {
        console.log(res);
        this.setData({
          role: res.role,
        })
      }
    },
    error: err => errDialog(err),
    complete: () => wx.hideToast()
  })
}

// 登陆
function logIn(code, appid, rawData) {
  let self = this;
  jugardenService.logIn({ code: code, appid: appid, rawData: rawData }).subscribe({
    next: res => {
      if (res) {
        console.log(res);
      }
    },
    error: err => errDialog(err),
    complete: () => wx.hideToast()
  })
}