// pages/member/index.js
import {
    service
} from '../../service';
import {
    errDialog,
    loading
} from '../../utils/util'
import {
    constant
} from '../../utils/constant';
var app = getApp();

Page({
    data: {
        nvabarData: {
            showCapsule: 1,
            title: '开通会员',
            isIndex: 2
        },
        dataList: [],
        selectedCard: {},
        storeId: '',
        productInfo: {},
        count: 1,
        sceneId: "",
        inviteCode: '',
        orderBizType: 'NORMAL',
        paying: false,
        resData: {}
    },

    onLoad: function(options) {
        wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: '#FF6400',
        })
        wx.getSystemInfo({
            success: (res) => {
                var conHeight = res.windowHeight - app.globalData.barHeight - 45;
                this.setData({
                    conHeight: conHeight
                })
            }
        });
        this.setData({
            sceneId: options.sceneId ? options.sceneId : ''
        })
        getData.call(this);
    },

    share: function(obj) {
        service.share(obj).subscribe({
            next: res => {
                console.log('---------分享接口返回--------');
                console.log(res);
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },

    onShareAppMessage: function(res) {
        var obj = {
            type: 'SHARE_PROGRAM',
            sharePath: '/pages/member/index'
        };
        this.share(obj);
        return {
            title: '桔集：聚集优质好店，体验美好生活，加入成为会员吧！',
            imageUrl: '/images/shareImg.png',
            path: '/pages/login/index?pagetype=7&sceneId=' + this.data.resData.sceneId
        }
    },

    //收集formid做推送
    collectFormIds: function(e) {
        console.log(e.detail);
        service.collectFormIds({
            formId: e.detail.formId
        }).subscribe({
            next: res => {
                console.log(res)
            }
        });
    },

    cardClick(e) {
        this.setData({
            selectedCard: e.currentTarget.dataset.card
        });
        this.getItemInfo()
    },

    buy() {
        if (this.data.paying) {
            return
        }
        this.toProductPay();
    },

    getItemInfo: function() {
        console.log("普通商品详情");
        service.getItemInfo({
            productId: this.data.productId,
            // storeId: this.data.storeId
        }).subscribe({
            next: res => {
                this.setData({
                    productInfo: res.product,
                    store: res.store,
                    price: res.product.price,
                    point: res.product.point,
                    showProduct: true
                });
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },

    showAlert: function(msg) {
        wx.showModal({
            title: '提示',
            content: msg
        });
        this.setData({
            paying: false
        });
    },
    errorAlert: function(msg) {
        wx.showModal({
            title: '支付失败',
            content: msg
        });
        this.setData({
            paying: false
        });
    },
    cancelPay: function() {
        wx.showToast({
            title: '用户取消支付',
            icon: 'none'
        });
        this.setData({
            paying: false
        });
    },

    // 普通商品支付
    toProductPay: function() {
        this.setData({
            paying: true
        })
        service.getPre({
            productId: this.data.productId
        }).subscribe({
            next: res => {
                console.log('--------下单前数据校验-------');
                if (res.pointBalance < this.data.productInfo.point * this.data.count) {
                    this.showAlert('当前桔子余额不足，请多赚些桔子吧');
                }
                //判断条件 如果：过往已经购买的数量 + 要买的数量 > 限制购买的最大数量 处理：禁止下单
                if (res.totalAll + this.data.count <= this.data.productInfo.limitMaxNum) {
                    //判断条件 如果：今日已经购买的数量 + 要买的数量 > 今日限制购买的最大数量 处理：禁止下单
                    if (res.totalToday + this.data.count <= this.data.productInfo.limitPerDayNum) {
                        //判断条件 如果：要买的数量 > 每个订单限制购买的最大数量 处理：禁止下单
                        if (this.data.count <= this.data.productInfo.limitPerOrderNum) {
                            //创建订单
                            var info = this.data.selectedCard;
                            // var point = info.point == null || info.point == 0 ? '0' : info.point;
                            var point = 0;
                            var price = info.price == null || info.price == 0 ? '0' : info.price;
                            if (point == 0 && price > 0) {
                                var payTypeValue = 'WECHAT';
                            } else if (point > 0 && price == 0) {
                                var payTypeValue = 'POINT';
                            } else {
                                var payTypeValue = 'MIX';
                            }
                            var orderObj = {
                                itemRequests: [{
                                    sceneId: this.data.sceneId,
                                    inviteCode: this.data.inviteCode,
                                    merchantId: this.data.productInfo.merchantId,
                                    merchantName: this.data.productInfo.merchantName,
                                    num: this.data.count,
                                    originalPrice: this.data.productInfo.originalPrice,
                                    payAmount: price * this.data.count,
                                    payPoint: point * this.data.count,
                                    picId: this.data.productInfo.picId,
                                    point: point,
                                    price: price,
                                    productId: this.data.productInfo.productId,
                                    productName: this.data.productInfo.productName,
                                    skuId: this.data.skuId,
                                    skuMajorId: this.data.skuMajorId,
                                    type: this.data.productInfo.type
                                }],
                                openId: wx.getStorageSync('openid'),
                                originAmount: this.data.productInfo.originalPrice * this.data.count,
                                payAmount: price * this.data.count,
                                payPoint: point * this.data.count,
                                payType: payTypeValue,
                                providerId: this.data.productInfo.providerId,
                                providerName: this.data.productInfo.providerName,
                                orderBizType: this.data.orderBizType
                            };
                            service.saveOrder(orderObj).subscribe({
                                next: res1 => {
                                    console.log('--------创建订单返回1混合支付-------');
                                    console.log(res1);
                                    var payInfo = JSON.parse(res1.payInfo);
                                    wx.requestPayment({
                                        timeStamp: payInfo.timeStamp,
                                        nonceStr: payInfo.nonceStr,
                                        package: payInfo.package,
                                        signType: payInfo.signType,
                                        paySign: payInfo.paySign,
                                        success: (res2) => {
                                            this.setData({
                                                paying: false
                                            });
                                            var obj = {
                                                rawData: '',
                                                inviteCode: '',
                                                scene: ''
                                            };
                                            this.login(obj).then(() => {
                                                wx.reLaunch({
                                                    url: '/pages/jujiGarden/gardenIndex/index',
                                                })
                                            });
                                        },
                                        fail: (res2) => {
                                            if (res2.errMsg == 'requestPayment:fail cancel') {
                                                this.cancelPay();
                                            }
                                        }
                                    });
                                },
                                error: err => {
                                    this.errorAlert(err);
                                }
                            });
                        } else {
                            var number = this.data.productInfo.limitPerOrderNum;
                            var errMsg = '该商品每单最多可以购买' + number + '件';
                            this.showAlert(errMsg);
                        }
                    } else {
                        var number = this.data.productInfo.limitPerDayNum - res.totalToday;
                        var errMsg = number == 0 ? '超出购买限制' : '该商品今日还可以购买' + number + '件';
                        this.showAlert(errMsg);
                    }
                } else {
                    var number = this.data.productInfo.limitMaxNum - res.totalAll;
                    var errMsg = number == 0 ? '超出购买限制' : '该商品您最多还可以购买' + number + '件';
                    this.showAlert(errMsg);
                }
            },
            error: err => {
                this.showAlert(err);
            }
        })
    },

    login: function(obj) {
        return new Promise(function(resolve1, reject1) {
            wx.login({
                success: res => {
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
                        sceneId: obj.scene
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
                            wx.setStorageSync('distributorRole', res1.data.data.distributorRole);
                            wx.setStorageSync('member', res1.data.data.member);
                            wx.setStorageSync('level', res1.data.data.level);
                            wx.setStorageSync('memberDays', res1.data.data.memberDays);
                            wx.setStorageSync('memberExpireTime', res1.data.data.memberExpireTime);
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
            wx.showModal({
                title: '错误',
                content: err
            });
        });
    }
})

function getData() {
    service.memberDefines({}).subscribe({
        next: res => {

            // 19.07.17兼容后台送桔子新版本
            if (res.product) {
                var pointMap = res.pointMap
                res = res.product
                var productSkus = res.productSkus
                productSkus.forEach(p => {
                    // 自定义添加一个送桔子属性
                    p['sendPoint'] = pointMap[p.skuId]
                })
            }

            this.setData({
                dataList: res.productSkus,
                selectedCard: res.productSkus[0],
                productId: res.productId,
                skuMajorId: res.productSkus[0].id,
                skuId: res.productSkus[0].skuId,
                // data里边的sceneId为onLoad函数入参options里边的sceneId，用来确定点击谁的分享链接进入
                // 请求会员卡数据后不应该替换sceneId
                // sceneId: this.data.sceneId ? this.data.sceneId : res.sceneId,
                resData: res
            });

            this.getItemInfo();
        },
        error: err => console.log(err),
        complete: () => wx.hideToast()
    })
}