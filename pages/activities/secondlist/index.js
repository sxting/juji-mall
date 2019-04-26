var util = require('../../../utils/util.js');
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
import { activitiesService } from '../shared/service.js'

Page({
    data: {
        productList1: [],
        productList2: [],
        isShowNodata: false,
        curIndex:1,
        pageNo1: 1,
        pageNo2: 1,
        providerId: '',
        ifBottom: false,
        curActivityStatus:'STARTED'
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '限时秒杀' });
        this.setData({providerId: wx.getStorageSync('providerId')});
        console.log(this.data.providerId);
        this.getActivityList('STARTED'); //获取活动列表
        this.getActivityList('READY'); //获取活动列表
    },
    onReachBottom: function() {
        if(this.data.curActivityStatus=='STARTED'){
            if (this.data.ifBottom1) { //已经到底部了
                return;
            } else {
                this.setData({
                    pageNo1: this.data.pageNo1 + 1
                })
                this.getActivityList(this.data.curActivityStatu); //获取砍价列表信息
            }
        }else{
            if (this.data.ifBottom2) { //已经到底部了
                return;
            } else {
                this.setData({
                    pageNo1: this.data.pageNo2 + 1
                })
                this.getActivityList(this.data.curActivityStatu); //获取砍价列表信息
            }
        }
    },
    activeTab:function(e){
        var index = e.currentTarget.dataset.index;
        this.setData({curIndex:index});
        if(index==1){
            this.setData({ isShowNodata: this.data.productList1.length == 0 });
        }else{
            this.setData({ isShowNodata: this.data.productList2.length == 0 });
        }
    },
    getActivityList: function(status) {
        let data = {
            providerId: this.data.providerId,
            activityType: 'SEC_KILL',
            activityStatus: status,
            pageNo: status=='STARTED'?this.data.pageNo1:this.data.pageNo2,
            pageSize: 10
        }
        activitiesService.activityList(data).subscribe({
            next: res => {
                if (res) {
                    console.log(res);
                    if(status=='STARTED'){
                        for(var i=0;i<res.length;i++){
                            res[i].progressNum = Number(100 - res[i].balanceStock*100/res[i].activityStock).toFixed(2);
                        }
                        this.setData({
                            productList1: this.data.productList1.concat(res),
                            ifBottom1: res.length < 10 ? true : false
                        });
                        this.setData({ isShowNodata: this.data.productList1.length == 0 });
                    }else{

                        this.setData({
                            productList2: this.data.productList2.concat(res),
                            ifBottom2: res.length < 10 ? true : false
                        });
                    }
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
    toDetail: function(e) {
        var pid = e.currentTarget.dataset.productid;
        var status = e.currentTarget.dataset.status;
        wx.navigateTo({
            url: '/pages/activities/secondDetail/index?type=BARGAIN&id=' + pid +'&status='+status + '&activityId=' + e.currentTarget.dataset.activityid
        });
    }
});