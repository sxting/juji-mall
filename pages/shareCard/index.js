import {service} from '../../service';
Page({
  data: {
    cardList: []
  },
  bindToActivity: function() {
    wx.navigateTo({
      url: '../business/index'
    });
  },
  toUserCircle: function (event) {
    wx.navigateTo({
      url: '/pages/myCircle/index?id=' + event.currentTarget.dataset.userid
    });
  },
  onLoad: function (option) {
    wx.setNavigationBarTitle({
      title: '共享的卡',
    });
    /*共享该商户的卡列表*/
    service.listShareCards({
      merchantId: option.merchantId
    }).subscribe({
      next: res => {
        console.log('--共享该商户的卡列表--');
        console.log(res);
        this.setData({
          cardList: res
        })
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  }
})