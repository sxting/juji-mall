var util = require('../../../utils/util.js');
import { service } from '../../../service';
import { activitiesService } from '../shared/service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
var NP = require('../../../utils/number-precision.js');
var app = getApp();
Page({
    data: {
        productId: '',
        storeId: '',
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
        isHiddenClose: false,
        lat: '',
        lng: '',
        shared: 0, //首页分享按钮进入值为1
        activityOrderId: '',
        activityId: '',
        resData: '',
        activityOrderId: '',
        progressId: '',
        self: '',
        showCom: false,
        ruleInfo: {},
        productProgress: '0.00',
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
            activityId: options.activityId,
            activityOrderId: options.activityOrderId ? options.activityOrderId : '',
            progressId: options.progressId ? options.progressId : '',
            activityStatus: options.status ? options.status : ''
        });
        // 查询商品详情
        this.getData();
    },
    onHide: function() {
        this.setData({ isBack: true });
    },
    onShow: function() {
        this.setData({ showCom: false })
        if (this.data.isBack) {
            this.getData(); // 返回刷新
        }
    },
    onShareAppMessage: function(res) {
        var nickName = JSON.parse(wx.getStorageSync('userinfo')).nickName;
        var activityId = this.data.activityId;
        var gender = JSON.parse(wx.getStorageSync('userinfo')).gender == 1 ? '他' : '她';
        var activityOrderId = this.data.activityOrderId;
        var picId = this.data.resData.cover;
        var productName = this.data.resData.productName;
        var price = Number(this.data.resData.activityPrice / 100).toFixed(2);
        var oprice = Number(this.data.resData.originalPrice / 100).toFixed(2);
        if (res.from === 'button') {
            return {
                title: nickName + '正在秒杀' + price + '的【' + productName + '】，快来帮助' + gender + '吧',
                path: '/pages/login/index?pagetype=6&type=SPLICED&activityId=' + activityId + '&activityOrderId=' + activityOrderId + '&invitecode=' + wx.getStorageSync('inviteCode'),
                imageUrl: constant.basePicUrl + picId + '/resize_560_420/mode_fill'
            }
        }
        return {
            title: nickName + '分享给您一个心动商品，快来一起体验吧！',
            path: '/pages/login/index?pagetype=6&type=' + this.data.type + '&activityId=' + this.data.activityId + '&invitecode=' + wx.getStorageSync('inviteCode'),
            imageUrl: constant.basePicUrl + picId + '/resize_560_420/mode_fill'
        }
    },
    onStartKanjia(e) {
        console.log(e.detail);
        if (e.detail) {
            this.setData({
                activityOrderId: e.detail.activityOrderId
            })
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
        if (e.currentTarget.dataset.lat && e.currentTarget.dataset.lng) {
            wx.navigateTo({
                url: '/pages/map/index?lat=' + e.currentTarget.dataset.lat + '&lng=' + e.currentTarget.dataset.lng,
            });
        }
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
    gohomepage: function() {
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
        console.log(this.data.activityOrderId);
        activitiesService.activity({
            activityId: this.data.activityId,
            activityOrderId: this.data.activityOrderId,
            activityType: 'SEC_KILL',
            activityStatus: this.data.activityStatus,
            progressId: this.data.progressId
        }).subscribe({
            next: res => {
                that.setData({
                    showCom: true
                });
                that.setData({ productProgress: (res.rules[0].soldStock * 100) / res.rules[0].activityStock });
                var picsStrArr = res.cover.split(',');
                picsStrArr.forEach(function(item, index) {
                    picsStrArr[index] = constant.basePicUrl + item + '/resize_751_420/mode_fill'
                });
                if (res.orderDigest) {
                    res.yikan = NP.minus(res.originalPrice, res.orderDigest.currentSalesPrice)
                }
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
                        activityOrderId: res.orderDigest ? res.orderDigest.activityOrderId : '',
                        ruleInfo: res.rules[0]
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
                        activityOrderId: res.orderDigest ? res.orderDigest.activityOrderId : '',
                        ruleInfo: res.rules[0]
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