import { errDialog, loading } from '../../utils/util'
import { constant } from '../../utils/constant';
import { service } from '../../service';
Page({
  data: {
  	recordList:[],
    isNoData:false,
    cardId:''
  },
  gerRecord:function(){
  	service.cardShareLog({
      userCardId:this.data.cardId
  	}).subscribe({
      next: res => {
        this.setData({recordList:res})
        if(res.length==0){
          this.setData({isNoData:true});
        }
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    });
  },
  onLoad: function(options) {
    this.setData({cardId:options.id});
    wx.setNavigationBarTitle({title: '用卡记录'});
    this.gerRecord();
  }
})