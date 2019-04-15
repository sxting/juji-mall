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

              wx.reLaunch({
                url: '/pages/login/index?isToken=0',
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
