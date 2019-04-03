import {
  constant
} from '../../utils/constant';
import {
  service
} from '../../service';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fromPage: '',
    productId: '',
    inviteCode: '',
    openId: '',
    showPageLoading: true,
    path: '',
    params: '',
    noPath: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('---------授权页面----------');
    console.log(options);
    console.log(options.path);
    console.log(options.params);
    this.setData({
      path: options.path ? options.path : '',
      params: options.params ? options.params : '',
    })

    wx.getSetting({
      success: (res) => {
        console.log(res.authSetting['scope.userInfo']);
        if (res.authSetting['scope.userInfo']) {
          var inviteCode = '';
          if (options.params) {
            new Promise(function(resolve, reject) {
              var str = JSON.parse(options.params).inviteCode;
              resolve(str);
            }).then(result => {
              console.log(result);
              this.preLogin1(options, result);
            }).catch(err => {
              //JSON解析失败
              this.preLogin1(options, inviteCode);
            });
          } else {
            this.preLogin1(options, inviteCode);
          }

        } else {
          this.setData({
            showPageLoading: false
          });
          if (options.path) {
            this.setData({
              noPath: false
            })
          } else {
            this.setData({
              noPath: true
            })
          }

        }
      }
    });
  },
  preLogin1: function(options, inviteCode) {
    var obj = {
      rawData: '',
      inviteCode: inviteCode
    };
    console.log(JSON.stringify(obj));
    this.login(obj).then(() => {
      //已授权转发到其他页面
      if (options.path) {
        if (options.path == '/Pages/index/index') {
          wx.switchTab({
            url: '/Pages/index/index'
          })
        } else {
          wx.reLaunch({
            url: options.path + '?params=' + options.params,
          });
        }

      } else {
        wx.switchTab({
          url: '/pages/index/index',
        });
      }
    });
  },
  preLogin2: function (e, rawData, inviteCode) {
    var obj = {
      rawData: rawData,
      inviteCode: inviteCode
    };
    this.login(obj).then(() => {
      if (this.data.noPath) {
        wx.switchTab({
          url: '/pages/index/index'
        })
      } else {
        if (e.currentTarget.dataset.path == '/Pages/index/index') {
          wx.switchTab({
            url: '/Pages/index/index'
          })
        } else {
          wx.reLaunch({
            url: e.currentTarget.dataset.path + '?params=' + e.currentTarget.dataset.params
          });
        }

      }
    });
  },
  getUserInfo: function(e) {
    console.log(e);
    if (e.detail.userInfo) {
      wx.setStorageSync('rawData', e.detail.rawData);
      var rawData = e.detail.rawData;
      var inviteCode = '';
      new Promise(function(resolve, reject) {
        var str = JSON.parse(e.currentTarget.dataset.params).inviteCode;
        resolve(str);
      }).then(result => {
        this.preLogin2(e, rawData, result);
      }).catch(err => {
        //JSON解析失败
        this.preLogin2(e, rawData, inviteCode);
      });
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
            rawData: obj.rawData
          },
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
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  }
})