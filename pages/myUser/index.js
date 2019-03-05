import { service } from '../../service';
import { constant } from '../../utils/constant';
import { errDialog, loading } from '../../utils/util';
var app = getApp();
Page({
    data: {
        tablist: [{ name: '已邀桔长', status: 'ALL' }, { name: '已邀桔民', status: 'CREATED' }, { name: '买家用户', status: 'PAID' }, { name: '浏览用户', status: 'CONSUME' }],
        curTabIndex: 0,
        constant: constant,
        isShowNodata: false,
        userlist: ['','',''],
        status:'',
        isFinall:false,
        amount: 0
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '我的用户' });
        this.setData({ curTabIndex: options.index,status:options.status });
        this.getData(options.status);
    },
    toPage:function(e){
      var page = e.currentTarget.dataset.page;
      wx.navigateTo({ url: page });
    },
    switchTab: function(e) {
        var thisIndex = e.currentTarget.dataset.index;
        var thisStatus = e.currentTarget.dataset.status;
        this.setData({ curTabIndex: thisIndex, status: thisStatus });
        this.getData(thisStatus);
    },
    getData: function(status){

    }
});