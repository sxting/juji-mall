import { errDialog, loading } from '../../../utils/util'
import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { jugardenService } from '../shared/service.js'
var app = getApp();

Page({
  data: {
      juminNumList: [],//队员人数
      hadNumber: 0,
      storeId: '',
      role: '',//桔园角色
  },
  onLoad: function () {
    let self = this;
    wx.setNavigationBarTitle({ title: '桔园' });
    getGardenInfor.call(self);//get首页信息,获取分销角色
  },

  onShow: function () {
    let self = this;
    getGardenInfor.call(self);//get首页信息,获取分销角色
  },

  // 申请成为桔长
  apply:function(e){

  },

  // 跳转页面
  toPage: function(e) {
      var page = e.currentTarget.dataset.page;
      wx.navigateTo({ url: page });
  },
});

// 首页信息获取 
function getGardenInfor(){
  let self = this;
  jugardenService.getGardenHomeInfor().subscribe({
    next: res => {
      if (res) {
        console.log(res);
        if (res.role == 'MEMBER' || res.role == 'UNDEFINED'){//桔民
          this.data.juminNumList = [];
          this.data.hadNumber = parseInt(res.invitedLeaderCount) + parseInt(res.invitedMemberCount);
          if (this.data.hadNumber > 0) {
            for (let i = 0; i < this.data.hadNumber; i++) {
              let list = 'yes';
              this.data.juminNumList.push(list);
            }
            for (let j = 0; j < (10 - parseInt(this.data.hadNumber)); j++) {
              this.data.juminNumList.push('');
            }
          }else{
            for (let j = 0; j < 10; j++) {
              this.data.juminNumList.push('');
            }
          }
        }
        this.setData({
          role: res.role,
          juminNumList: this.data.juminNumList,
          hadNumber: this.data.hadNumber,
        })
      }
    },
    error: err => errDialog(err),
    complete: () => wx.hideToast()
  })
}