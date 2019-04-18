import { service } from '../../../service';
import { activitiesService } from '../shared/service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';

Page({
    data: {
        portraitUrl: '/images/unkonw-icon.png',
        headPortraitList: ['', ''], //拼团中 参团的头像
        restHour: '00',
        restMinute: '00',
        restSecond: '00',
        activityId: '',
        activityOrderId: '',
        activityType: '',
        productInfo: {}, //商品详情
        orderId: '',
        store: {}, //
        activityStatus: 'IN_PROGRESS',
        progressId: '',
        storeId: '',
        productId: ''
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '项目详情' });
        this.setData({
            progressId: options.progressId ? options.progressId : '',
            activityId: options.activityId ? options.activityId : '',
            activityOrderId: options.activityOrderId ? options.activityOrderId : '',
            activityType: options.activityType ? options.activityType : 'SPLICED'
        })
        this.getItemInfo(); //调取详情页接口
    },
    switchToOrderDetailPage: function() {
        wx.navigateTo({
            url: '/pages/orderDetail/index?id=' + this.data.productOrderInfo.orderId + '&storeid=' + this.data.storeId
        });
    },
    onShareAppMessage: function() {
        return {
            title: '嗨！便宜一起拼￥' + this.data.productInfo.activityPrice / 100 + '【' + this.data.productInfo.productName + '】',
            path: '/pages/login/index?pagetype=5&type=' + this.data.activityType + '&activityId=' + this.data.activityId + '&activityOrderId=' + this.data.activityOrderId + '&progressId=' + this.data.progressId,
            imageUrl: constant.basePicUrl + this.data.productInfo.cover + '/resize_560_420/mode_fill',
        }
    },
    callPhone(e) {
        let phone = e.currentTarget.dataset.phone;
        wx.makePhoneCall({
            phoneNumber: phone,
        });
    },
    toMerchantsList: function() {
        wx.navigateTo({
            url: '/pages/merchantsCanUse/index?id=' + this.data.productId
        });
    },
    getItemInfo: function() {
        let data = {
            progressId: this.data.progressId,
            activityId: this.data.activityId,
            activityOrderId: this.data.activityOrderId,
            activityType: 'SPLICED'
        }
        activitiesService.activity(data).subscribe({
            next: res => {
                if (res) {
                    console.log(res);
                    /** 参团的人 **/
                    if (res.orderDigest && res.orderDigest.progresses.length != 0) {
                        let resNum = 2 - res.orderDigest.progresses.length;
                        for (let i = 0; i < resNum; i++) {
                            res.orderDigest.progresses.push({});
                        }
                    }
                    this.setData({
                        productInfo: res,
                        productOrderInfo: res.orderDigest,
                        store: res.product.store,
                        storeId: res.product.store.id,
                        headPortraitList: res.orderDigest.progresses,
                        productId: res.orderDigest ? res.orderDigest.productId : '',
                        activityStatus: res.orderDigest ? res.orderDigest.activityOrderStatus : '',
                    })
                }
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    }
})