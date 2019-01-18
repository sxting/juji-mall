import { errDialog, loading } from '../../utils/util'
import { constant } from '../../utils/constant';
import { service } from '../../service';
Page({
    data: {
        constant: {},
        tablist: ['消费', '购卡'],
        curTabIndex: 0,
        consumeRecord: [],
        buyRecord: [],
        isShowNodata1:false,
        isShowNodata2:false,
        isShow: true
    },
    switchTab: function(e) {
        var thisIndex = e.currentTarget.dataset.index;
        this.setData({ curTabIndex: thisIndex });
    },
    toComment: function(e) {
      var id = e.currentTarget.dataset.id;
      wx.navigateTo({ url: '/pages/createReply/index?page=trade&orderId=' + id });
    },
    toBusinessDetail:function(e){
      var cardtype = e.currentTarget.dataset.type;
      var merchantId = e.currentTarget.dataset.id;
      wx.navigateTo({ url: '../businessDetails/index?cardType=' + cardtype + '&id=' + merchantId});
    },
    getData: function() {
        wx.showLoading({title:'加载中'});
        service.payRecord().subscribe({
            next: res => {
              console.log('----------交易记录数据--------');
              console.log(res);
                this.setData({isShowNodata1:res.length==0})
                for (let i = 0; i < res.length; i++) {
                    res[i].totalFee ? res[i].totalFee = res[i].totalFee.toFixed(2) : res[i].totalFee = '0.00';
                }
                this.setData({ consumeRecord: res });
            },
            error: err => errDialog(err),
            complete: () => wx.hideLoading()
        });
    },
    onShow: function() {
        this.getData();
    },
    onLoad: function(options) {
        this.setData({ constant: constant });
        wx.setNavigationBarTitle({ title: '我的交易' });
        service.buyCardRecord().subscribe({
            next: res => {
                this.setData({isShowNodata2:res.length==0})
                for (let i = 0; i < res.length; i++) {
                    res[i].pay ? res[i].pay = res[i].pay.toFixed(2) : res[i].pay = '0.00';
                }
                this.setData({ buyRecord: res });
            },
            error: err => errDialog(err),
            complete: () => wx.hideLoading()
        });
    }
})