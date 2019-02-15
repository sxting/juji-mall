import {service} from '../../service';
import { constant } from '../../utils/constant';
import { errDialog, loading} from '../../utils/util';
var app = getApp();
Page({
  data: {
    commentlist: [{},{},{}],
    constant:constant,
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
        this.setData({
          commentlist:res.list
        });
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },
  toCommentDetail:function(){

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