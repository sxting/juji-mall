import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
import { jugardenService } from '../shared/service.js'

Page({
    data: {
      tablist: [{ name: '已邀桔长', status: 'LEADER' }, { name: '已邀桔民', status: 'MEMBER' }],
      curTabIndex: 0,
      constant: constant,
      isShowTips: true,//显示最上面的tips
      userlistInfor: [],
      role: 'LEADER',
      pageNo: 1,
      pageSize: 1,
      ifBottom: true,//返回空数组的话，已经到底部，返回不请求
    },

    onLoad: function(options) {
      let self = this;
      this.setData({
        role: options.role,
        curTabIndex: options.role == '' || options.role == 'LEADER'? 0 : 1
      })
      wx.setNavigationBarTitle({ title: '我的用户' });
      getPersonListInfor.call(self);//get我的用户信息
    },
    
    // tab切换
    switchTab: function(e) {
      let self = this;
      let thisIndex = e.currentTarget.dataset.index;
      let thisStatus = e.currentTarget.dataset.status;
      this.setData({ 
        curTabIndex: thisIndex, 
        role: thisStatus,
        userlistInfor: []
      });
      getPersonListInfor.call(self);//get我的用户信息
    },

    // 关闭tips
    closeTips(){
      this.setData({
        isShowTips: !this.data.isShowTips
      })
    },

    //上拉加载更多
    scrolltolower: function () {
      console.log(this.data.pageNo)
      if (this.data.ifBottom){
        return;
      }
      this.setData({
        pageNo: this.data.pageNo + 1
      })
      getPersonListInfor.call(this); //获取砍价列表信息
    },

});

//  获取用户信息列表
function getPersonListInfor() {
  let self = this;
  let data = {
    role: self.data.role,
    pageNo: self.data.pageNo,
    pageSize: self.data.pageSize
  }
  jugardenService.personListInfor(data).subscribe({
    next: res => {
      if (res) {
        console.log(res.length);
        self.setData({
          userlistInfor: this.data.userlistInfor.concat(res),
          ifBottom: res.length == 0? true : false
        })
      }
    },
    error: err => errDialog(err),
    complete: () => wx.hideToast()
  })

}