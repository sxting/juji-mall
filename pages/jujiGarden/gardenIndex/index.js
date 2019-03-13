import { errDialog, loading } from '../../../utils/util'
import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { jugardenService } from '../shared/service.js'
var app = getApp();

Page({
    data: {
        status:'2',
        juminNumList: [],//队员人数
        hadNumber: 2,
        storeId: ''
    },
    apply:function(e){
        this.setData({status:'2'});
    },
    toPage: function(e) {
        var page = e.currentTarget.dataset.page;
        wx.navigateTo({ url: page });
    },
    onLoad: function() {
      let self = this;
      wx.setNavigationBarTitle({ title: '桔园' });
      this.data.juminNumList = [];
      if (this.data.hadNumber > 0) {
        for (let i = 0; i < this.data.hadNumber; i++) {
          let list = 'yes';
          this.data.juminNumList.push(list);
        }
        for (let j = 0; j < (10 -  parseInt(this.data.hadNumber)); j++){
          this.data.juminNumList.push('');
        }
      }
      this.setData({
        juminNumList: this.data.juminNumList,
      })
    },
    onShow: function() {
      getGardenInfor.call(self);//get首页信息
    },
});

// 首页信息获取 
function getGardenInfor(){
  jugardenService.getGardenHomeInfor().subscribe({
    next: res => {
      this.setData({

      });
    },
    error: err => errDialog(err),
    complete: () => wx.hideToast()
  })
}