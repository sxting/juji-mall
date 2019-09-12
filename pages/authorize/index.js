import {
    constant
} from '../../utils/constant';
import {
    service
} from '../../service';
var app = getApp();
Page({
    data: {
        nvabarData: {
            showCapsule: 1,
            title: '桔 集',
            isIndex: 1
        },
        inviteCode: '',
        openId: '',
        pageType: 0, //0为个人中心页面，1为订单提交页面
        pageData: {},
        sharePersonOpenId: '',
        shareProductId: '',
        scene: '' //扫码进入
    },
    onLoad: function(options) {
        console.log('---------授权页面----------');
        console.log(options);
        if (options.pagetype) {
            this.setData({
                pageType: options.pagetype
            });
        }
        this.setData({
            pageData: options
        });
    },

    getUserInfo: function(e) {
        if (e.detail.userInfo) {
            console.log('点击授权按钮');
            wx.setStorageSync('rawData', e.detail.rawData);

            var obj = {
                rawData: e.detail.rawData,
                inviteCode: this.data.inviteCode,
                scene: this.data.scene
            };
            this.login(obj).then(() => {
                this.nextPage();
            });
        }
    },

    nextPage: function() {
        console.log("走下一页");
        console.log('pageType====' + this.data.pageType);
        if (this.data.pageType == 0) {
            wx.reLaunch({
                url: '/pages/user/index'
            });
        }
        if (this.data.pageType == 1) {
            let str = '', self = this;
            for (let key in self.data.pageData) {
                str += `&${key}=${self.data.pageData[key]}`
            }
            str = str.substring(1);
            wx.redirectTo({
                url: `/pages/payOrder/index?${str}`,
            })
        }
    },

    login: function (obj) {
        return new Promise(function (resolve1, reject1) {
            wx.login({
                success: res => {
                    console.log('code: ' + res.code);
                    console.log(constant.APPID);
                    resolve1(res.code);
                }
            });
        }).then(function (code) {
            return new Promise(function (resolve2, reject2) {
                console.log("登录请求inviteCode=" + obj.inviteCode);
                console.log("登录请求scene=" + obj.scene);
                wx.request({
                    url: constant.apiUrl + '/user/login.json',
                    method: 'GET',
                    data: {
                        code: code,
                        appId: constant.APPID,
                        isMock: false, //测试标记
                        inviteCode: obj.inviteCode,
                        rawData: obj.rawData,
                        sceneId: obj.scene
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
                            wx.setStorageSync('distributorRole', res1.data.data.distributorRole);
                            wx.setStorageSync('member', res1.data.data.member);
                            wx.setStorageSync('level', res1.data.data.level);
                            wx.setStorageSync('memberDays', res1.data.data.memberDays);
                            wx.setStorageSync('memberExpireTime', res1.data.data.memberExpireTime);
                            wx.setStorageSync('nickName', res1.data.data.nickName);
                            wx.setStorageSync('avatar', res1.data.data.avatar);
                            wx.setStorageSync('memberInviteCode', res1.data.data.memberInviteCode)

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
        }).catch(function (err) {
            console.log(err);
            wx.showModal({
                title: '错误',
                content: err
            });
        });
    }
})