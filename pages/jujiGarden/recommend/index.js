import {service} from '../../../service';
import {constant} from '../../../utils/constant';
import {errDialog,loading} from '../../../utils/util';
var app = getApp();
Page({
    data: {
        recommendlist: [{imgIds:['','','','','','']},{imgIds:['','','','','','']}],
        constant: constant,
        isShowNodata: false,
        curTabIndex:1
    },
    getData: function() {

    },
    switchTab: function(e) {
        this.setData({curTabIndex:e.currentTarget.dataset.index});
        this.getData();
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({
            title: '推广素材',
        });
        this.getData();
    }
})