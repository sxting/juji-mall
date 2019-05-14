var util = require('../../../utils/util.js');
import { service } from '../../../service';
import { activitiesService } from '../shared/service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
var NP = require('../../../utils/number-precision.js');
var app = getApp();
Page({
    data: {
        nvabarData: {showCapsule: 1,title: '商品详情'},
        activityId:'',
        productId: '',
        showPics: [],
        commentList: [],
        productInfo: {},
        description: [],
        recommendList: [],
        store: {},
        commentCount: 0,
        recommendCount: 0,
        pointBalance: 0,
        note: [],
        activityStatus: '',
        despImgHeightValues: [],
        isShowData: false,
        lat: '',
        lng: '',
        resData: '',
        ruleInfo: {},
        productProgress: 0,
        remind: false,
        isBack: false
    },
    onLoad: function(options) {
        if (options.shared) {
            this.setData({ shared: options.shared });
        }
        wx.setNavigationBarTitle({ title: '商品详情' });
        this.setData({
            productId: options.id,
            activityId: options.activityId
        });
        // 查询商品详情
        this.getData();
    },
    onHide: function() {
        this.setData({ isBack: true });
    },
    onShow: function() {
        if (this.data.isBack) {
            this.getData(); // 返回刷新
        }
    },
    onShareAppMessage: function(res) {
        var picId = this.data.resData.cover;
        var productName = this.data.resData.productName;
        var price = Number(this.data.resData.activityPrice / 100).toFixed(2);
        return {
            title: price + '元秒杀'+productName+'，手慢无！',
            path: '/pages/login/index?pagetype=6&pid='+this.data.productId+'&activityId=' + this.data.activityId + '&invitecode=' + wx.getStorageSync('inviteCode'),
            imageUrl:constant.basePicUrl + this.data.resData.cover + '/resize_560_420/mode_fill'
        }
    },
    previewImage: function(e) {
        var arr = [];
        var url = constant.basePicUrl + e.currentTarget.dataset.url + '/resize_0_0/mode_fill';
        arr.push(url);
        wx.previewImage({
            urls: arr // 需要预览的图片http链接列表
        })
    },
    toMap: function(e) {
        wx.openLocation({
            latitude: e.currentTarget.dataset.lat,
            longitude: e.currentTarget.dataset.lng,
            name: this.data.store.name,
            address: this.data.store.address,
            scale: 15
        });
    },
    toMerchantsList: function() {
        wx.navigateTo({
            url: '/pages/merchantsCanUse/index?id=' + this.data.productId
        });
    },
    toComDetail: function(e) {
        var id = e.currentTarget.dataset.id;
        var storeid = e.currentTarget.dataset.storeid;
        wx.navigateTo({
            url: '/pages/comDetail/index?id=' + id + '&storeid=' + storeid
        });
    },
    call: function() {
        wx.makePhoneCall({
            phoneNumber: this.data.store.phone
        })
    },
    desImgLoad: function(event) {
        var arr = this.data.despImgHeightValues;
        arr.push(event.detail.height * 690 / event.detail.width);
        this.setData({
            despImgHeightValues: arr
        });
    },
    toIndex: function() {
        wx.switchTab({
            url: '/pages/index/index'
        });
    },
    toCommentList: function() {
        wx.navigateTo({
            url: '/pages/commentList/index?id=' + this.data.productId
        });
    },
    getData: function() {
        let that = this;
        activitiesService.activity({
            activityId: this.data.activityId,
            activityType: 'SEC_KILL'
        }).subscribe({
            next: res => {
                that.setData({
                    showCom: true
                });
                that.setData({ productProgress: Math.round((res.rules[0].soldStock * 100) / res.rules[0].activityStock) });
                var picsStrArr = res.cover.split(',');
                picsStrArr.forEach(function(item, index) {
                    picsStrArr[index] = constant.basePicUrl + item + '/resize_751_420/mode_fill'
                });
                new Promise(function(resolve, reject) {
                    let str = JSON.parse(res.product.product.note);
                    resolve(str);
                }).then(function(result) {
                    that.setData({
                        commentList: res.product.commentList,
                        productInfo: res.product.product,
                        description: JSON.parse(res.product.product.description),
                        recommendList: res.product.recommendList,
                        store: res.product.store,
                        commentCount: res.product.commentCount,
                        recommendCount: res.product.recommendList.length,
                        note: result,
                        showPics: picsStrArr,
                        isShowData: true,
                        remind: res.isRemind,
                        lat: res.product.store ? res.product.store.lat : '',
                        lng: res.product.store ? res.product.store.lng : '',
                        resData: res,
                        ruleInfo: res.rules[0],
                        activityStatus:res.activityStatus
                    });
                }).catch(function(err) {
                    that.setData({
                        commentList: res.product.commentList,
                        productInfo: res.product.product,
                        description: JSON.parse(res.product.product.description),
                        recommendList: res.product.recommendList,
                        store: res.product.store,
                        commentCount: res.product.commentCount,
                        recommendCount: res.product.recommendList.length,
                        showPics: picsStrArr,
                        isShowData: true,
                        remind: res.isRemind,
                        lat: res.product.store.lat,
                        lng: res.product.store.lng,
                        resData: res,
                        ruleInfo: res.rules[0],
                        activityStatus:res.activityStatus
                    });
                })
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },
    toCommentDetail: function(event) {
        wx.navigateTo({
            url: '/pages/commentDetail/index?id=' + event.currentTarget.dataset.comid
        });
    },
    toSecondKill: function() {
        wx.navigateTo({
            url: '/pages/payOrder/index?paytype=7&orderType=SEC_KILL&id=' + this.data.productId + '&activityId=' + this.data.activityId + '&splicedRuleId=' + this.data.resData.rules[0].secKillRuleId
        });
    },
    toRemainMe: function() {
        activitiesService.remind({
            activityId: this.data.activityId
        }).subscribe({
            next: res => {
                this.setData({ remind: true })
                wx.showToast({
                    title: "提醒成功",
                    icon: "success"
                });
            },
            error: err => {
                wx.showToast({ title: '系统错误' });
            },
            complete: () => wx.hideToast()
        })
    }
});