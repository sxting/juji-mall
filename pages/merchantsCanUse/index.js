import {service} from '../../service';
Page({
  data: {
    merchantsList: []
  },
  onLoad: function(options) {
    wx.setNavigationBarTitle({title: '适用门店'});
    wx.hideShareMenu();
    this.applyStoreList(options.id);
  },
  applyStoreList: function(id) {
    service.applyStoreList({
      productId: id
    }).subscribe({
      next: res => {
        console.log('------适用门店列表------');
        console.log(res);
        this.setData({
          merchantsList:res
        })
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  toMap: function(e){
    console.log(e);
    if (e.currentTarget.dataset.lat && e.currentTarget.dataset.lng){
      wx.navigateTo({
        url: '/pages/map/index?lat=' + e.currentTarget.dataset.lat + '&lng=' + e.currentTarget.dataset.lng,
      });
    }
  },
  callPhone:function(e){
    console.log(e.currentTarget.dataset.phone);
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone,
    })
  }
})