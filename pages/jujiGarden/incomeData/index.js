import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
var app = getApp();
Page({
    data: {
        tablist: [{ name: '本日', status: '1' }, { name: '本周', status: '2' }, { name: '本月', status: '2' }, { name: '累计', status: '2' }],
        curTabIndex: 0,
        constant: constant,
        isShowNodata: false,
        recordlist: ['','',''],
        status:'',
        isFinall:false,
        amount: 0
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '我的收入' });
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