import xs from '../lib/xstream/index';
import { constant } from 'constant';
import { loading } from 'util';

let http = {}

http.get = (url, data = {} ) => {
  if (wx.getStorageSync('token')){
    let header = { 'content-type': 'application/json', 'token': wx.getStorageSync('token') };
    for (let objName in data) {
      if (data[objName] === undefined || data[objName] === 'undefined') {
        data[objName] = '';
      }
    }
    return http_request(url, 'GET', data, header)
  }else{
    console.log('未获取到token');
    // wx.navigateTo({
    //   url: '/pages/login/index',
    // });
    return ;
  }
  
}
//'application/x-www-form-urlencoded' 'application/json'
http.post = (url, data = {}) => {
  if (wx.getStorageSync('token')) {
    let header = { 'content-type': 'application/json', 'token': wx.getStorageSync('token') };
    for (let objName in data) {
      if (data[objName] === undefined || data[objName] === 'undefined') {
        data[objName] = '';
      }
    }
    return http_request(url, 'POST', data, header)
  }else{
    console.log('未获取到token');
    // wx.navigateTo({
    //   url: '/pages/login/index',
    // });
    return;
  }
}

function http_request(
  url,
  method = 'GET',
  data = {},
  header = { 'content-type': 'application/json' }) {
  const producer = {
    start: listener => {
      wx.request({
        url: url,
        data: data,
        header: header,
        method: method,
        success: res => {
          if (res.data.errorCode === '200') {
            return listener.next(res.data.data);
          } else {
            if (res.data.errorCode === 'LOGIN_EXPIRE' || res.data.errorCode === 'token error'){
              console.log('调用重新登录');

              new Promise(function (resolve, reject) {
                console.log('Promise is ready!');
                wx.getSetting({
                  success: (res) => {
                    console.log(res.authSetting['scope.userInfo']);
                    if (!res.authSetting['scope.userInfo']) {
                      wx.reLaunch({
                        url: '/pages/login/index'
                      });
                    } else { //如果已经授权
                      //判断rowData是否存在
                      // if (wx.getStorageSync('rawData')) { //如果存在
                        resolve();
                      // } else { //如果不存在rowData
                      //   reject('未获取rawData');
                      // }
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
                        wx.switchTab({
                          url: '/pages/index/index',
                        });
                        wx.showModal({
                          title: '登录令牌过期',
                          content: '已重新登录并返回首页获取位置等信息',
                        });
                      } else {
                        wx.showModal({
                          title: '错误',
                          content: '登录失败，错误码:' + res1.data.errorCode + ' 返回错误: ' + res1.data.errorInfo
                        });
                      }
                    }
                  })

                }).catch(function (err) {
                  console.log(err);
                  wx.showModal({
                    title: '错误',
                    content: err
                  });
                });
              
            }else{
              return listener.error(res.data.errorInfo);
            }
            
          }
        },
        fail: res => listener.error(res.errMsg),
        complete: () => listener.complete()
      })
    },
    stop: () => { }
  }
  return xs.create(producer)
}

http.uploadFile = (
  url,
  filePath,
  name,
  header = {},
  formData = {}) => {
  const producer = {
    start: listener => {
      wx.uploadFile({
        url: url,
        filePath: filePath,
        name: name,
        header: header,
        formData: formData,
        success: res => listener.next(res),
        fail: res => listener.error(new Error(res.errMsg)),
        complete: () => listener.complete()
      })
    },
    stop: () => { }
  }
  return xs.create(producer)
}

http.downloadFile = (
  url,
  header = {}) => {
  const producer = {
    start: listener => {
      wx.downloadFile({
        url: url,
        header: header,
        success: res => listener.next(res),
        fail: res => listener.error(new Error(res.errMsg)),
        complete: () => listener.complete()
      })
    },
    stop: () => { }
  }
  return xs.create(producer)
}

module.exports = {
  http: http
}
