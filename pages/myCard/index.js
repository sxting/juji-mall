import { errDialog, loading } from '../../utils/util';
import { constant } from '../../utils/constant';
import { service } from '../../service';
Page({
  data: {
    cardList:[],
    isNoData:true,
    curCardIndex:-1
  },
  switchTab: function(event){
    var thisIndex=event.currentTarget.dataset.index;
    this.setData({curTabIndex:thisIndex});
  },
  slideThisItem:function(e){
    var thisIndex=e.currentTarget.dataset.index;
    if(thisIndex==this.data.curCardIndex){
      this.setData({curCardIndex:-1});
    }else{
      this.setData({curCardIndex:thisIndex});
    }
  },
  switchChange(e){
    var id=e.currentTarget.dataset.id;
    service.cardShare({
        share:e.detail.value?1:0,
        userCardId:id
    }).subscribe({
      next: res => {},
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    });
  },
  toMerchant:function(e){
    var id=e.currentTarget.dataset.id;
    var type=e.currentTarget.dataset.type;
    wx.navigateTo({url: '/pages/businessDetails/index?id='+id+'&cardType='+type});
  },
  userCardRecord:function(event){
    var id=event.currentTarget.dataset['id'];
    wx.navigateTo({url: '/pages/myCardRecord/index?id='+id});
  },
  getData:function(){
    service.getMyCardPackage().subscribe({
      next: res => {
        this.setData({cardList:res});
        if(this.data.cardList.length>0){
          this.setData({isNoData:false})
        }
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },
  onShow: function(){
    this.getData();
  },
  onLoad: function(options) {
    wx.setNavigationBarTitle({title: '我的卡'});
  }
})