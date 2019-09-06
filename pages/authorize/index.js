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
            this.nextPage();
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
            // paytype=3&id=2019072916415006016069712&storeid=111563783233186948&sceneid=&inviteCode=&skuId=cYZggNDm&smId=1147&buyMember=undefined

            // paytype=3&id=2019082211035731338375102&storeid=111552548538131232&sceneid=&inviteCode=&skuId=2r85k4KH&smId=1415&buyMember=1
        }
    }
})