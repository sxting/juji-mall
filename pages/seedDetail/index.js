var util = require('../../utils/util.js');
import { constant } from '../../utils/constant';
import { errDialog, loading } from '../../utils/util';
import { service } from '../../service.js';
var WxParse = require('../../wxParse/wxParse.js');

Page({
    data: {
        nvabarData: { showCapsule: 1, title: '种草'},
        tweetInfo: null,
        content:{}
    },
    onLoad: function(options) {
        this.getData(options.id); //获取活动列表
    },
    getData: function(id) {
        service.tweetDetail({tweetsId:id}).subscribe({
            next: res => {
                this.setData({
                  tweetInfo:res,
                  content:WxParse.wxParse('content', 'html', res.html, this)
                })
            },
            error: err => {},
            complete: () => wx.hideToast()
        });
    },
    toComDetailAndShare: function(e) {
        var id = e.currentTarget.dataset.id;
        var storeid = e.currentTarget.dataset.storeid;
        wx.navigateTo({
            url: '/pages/comDetail/index?share=1&id=' + id + '&storeid=' + storeid
        });
    },
});