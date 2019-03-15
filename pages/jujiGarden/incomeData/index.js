import { jugardenService } from '../shared/service.js'
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
var app = getApp();
Page({
    data: {
        tablist: [{ name: '本日', type: '1' }, { name: '本周', type: '2' }, { name: '本月', type: '2' }, { name: '累计', type: '2' }],
        curTabIndex: 0,
        curActiveIndex:1,
        constant: constant,
        isShowNodata: false,
        recordlist: ['','',''],
        status:'',
        isFinall:false,
        amount: 0,
        sortIndex:1
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '我的收入' });
        getDataByType('',1)
    },
    toPage:function(e){
      var page = e.currentTarget.dataset.page;
      wx.navigateTo({ url: page });
    },
    switchTab: function(e) {
        var thisIndex = e.currentTarget.dataset.index;
        this.setData({ curTabIndex: thisIndex});
        var type = e.currentTarget.dataset.type;
        this.getDataByType('',type);
    },
    toggleLabel:function(e){
        var index = e.currentTarget.dataset.label;
        this.setData({ sortIndex: index });
    },
    switchActive:function(e){
        var index = e.currentTarget.dataset.index;
        this.setData({ curActiveIndex: index });
    },
    getDataByType:function(status,type){
        if(type==1){
            var startDate = '2019-01-01 00:00:00';
            var endDate = '2019-01-01 00:00:00';
        }
        if(type==2){
            var startDate = '2019-01-01 00:00:00';
            var endDate = '2019-01-01 00:00:00';
        }
        if(type==3){
            var startDate = '2019-01-01 00:00:00';
            var endDate = '2019-01-01 00:00:00';
        }
        if(type==4){
            var startDate = '2019-01-01 00:00:00';
            var endDate = '2019-01-01 00:00:00';
        }
        this.getData(status,startDate,endDate);
    },
    getData: function(status,startDate,endDate){
        jugardenService.getIncomeInfor({
            status:status,
            startDate:startDate,
            endDate:endDate
        }).subscribe({
            next: res => {
                this.setData({
                    
                });
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    }
});