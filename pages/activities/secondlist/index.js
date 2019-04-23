var util = require('../../../utils/util.js');
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
import { activitiesService } from '../shared/service.js'

Page({
    data: {
        sceneType: 'SEC_KILL',
        productList: [],
        isShowNodata: false,
        pageNo: 1,
        providerId: '',
        ifBottom: false
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '限时秒杀' });
        this.setData({providerId: wx.getStorageSync('providerId')});
        console.log(this.data.providerId);
        this.getActivityList(); //获取活动列表
    },
    onReachBottom: function() {
        if (this.data.ifBottom) { //已经到底部了
            return;
        } else {
            this.setData({
                pageNo: this.data.pageNo + 1
            })
            this.getActivityList(); //获取砍价列表信息
        }
    },
    getActivityList: function() {
        let data = {
            providerId: this.data.providerId,
            activityType: 'BARGAIN',
            pageNo: this.data.pageNo,
            pageSize: 10
        }
        activitiesService.activityList(data).subscribe({
            next: res => {
                if (res) {
                    console.log(res);
                    this.setData({
                        productList: this.data.productList.concat(res),
                        ifBottom: res.length == 0 ? true : false
                    })
                    this.setData({ isShowNodata: this.data.productList.length == 0 });
                }
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    switchToOrderListPage: function(e) {
        wx.navigateTo({
            url: '/pages/activities/mySecond/index?type=' + e.currentTarget.dataset.type
        });
    },
    checkProductDetail: function(e) {
        console.log(e.currentTarget.dataset.productid);
        wx.navigateTo({
            url: '/pages/activities/secondDetail/index?type=BARGAIN&id=' + e.currentTarget.dataset.productid + '&activityId=' + e.currentTarget.dataset.activityid
        });
    }
});