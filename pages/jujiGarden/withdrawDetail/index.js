import { errDialog, loading } from '../../../utils/util'
import { service } from '../../../service';
import { constant } from '../../../utils/constant';
var app = getApp();
Page({
    data: {
        recordlist: [{},{},{}]
    },
    toJuzi: function() {
        wx.switchTab({ url: '../juzi/index' });
    },
    toPage: function(e) {
        var page = e.currentTarget.dataset.page;
        wx.navigateTo({ url: page });
    },
    onLoad: function() {
        wx.setNavigationBarTitle({ title: '提现详情' });
        this.getData();
    },
    getData: function() {

    }
});


