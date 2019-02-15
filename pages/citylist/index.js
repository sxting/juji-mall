import {
  errDialog,
  loading
} from '../../utils/util'
import {
  constant
} from '../../utils/constant';
import {
  service
} from '../../service';
var app = getApp();
Page({
  data: {
    curCity: "",
    citylist: [],
    imageWidth: '200px',
    locationName:'',
    locationCode:''

  },
  getCitylist: function() {
    service.getHotData().subscribe({
      next: res => {
        console.log(res);
        this.setData({
          citylist: res
        });
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },
  selectCity: function(e) {
    var locationName = e.currentTarget.dataset['name'].replace('市', '');
    var locationCode = e.currentTarget.dataset['code'];
    wx.setStorageSync('locationName', locationName);
    wx.setStorageSync('locationCode', locationCode);
    app.globalData.locationName = locationName;
    wx.navigateBack({
      delta: 1
    });
  },
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '选择城市'
    });
    var imageWidth = (wx.getSystemInfoSync().windowWidth - 66) / 3;
    this.setData({
      imageWidth: imageWidth + 'px'
    });
    this.getCitylist();
    var obj = {
      latitude: wx.getStorageSync('curLatitude'),
      longitude: wx.getStorageSync('curLongitude')
    }
    service.getCurrentLoc(obj).subscribe({
      next: res => {
        console.log(res);
        if (res.locationType != 'CITY') {
          if (res.parentLocation.locationType == 'CITY') {
            this.setData({
              locationName: res.parentLocation.locationName.replace('市', ''),
              locationCode: res.parentLocation.locationCode
            });
          }
        }else{
          this.setData({
            locationName: res.locationName.replace('市', ''),
            locationCode: res.locationCode
          });
        }

      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
    // this.setData({'curCity':curCity});
  }
})