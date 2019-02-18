import {service} from '../../service';
import { constant } from '../../utils/constant';
import { errDialog, loading} from '../../utils/util';
var app = getApp();
Page({
  data: {
    commentlist: [{},{},{}],
    constant:constant,
    isShowNodata: false,
    scorelist:[]
  },
  getComments:function(){
    var obj = {pageNo: 1,pageSize: 50}
    service.myComment(obj).subscribe({
      next: res => {
        for(var i=0;i<res.list.length;i++){
          if(res.list[i].imgIds!=""){
            res.list[i].imgIds = res.list[i].imgIds.split(',');
          }else{
            res.list[i].imgIds = [];
          }
        }
        this.setData({ commentlist: res.list });
        this.setData({ isShowNodata: this.data.commentlist.length == 0 });
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },
  toComDetail:function(e){
    var id = e.currentTarget.dataset['id'];
    wx.navigateTo({url: "/pages/comDetail/index?id=" + id});
  },

  //下拉刷新
  onPullDownRefresh() {

  },

  //上拉加载
  onReachBottom() {

  },

  onLoad: function(options) {
      wx.setNavigationBarTitle({ title: '我的评价', });
      this.getComments();
  }
})