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
        qrcode: ''
    },

    onLoad: function (options) {
        var conHeight = app.globalData.screenHeight - app.globalData.barHeight - 45;
        console.log(options);
        this.setData({ 
            conHeight: conHeight,
            amount: options.amount,
            merchantId: options.merchantId,
            storeId: options.storeId,
            qrcode: options.qrcode
        });

        let crossData = {
            merchantId: this.data.merchantId,
            storeId: this.data.storeId,
            amount: Number(this.data.amount * 100).toFixed(0),
            qrcode: this.data.qrcode
        }
        service.crossIndustry(crossData).subscribe({
            next: res => {
                if (res.length > 0) {
                    this.setData({
                        products: res,
                        selectProduct: res[0],
                        selectProductId: res[0].productId,
                        skuId: res[0].defaultSku.skuId,
                    });
                }
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        }) 
    },

    selectProduct(e) {
        let item = e.currentTarget.dataset.item;
        console.log(item);
        this.setData({
            selectProduct: item,
            selectProductId: item.productId,
            skuId: item.defaultSku.skuId
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
                amount: Number(this.data.amount * 100).toFixed(0),
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