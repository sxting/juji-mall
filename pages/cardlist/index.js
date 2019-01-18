import { errDialog, loading } from '../../utils/util';
import { constant } from '../../utils/constant';
import { service } from '../../service';
Page({
  data: {
  	tablist:['全部','美食休闲','丽人/美发'],
  	curTabIndex:0,
    isShowNodata:false,
    curMerchantType:0,
    curCardIndex:-1,
    isShow:false,
    cardListAll:[],
    cardList:[]
  },
  toBalanceSrc: function(event){
    var index = event.currentTarget.dataset['index'];
    var balanceSrcArr = JSON.stringify(this.data.cardList[index].list);
    var cardType = this.data.cardList[index].cardType;
    wx.setStorageSync('balanceSrcArr',balanceSrcArr);
    wx.navigateTo({url: '/pages/balanceSrc/index?type='+cardType});
  },
  useCard:function(e){
    var id=e.currentTarget.dataset.id;
    var cardid=e.currentTarget.dataset.cardid;
    if(e.currentTarget.dataset.type==1){
      wx.navigateTo({url: '/pages/createOrder/index?id='+id+'&cardid='+cardid});
    }else{
      wx.navigateTo({url: '/pages/setupOrder/index?id='+id+'&cardid='+cardid});
    }
  },
  toMerchant:function(e){
    var id=e.currentTarget.dataset.id;
    var type=e.currentTarget.dataset.type;
    wx.navigateTo({url: '/pages/businessDetails/index?id='+id+'&cardType='+type});
  },
  getCardList: function(){
    service.listCardPackage().subscribe({
      next: res => {
        this.setData({cardListAll:res});
        this.setData({cardList:res});
        this.setData({isShowNodata:this.data.cardList.length==0});
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },
  slideThisItem:function(e){
    var thisIndex=e.currentTarget.dataset['index'];
    if(thisIndex==this.data.curCardIndex){
      this.setData({curCardIndex:-1});
    }else{
      this.setData({curCardIndex:thisIndex});
    }
  },
  switchTab: function(event){
    var thisIndex=event.currentTarget.dataset['index'];
    var thisType=event.currentTarget.dataset['type'];
    this.setData({curTabIndex:thisIndex});
    if(thisType==0){
      this.setData({cardList:this.data.cardListAll});
    }else{
      this.setData({cardList:this.getCardListByType(thisType)});
    }
    this.setData({isShowNodata:this.data.cardList.length==0});
  },
  getCardListByType: function(type){
    var cardArr = this.data.cardListAll;
    var newCardList = [];
    for(var i=0;i<cardArr.length;i++){
      if(cardArr[i].merchantType==type){
        newCardList.push(cardArr[i]);
      }
    }
    return newCardList;
  },
  toMyCard: function(){
    wx.navigateTo({url: '/pages/myCard/index'})
  },
  onShow: function(){
    this.getCardList();
  },
  onLoad: function(options) {
    wx.setNavigationBarTitle({title: '卡包'});
  }
});