import { errDialog, loading, showAlert } from '../../../utils/util'
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
    openId: '',//邀请者id
    role: '',//桔园角色
    isAuthed: false,//是否实名认证
    todaySaleRebate: 0,//今日销售收入
    todaySettlementAmount: 0,//今日提现 
    totalSettlementAmount: 0,//累计提现
    invitedLeaderCount: 0,
    invitedMemberCount: 0,
    wechatId: '',//微信号码
    name: '',//姓名
    phone: '',
    applyLeader: false,//是否申请桔长
    switchFun: false,
    minInvitedMemberCount: 0,//邀请几个人就可以成为桔长
  },

  onLoad: function (options) {
    let self = this;
    wx.setNavigationBarTitle({ title: '桔园' });
    if (options.openId) {//分享点进来
      let self = this;
      console.log('分享点进来');
      self.setData({
        openId: options.openId,
        switchFun: true
      })
      
      if (wx.getStorageSync('token')){//token存在
        console.log(wx.getStorageSync('token') + ' /token存在');
        // 直接调成为桔民的接口；然后调 getGardenInfor 方法 拿到信息； applyLeader 判断有没有申请过成为局长，如果没有 页面的展示是申请成为桔长，   点击申请成为桔长   判断是否绑定手机号
        getGardenInfor.call(self);//get首页信息,获取分销角色
      }else{//token不存在 登陆
        this.mainFnc(options);
      }
    }else{
      getGardenInfor.call(self);//get首页信息,获取分销角色
    }
  },

  // 登陆
  mainFnc: function (option) {
    let that = this;
    new Promise(function (resolve, reject) {
      console.log('Promise is ready!');
      wx.getSetting({
        success: (res) => {
          console.log(res.authSetting['scope.userInfo'] + ' haha');
          if (!res.authSetting['scope.userInfo']) {
            wx.reLaunch({ url: '/pages/login/index?fromPage=gardenIndex&openId=' + that.data.openId });
          } else { //如果已经授权
            resolve();
          }
        }
      });
    }).then(function () {
      return new Promise(function (resolve1, reject1) {
        wx.login({
          success: res => {
            console.log(res);
            console.log(constant.APPID);
            resolve1(res.code);
          }
        });
      })
    }).then(function (code) {
      console.log(constant.APPID + '999');
      var requestObj = {
        code: code,
        appId: constant.APPID,
        isMock: false, //测试标记
        inviteCode: '',
        rawData: wx.getStorageSync('rawData')
      }

      wx.request({
        url: constant.apiUrl + '/user/login.json',
        method: 'GET',
        data: requestObj,
        header: {
          'content-type': 'application/json',
        },
        success: (res1) => {
          console.log(res1);
          if (res1.data.errorCode == '200') {
            wx.setStorageSync('token', res1.data.data.token);
            wx.setStorageSync('openid', res1.data.data.openId);
            wx.setStorageSync('inviteCode', res1.data.data.inviteCode);
            wx.setStorageSync('userinfo', JSON.stringify(res1.data.data));
            getGardenInfor.call(that);//get用户信息身份
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
  },

  onShow: function () {
    let self = this;
    if (wx.getStorageSync('token')) {//token存在
      getGardenInfor.call(self);//get首页信息,获取分销角色
    } else {//token不存在 登陆
      return;
    }
  },

  /**申请成为桔长  **/
  apply:function(e){
    this.getUserInfor();
  },

  /**   跳转页面  */
  toPage: function(e) {
    let role = e.currentTarget.dataset.role ? e.currentTarget.dataset.role : '';
    let page = role ? e.currentTarget.dataset.page + '?role=' + role : e.currentTarget.dataset.page;
    wx.navigateTo({ url: page });
  },

  /*** 用户点击右上角分享  ***/
  onShareAppMessage: function () {
    let self = this;
    return {
      title: JSON.parse(wx.getStorageSync('userinfo')).nickName + '邀请您桔园结义成为桔长，购物返利最高可享40%商品返利',
      path: '/pages/jujiGarden/gardenIndex/index?openId=' + wx.getStorageSync('openid'),
      imageUrl: '/images/banner-invent.png',
    }
  },

  dataChange(e){
    console.log(e.currentTarget.dataset.type);
    if (e.currentTarget.dataset.type == 'wechatid'){
      this.setData({
        wechatId: e.detail.value,//微信号码
      })
    }else{
      this.setData({
        name: e.detail.value,//姓名
      })
    }
  },

  // 绑定微信号及姓名
  submitUserInfor(){
    let data = {
      wechatId: this.data.wechatId,
      name: this.data.name
    }
    if (this.data.wechatId == ''){
      showAlert('请填写您的微信账号');
    } else if (this.data.name == ''){
      showAlert('请填写您的实名认证姓名');
    } else{
      jugardenService.bindWechatInfor(data).subscribe({
        next: res => {
          if (res) {
            console.log(res);
          }
        },
        error: err => errDialog(err),
        complete: () => wx.hideToast()
      })
    }
  },

  // 获取用户信息 
  getUserInfor: function () {
    let self = this;
    service.userInfo({ openId: wx.getStorageSync('openid') }).subscribe({
      next: res => {
        if (res.phone) {//已经绑定手机号码  && self.data.role == 'UNDEFINED'
          this.setData({
            phone: res.phone,
            applyLeader: true
          });
          let data = {
            parentId: this.data.openId,
            applyLeader: this.data.applyLeader
          }
          joinDistributor.call(self,data);//加入桔园
        }else{
          wx.navigateTo({ url: '/pages/bindPhone/index' });
        }
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },
});

// 首页信息获取 
function getGardenInfor(){
  let self = this;
  jugardenService.getGardenHomeInfor().subscribe({
    next: res => {
      if (res) {
        console.log(res);
        if (res.role == 'MEMBER') {// 1、邀请进来的是桔民 return 2、邀请进来的是其他的 加入桔园 applyLeader=false;
          this.data.juminNumList = [];
          this.data.hadNumber = parseInt(res.invitedLeaderCount) + parseInt(res.invitedMemberCount);
          if (this.data.hadNumber > 0) {
            for (let i = 0; i < this.data.hadNumber; i++) {
              let list = 'yes';
              this.data.juminNumList.push(list);
            }
            for (let j = 0; j < (res.minInvitedMemberCount - parseInt(this.data.hadNumber)); j++) {
              this.data.juminNumList.push('');
            }
          } else {
            for (let j = 0; j < res.minInvitedMemberCount; j++) {
              this.data.juminNumList.push('');
            }
          }
        } else if (res.role == 'UNDEFINED' && this.data.switchFun){
          self.setData({ applyLeader: false })
          let data = {
            parentId: this.data.openId,
            applyLeader: this.data.applyLeader
          }
          joinDistributor.call(self,data);
        } else if ((res.role == 'LEADER' || res.role == 'MEMBER') && this.data.switchFun){ //邀请者是桔长或者桔民
          let data = {
            parentId: this.data.openId,
            applyLeader: res.applyLeader
          }
          joinDistributor.call(self, data);
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
          isAuthed: res.hasReceiver == true? true : false,
          applyLeader: res.applyLeader,
          minInvitedMemberCount: res.minInvitedMemberCount
        })
        if (res.role == 'LEADER' && res.allowDistribute){//动态设置title背景色 是桔长并已经认证
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

// 加入分销 成为桔民
function joinDistributor(data) {
  let self = this;
  jugardenService.joinDistributor(data).subscribe({
    next: res => {
      if (res) {
        if (res.role == 'MEMBER' || res.role == 'UNDEFINED') {//桔民
          this.data.juminNumList = [];
          this.data.hadNumber = parseInt(res.invitedLeaderCount) + parseInt(res.invitedMemberCount);
          if (this.data.hadNumber > 0) {
            for (let i = 0; i < this.data.hadNumber; i++) {
              let list = 'yes';
              this.data.juminNumList.push(list);
            }
            for (let j = 0; j < (res.minInvitedMemberCount - parseInt(this.data.hadNumber)); j++) {
              this.data.juminNumList.push('');
            }
          } else {
            for (let j = 0; j < res.minInvitedMemberCount; j++) {
              this.data.juminNumList.push('');
            }
          }
        }
        this.setData({
          role: res.role,
          juminNumList: this.data.juminNumList,
          hadNumber: this.data.hadNumber,
          applyLeader: res.applyLeader,
          isAuthed: res.hasReceiver == true ? true : false,
          minInvitedMemberCount: res.minInvitedMemberCount
        })
      }
    },
    error: err => errDialog(err),
    complete: () => wx.hideToast()
  })
}



