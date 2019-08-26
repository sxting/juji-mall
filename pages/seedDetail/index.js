var util = require('../../utils/util.js');
import { constant } from '../../utils/constant';
import { errDialog, loading } from '../../utils/util';
import { service } from '../../service.js';
// var WxParse = require('../../wxParse/wxParse.js');

Page({
    data: {
        nvabarData: { showCapsule: 1, title: '种草' },
        tweetInfo: null,
        source: "",
        content: {},
        url: '',
        id: '',
        resData: {}
    },
    onLoad: function(options) {
        this.setData({
          id: options.id
        })
        console.log(options);
        this.getData(options.id);
    },
    onShareAppMessage: function (res) {
      return {
        title: this.data.resData.title,
        path: '/pages/login/index?pagetype=8&id='+this.data.id,
        imageUrl: constant.basePicUrl + this.data.resData.cover + '/resize_560_420/mode_filt'
      }
    },
    getData: function(id) {
        service.tweetDetail({ tweetsId: id }).subscribe({
            next: res => {
                this.setData({
                  resData: res
                })
                if (res.source =="RICH_TEXT"){
                    this.setData({
                        // content: WxParse.wxParse('content', 'html', res.html, this),
                      url: 'https://api.juniuo.com/juji/article.php?id=' + id
                    })
                }else{
                    this.setData({
                        url: res.url
                    })
                }
            },
            error: err => {},
            complete: () => wx.hideToast()
        });
    },
    onUnload: function () {
      wx.setStorageSync('isEnterSeedDetail',1);
    },
    toComDetailAndShare: function(e) {
        var id = e.currentTarget.dataset.id;
        var storeid = e.currentTarget.dataset.storeid;
        wx.navigateTo({
            url: '/pages/comDetail/index?share=1&id=' + id + '&storeid=' + storeid
        });
    },
});