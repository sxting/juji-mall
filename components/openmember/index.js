import {
    service
} from '../../service';
import {
    errDialog,
    loading,
    showAlert
} from '../../utils/util'
import {
    constant
} from '../../utils/constant';

Component({

    data: {
        count: 1,
        orderBizType: 'NORMAL'
    },
    
    properties: {
        shareSceneId: {
            type: String,
            value: ''
        }
    },

    ready: function() {
        var _this = this
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

                _this.setData({
                    dataList: res.productSkus,
                    selectedCard: res.productSkus[0],
                    productId: res.productId,
                    skuMajorId: res.productSkus[0].id,
                    skuId: res.productSkus[0].skuId,
                    resData: res,
                    productInfo: res
                });

                // 回传自身的sceneId
                _this.triggerEvent('initialize', res.sceneId)
            },
            error: err => showAlert(err),
            complete: () => wx.hideToast()
        })
    },

    methods: {

        success() {
            this.triggerEvent('success')
        },

        _cardClick(e) {
            this.setData({
                selectedCard: e.currentTarget.dataset.card
            });
        },

        _collectFormIds: function (e) {
            console.log(e.detail);
            service.collectFormIds({
                formId: e.detail.formId
            }).subscribe({
                next: res => {
                    console.log(res)
                }
            });
        },

        _buy() {
            wx.showToast({
                title: '加载中',
                icon: 'loading',
                mask: true,
                duration: 60 * 1000
            });
            var _this = this
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
                                        sceneId: this.data.shareSceneId,
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
                                    orderBizType: this.data.orderBizType,
                                    needDeductStock: false
                                };
                                service.saveOrder(orderObj).subscribe({
                                    next: res1 => {
                                        console.log('--------创建订单返回1混合支付-------');
                                        console.log(res1);
                                        var payInfo = JSON.parse(res1.payInfo);
                                        wx.hideToast()
                                        wx.requestPayment({
                                            timeStamp: payInfo.timeStamp,
                                            nonceStr: payInfo.nonceStr,
                                            package: payInfo.package,
                                            signType: payInfo.signType,
                                            paySign: payInfo.paySign,
                                            success: (res2) => {
                                                _this.success()                                             
                                            },
                                            fail: (res2) => {
                                                if (res2.errMsg == 'requestPayment:fail cancel') {
                                                    wx.showToast({
                                                        title: '用户取消支付',
                                                        icon: 'none'
                                                    });
                                                }
                                            }
                                        });
                                    },
                                    error: err => {
                                        errorAlert(err);
                                    }
                                });
                            } else {
                                wx.hideToast()
                                var number = this.data.productInfo.limitPerOrderNum;
                                var errMsg = '该商品每单最多可以购买' + number + '件';
                                showAlert(errMsg);
                            }
                        } else {
                            wx.hideToast()
                            var number = this.data.productInfo.limitPerDayNum - res.totalToday;
                            var errMsg = number == 0 ? '超出购买限制' : '该商品今日还可以购买' + number + '件';
                            showAlert(errMsg);
                        }
                    } else {
                        wx.hideToast()
                        var number = this.data.productInfo.limitMaxNum - res.totalAll;
                        var errMsg = number == 0 ? '超出购买限制' : '该商品您最多还可以购买' + number + '件';
                        showAlert(errMsg);
                    }
                },
                error: err => {
                    wx.hideToast()
                    showAlert(err);
                }
            })
        }
    }
})