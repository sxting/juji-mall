import { constant } from '../../utils/constant';
import { service } from '../../service';
var app = getApp();
Page({
    data: {
        inviteCode: '',
        openId: '',
        showPageLoading: true,
        noPath: false,
        pageInfo: [{
            type: 0,
            path: '/pages/index/index' //首页
        }, {
            type: 1,
            path: '/pages/comDetail/index' //商品详情
        }, {
            type: 2,
            path: '/pages/jujiGarden/gardenIndex/index' //桔园邀新首页
        }],
        pageType: 0, //3为扫码进来
        pageData: {},
        pageFromCode: 1,//1为商品详情，2为邀新，默认1
        sharePersonOpenId:'',
        shareProductId:'',
        scene:''//扫码进入
    },
    onLoad: function(options) {
        console.log('---------授权页面----------');
        console.log(JSON.stringify(options));
        if (options.pagetype) {
            this.setData({ pageType: options.pagetype });
        }
        if (options.scene) {
          console.log("扫码进入");
          this.setData({scene:decodeURIComponent(options.scene)});
          this.setData({ pageType: 3 });
        }
        this.setData({ pageData: options });
        // 小程序码进来的话
        this.next();
    },
    next: function() {
        wx.getSetting({
            success: (res) => {
                console.log('userInfoStatus='+res.authSetting['scope.userInfo']);
                if (res.authSetting['scope.userInfo']) {
                    if(this.data.pageType==3){
                        this.getValueByscene(this.data.scene,1);
                    }else{
                        // 正常用户先登录再进行下一步;
                        this.preLogin1("");
                    }
                } else {
                  this.setData({showPageLoading: false});
                  if(this.data.pageType==3){
                    this.getValueByscene(this.data.scene,2);
                  }
                }
            }
        });
    },
    // type=1是已经授权过
    getValueByscene: function(scene,type) {
        wx.request({
            url: constant.apiUrl + '/qr/getBySceneId.json?sceneId=' + scene,
            method: 'GET',
            header: { 'content-type': 'application/json' },
            success: (res) => {
                console.log("解析小程序码")
                console.log(JSON.stringify(res));
                if (res.data.data.productId == 'invitenew') {
                    this.setData({pageFromCode:2});
                } else {
                    this.setData({pageFromCode:1});
                }
                this.setData({
                    sharePersonOpenId: res.data.data.openId,
                    shareProductId:res.data.data.productId
                });
                if (type == 1) {
                    this.nextPage();
                }
            }
        });
    },
    // 已授权调
    preLogin1: function(inviteCode) {
        var obj = {
            rawData: '',
            inviteCode: inviteCode
        };
        this.login(obj).then(() => {
            this.nextPage();
        });
    },
    // 未授权调
    preLogin2: function(rawData, inviteCode) {
        var obj = {
            rawData: rawData,
            inviteCode: inviteCode
        };
        this.login(obj).then(() => {
            this.nextPage();
        });
    },
    nextPage:function(){
      console.log("走下一页");
      console.log('pageType===='+this.data.pageType);
      if (this.data.pageType==0) {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
      if (this.data.pageType==1) {
        wx.reLaunch({
          url: '/pages/comDetail/index?id=' + this.data.pageData.pid + '&storeid=' + this.data.pageData.storeid
        });
      }
      if (this.data.pageType==2) {
        wx.reLaunch({
          url: '/pages/jujiGarden/gardenIndex/index?openid=' + this.data.sharePersonOpenId
        });
      }
      if (this.data.pageType==3) {
        if(this.data.pageFromCode==1){//商品详情
          wx.reLaunch({
            url: '/pages/comDetail/index?id=' + this.data.shareProductId + '&storeid='
          });
        }else{//邀新
          wx.reLaunch({
            url: '/pages/jujiGarden/gardenIndex/index?openid=' + this.data.sharePersonOpenId
          });
        }
      }
      // 分销返利页
      if(this.data.pageType==4){
        wx.reLaunch({
          url: '/pages/comDetail/index?id=' + this.data.pageData.pid + '&storeid=' + this.data.pageData.storeid + '&sceneid=' + this.data.pageData.sceneid
        });
      }
      // 邀新首页
      if(this.data.pageType==5){
        wx.reLaunch({
          url: '/pages/jujiGarden/gardenIndex/index?openid=' + this.data.pageData.openid
        });
      }
    },
    getUserInfo: function(e) {
        if (e.detail.userInfo) {
            wx.setStorageSync('rawData', e.detail.rawData);
            var rawData = e.detail.rawData;
            console.log('pageType===='+this.data.pageType);
            var invitecode = this.data.pageData.invitecode?this.data.pageData.invitecode:'';
            this.preLogin2(rawData, invitecode);
        }
    },
    login: function(obj) {
        return new Promise(function(resolve1, reject1) {
            wx.login({
                success: res => {
                    console.log('code: ' + res.code);
                    console.log(constant.APPID);
                    resolve1(res.code);
                }
            });
        }).then(function(code) {
            return new Promise(function(resolve2, reject2) {
                wx.request({
                    url: constant.apiUrl + '/user/login.json',
                    method: 'GET',
                    data: {
                        code: code,
                        appId: constant.APPID,
                        isMock: false, //测试标记
                        inviteCode: obj.inviteCode,
                        rawData: obj.rawData,
                        sceneId: this.data.scene
                    },
                    header: {
                        'content-type': 'application/json',
                    },
                    success: (res1) => {
                        console.log(res1);
                        if (res1.data.errorCode == '200') {
                            console.log('登录成功，拿到token');
                            wx.setStorageSync('token', res1.data.data.token);
                            wx.setStorageSync('openid', res1.data.data.openId);
                            wx.setStorageSync('inviteCode', res1.data.data.inviteCode);
                            wx.setStorageSync('userinfo', JSON.stringify(res1.data.data));
                            resolve2();
                        } else {
                            reject2('登录失败，错误码:' + res1.data.errorCode + ' 返回错误: ' + res1.data.errorInfo);
                        }
                    },
                    fail: (err) => {
                        reject2(err.errMsg);
                    }
                });
            });
        }).catch(function(err) {
            console.log(err);
            wx.showModal({
                title: '错误',
                content: err
            });
        });
    }
})