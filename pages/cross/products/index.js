// pages/cross/products/index.js
import {
    service
} from '../../../service';
import {
    constant
} from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';

var app = getApp();

Page({
    data: {
        nvabarData: { showCapsule: 0, title: '桔 集' },
        constant: constant,
        conHeight: 400,
        merchantId: '',
        storeId: '',
        amount: 0,
        products: [],
        selectProduct: '',
        selectProductId: '',
        skuId: '',
        alreadyPay: false,
    },

    onLoad: function (options) {
        var conHeight = app.globalData.screenHeight - app.globalData.barHeight - 45;
        this.setData({ 
            conHeight: conHeight,
            amount: options.amount,
            products: JSON.parse(options.products),
            merchantId: options.merchantId,
            storeId: options.storeId,
            selectProduct: JSON.parse(options.products)[0],
            selectProductId: JSON.parse(options.products)[0].productId,
            skuId: JSON.parse(options.products)[0].defaultSku.skuId,
        })
    },

    selectProduct(e) {
        let item = e.currentTarget.dataset.item;
        console.log(item);
        this.setData({
            selectProduct: item,
            selectProductId: item.productId
        })
    },

    selectSku(e) {
        let skuId = e.currentTarget.dataset.id;
        this.setData({
            skuId: skuId
        })
    },

    toPay() {
        if (this.data.selectProduct) {
            if (this.data.alreadyPay) {
                return;
            } else {
                this.setData({
                    alreadyPay: true
                })
            };
            wx.showToast({
                title: '加载中',
                icon: 'loading',
                mask: true
            });
            let data = {
                merchantId: this.data.merchantId,
                storeId: this.data.storeId,
                productId: this.data.selectProduct.productId,
                amount: this.data.amount * 100,
                skuId: this.data.skuId,
            };
            service.crossPayment(data).subscribe({
                next: res1 => {
                    let payInfo = JSON.parse(res1.payInfo);
                    wx.requestPayment({
                        timeStamp: payInfo.timeStamp,
                        nonceStr: payInfo.nonceStr,
                        package: payInfo.package,
                        signType: payInfo.signType,
                        paySign: payInfo.paySign,
                        success: (res2) => {
                            wx.redirectTo({
                                url: '/pages/payresult/index?orderId=' + res1.orderId + '&from=yiye',
                            });
                            this.setData({
                                alreadyPay: false
                            });
                        },
                        fail: (res2) => {
                            if (res2.errMsg == 'requestPayment:fail cancel') {
                                wx.showToast({
                                    title: '用户取消支付',
                                    icon: 'none'
                                });
                                this.setData({
                                    alreadyPay: false
                                });
                            }
                        }
                    });
                },
                error: err => {
                    errDialog(err);
                    this.setData({
                        alreadyPay: false
                    });
                },
                complete: () => wx.hideToast()
            })
        } else {
            wx.showModal({
                title: '温馨提示',
                content: '请选择赠品',
            });
        }
    },

})