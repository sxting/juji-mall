import { errDialog, loading } from '../../utils/util'
import { service } from '../../service';
import { constant } from '../../utils/constant';
var app = getApp();
Page({
    data: {
        nickName: '微信名字',
        avatar: '',
        phoneNum: ''

    },
    toJuzi: function() {
        wx.switchTab({ url: '../juzi/index' });
    },
    toPage: function(e) {
        var page = e.currentTarget.dataset.page;
        wx.navigateTo({ url: page });
    },
    onLoad: function() {
        wx.setNavigationBarTitle({ title: '我的' });

        wx.downloadFile({
          url: res.data,
          success: (res) => {
            console.log("22222")
            console.log(res.tempFilePath);
            this.setData({erwmImg:res.tempFilePath});
            if (res.statusCode === 200) {

            }
          },
          fail:(res)=>{
            console.log("33333")
          }
        });
        
    },
    onShow: function() {
        this.getInfo();
    },

});


