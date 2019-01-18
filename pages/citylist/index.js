import { errDialog, loading } from '../../utils/util'
import { constant } from '../../utils/constant';
import { service } from '../../service';
Page({
  data: {
    curCity:"",
    citylist:[],
    imageWidth:'200px',
  },
  getCitylist:function(){
    service.listCities().subscribe({
      next: res => {
        this.setData({citylist:res});
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },
  selectCity:function(e){
    var cityName=e.currentTarget.dataset['name'];
    var cityId=e.currentTarget.dataset['id'];
    wx.setStorageSync('curCity', cityName);
    wx.setStorageSync('cityId', cityId);
    wx.navigateBack({ delta: 1 });
  },
  onLoad: function(options) {
    wx.setNavigationBarTitle({title: '选择地区'});
    var imageWidth = (wx.getSystemInfoSync().windowWidth-66)/3;
    this.setData({imageWidth: imageWidth+'px'});
    this.getCitylist();
    var curCity = wx.getStorageSync('curCity')||'北京';
    this.setData({'curCity':curCity});
  }
})