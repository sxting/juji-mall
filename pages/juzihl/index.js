import {
  service
} from '../../service';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    locationCode: '',
    locationName: '',
    recommendPage: [],
    sortIndex: 1,
    pageNo: 1,
    pageSize: 2,
    sortArray: ['', '', '', 'ASC', 'ASC', ''],
    providerId:''
  },
  getDataByCity: function () {
    var that = this;
    var obj = {
      provinceCode: this.data.locationCode,
      cityCode: this.data.locationCode,
      areaCode: '',
    };
    //选择省市县确认服务商信息
    service.getSelectHotCity(obj).subscribe({
      next: res => {
        console.log('--------选择省市县确认服务商信息---------');
        console.log(res);
        that.setData({
          providerId: res.id,
          pageNo: 1
        });
        console.log('--------选择省市县确认服务商信息后重新加载首页数据---------');
        var obj = {
          providerId: res.id,
          type: 'PRODUCT',
          sortField: 'IDX',
          sortOrder: 'ASC',
          pageNo: that.data.pageNo,
          pageSize: that.data.pageSize,
          longitude: wx.getStorageSync('curLongitude'),
          latitude: wx.getStorageSync('curLatitude')
        };
        that.getRecommendPage(obj);
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
  getCurLocation: function () {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        wx.setStorageSync('curLatitude', res.latitude);
        wx.setStorageSync('curLongitude', res.longitude);
        console.log('--------位置调用成功--------');
        var obj = {
          latitude: res.latitude,
          longitude: res.longitude
        }
        //获取用户当地服务商信息
        service.getSelectProviderByLoc(obj).subscribe({
          next: res1 => {
            console.log('----------服务商信息---------');
            console.log(res1);
            if (res1.id) { //如果存在服务商
              that.setData({
                providerId: res1.id
              });
              //根据位置查询附近精选
              var obj = {
                providerId: res1.id,
                type: 'PRODUCT',
                sortField: 'IDX',
                sortOrder: 'ASC',
                pageNo: that.data.pageNo,
                pageSize: that.data.pageSize,
                longitude: res.longitude,
                latitude: res.latitude
              };
              that.getRecommendPage(obj);
            } else { //如果不存在服务商
              wx.showToast({
                title: '当前位置不存在服务商',
                icon: 'none'
              })
            }

          }
        });
        //获取用户当前城市信息
        service.getCurrentLoc(obj).subscribe({
          next: res => {
            console.log(res);
            if (res.locationType != 'CITY') {
              if (res.parentLocation.locationType == 'CITY') {
                var oldcitycode = wx.getStorageSync('locationCode');
                console.log(oldcitycode);
                console.log(res.parentLocation.locationCode);
                if (!oldcitycode) {
                  //如果是第一次获取位置，不询问
                  wx.setStorageSync('locationName', res.parentLocation.locationName.replace('市', ''));
                  wx.setStorageSync('locationCode', res.parentLocation.locationCode);
                  that.setData({
                    locationName: res.parentLocation.locationName.replace('市', ''),
                    locationCode: res.parentLocation.locationCode
                  });
                } else {

                  if (app.globalData.locationName) { //存在用户自己选了其他城市不询问
                    that.setData({
                      locationName: wx.getStorageSync('locationName'),
                      locationCode: wx.getStorageSync('locationCode')
                    });
                  } else { //不存在 用户没选
                    if (oldcitycode != res.parentLocation.locationCode) {
                      //询问是否切换到当前城市
                      wx.showModal({
                        title: '提示',
                        content: '是否切换到' + res.parentLocation.locationName + '?',
                        success: function (res1) {
                          if (res1.confirm) {
                            wx.setStorageSync('locationName', res.parentLocation.locationName.replace('市', ''));
                            wx.setStorageSync('locationCode', res.parentLocation.locationCode);
                            that.setData({
                              locationName: res.parentLocation.locationName.replace('市', ''),
                              locationCode: res.parentLocation.locationCode
                            });
                          } else if (res1.cancel) {
                            that.setData({
                              locationName: wx.getStorageSync('locationName'),
                              locationCode: wx.getStorageSync('locationCode')
                            });
                          }

                        },
                        fail: function () {
                          that.setData({
                            locationName: wx.getStorageSync('locationName'),
                            locationCode: wx.getStorageSync('locationCode')
                          });
                        }
                      });

                    } else {
                      that.setData({
                        locationName: wx.getStorageSync('locationName'),
                        locationCode: wx.getStorageSync('locationCode')
                      });
                    }
                  }


                }


              }
            } else {
              var oldcitycode = wx.getStorageSync('locationCode');
              if (oldcitycode != res.locationCode) {
                //询问是否切换到当前城市
                wx.showModal({
                  title: '提示',
                  content: '是否切换到' + res.parentLocation.locationName + '?',
                  success: function (res1) {
                    if (res1.confirm) {
                      wx.setStorageSync('locationName', res.locationName.replace('市', ''));
                      wx.setStorageSync('locationCode', res.locationCode);
                      that.setData({
                        locationName: res.locationName.replace('市', ''),
                        locationCode: res.locationCode
                      });
                    } else if (res1.cancel) {
                      that.setData({
                        locationName: wx.getStorageSync('locationName'),
                        locationCode: wx.getStorageSync('locationCode')
                      });
                    }

                  },
                  fail: function () {
                    that.setData({
                      locationName: wx.getStorageSync('locationName'),
                      locationCode: wx.getStorageSync('locationCode')
                    });
                  }
                });

              }
            }

          },
          error: err => console.log(err),
          complete: () => wx.hideToast()
        });
      },
      fail: function (err) {
        console.log('---------位置调用失败或是被拒绝--------');
        console.log(err);
        wx.showModal({
          title: '无法获取地理位置',
          content: '无法获取附近的优惠信息，您可以在小程序设置界面（「右上角」 - 「关于」 - 「右上角」 - 「设置」）中设置对该小程序的授权状态，并在授权之后重启小程序。'
        })
      }
    })
  },
  toggleLabel: function(event) {
    let sortIndex = event.currentTarget.dataset['label'];
    console.log(sortIndex);
    if (sortIndex != 1 && sortIndex != 2 && sortIndex != 3 && sortIndex != 6) {
      if (this.data.sortIndex == sortIndex) { //两次相同 切换排序规则
        let arr = this.data.sortArray;
        console.log(arr);
        if (arr[Number(sortIndex) - 1] == 'ASC') {
          arr[Number(sortIndex) - 1] = 'DESC';
        } else {
          arr[Number(sortIndex) - 1] = 'ASC';
        }
        console.log(arr);
        this.setData({
          sortArray: arr
        });
      }
    }
    this.setData({
      sortIndex: sortIndex,
      pageNo: 1
    });
    console.log(this.data.sortIndex);
    let obj = {};
    switch (sortIndex) {
      case '1':
        obj = {
          // providerId: '1215422531428605',
          providerId: this.data.providerId,
          type: 'PRODUCT',
          sortField: 'IDX',
          sortOrder: 'ASC',
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize,
          longitude: '116.470959',
          latitude: '39.992368'
        };
        break;
      case '2':
        obj = {
          providerId: this.data.providerId,
          type: 'PRODUCT',
          sortField: 'IDX',
          sortOrder: 'ASC',
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize,
          longitude: '116.470959',
          latitude: '39.992368'
        };
        break;
      case '3':
        obj = {
          providerId: this.data.providerId,
          type: 'PRODUCT',
          sortField: 'IDX',
          sortOrder: 'ASC',
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize,
          longitude: '116.470959',
          latitude: '39.992368'
        };
        break;
      case '4':
        obj = {
          providerId: this.data.providerId,
          type: 'PRODUCT',
          sortField: 'PRICE',
          sortOrder: this.data.sortArray[Number(sortIndex) - 1],
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize,
          longitude: '116.470959',
          latitude: '39.992368'
        };
        break;
      case '5':
        obj = {
          providerId: this.data.providerId,
          type: 'PRODUCT',
          sortField: 'DISTANCE',
          sortOrder: this.data.sortArray[Number(sortIndex) - 1],
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize,
          longitude: '116.470959',
          latitude: '39.992368'
        };
        break;
      case '6':
        obj = {
          providerId: this.data.providerId,
          type: 'PRODUCT',
          sortField: 'SOLDNUM',
          sortOrder: 'ASC',
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize,
          longitude: '116.470959',
          latitude: '39.992368'
        };
        break;
    }
    console.log(obj);
    this.getRecommendPage(obj);
  },
  toCityList:function(){
    wx.navigateTo({
      url: '../citylist/index'
    });
  },
  getRecommendPage: function(obj) {
    console.log(obj);
    service.getRecommendPage(obj).subscribe({
      next: res => {
        console.log(res);
        this.setData({
          recommendPage: res.list
        });
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: ''
    });
    this.getCurLocation(); //用户位置+位置名称
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */

  onShow: function () {
    var that = this;
    if (this.data.locationName) { //已经定位了且位置名称存在
      if (this.data.locationName != wx.getStorageSync('locationName')) {
        //如果城市更换了 需要通过用户选择的城市编号code重新加载页面
        console.log('用户更换城市为：' + wx.getStorageSync('locationName'));
        this.setData({
          locationCode: wx.getStorageSync('locationCode'),
          locationName: wx.getStorageSync('locationName')
        });
        this.getDataByCity(); //首页数据已经更新
        //如果用getDataByCity更新了数据 就不能用getSelectProviderByLoc再获取 否则数据会覆盖
      } else { //如果没有更换城市
        var curLatitude = wx.getStorageSync('curLatitude'),
          curLongitude = wx.getStorageSync('curLongitude');
        console.log();
        if (curLatitude && curLongitude) { //已经定位了并且有经纬度的情况
          var obj = {
            latitude: curLatitude,
            longitude: curLongitude
          }
          //获取用户当地服务商信息
          service.getSelectProviderByLoc(obj).subscribe({
            next: res1 => {
              console.log('----------服务商信息---------');
              console.log(res1);
              if (res1.id) { //如果存在服务商
                that.setData({
                  providerId: res1.id,
                  pageNo: 1
                });
                //根据位置查询附近精选
                var obj = {
                  // providerId: res1.id,
                  providerId: that.data.providerId,
                  type: 'PRODUCT',
                  sortField: 'IDX',
                  sortOrder: 'ASC',
                  pageNo: that.data.pageNo,
                  pageSize: that.data.pageSize,
                  longitude: wx.getStorageSync('curLongitude'),
                  latitude: wx.getStorageSync('curLatitude')
                };
                that.getRecommendPage(obj);
              } else { //如果不存在服务商
                wx.showToast({
                  title: '当前位置不存在服务商',
                  icon: 'none'
                })
              }
            }
          });
        } else { //如果一开始没有获取到经纬度
          console.log('一开始没有获取到经纬度');
          clearInterval(that.userLocationInterval);
          this.userLocationInterval = setInterval(function () {
            //判断是否有获取定位的权限
            wx.getSetting({
              success: (res) => {
                console.log('是否具有定位权限：' + res.authSetting['scope.userLocation']);
                if (res.authSetting['scope.userLocation']) { //如果已经授权
                  wx.getLocation({
                    type: 'wgs84',
                    success: function (res) {
                      wx.setStorageSync('curLatitude', res.latitude);
                      wx.setStorageSync('curLongitude', res.longitude);
                      console.log('--------位置调用成功--------');

                      //获取用户当前城市信息
                      service.getCurrentLoc({
                        latitude: res.latitude,
                        longitude: res.longitude
                      }).subscribe({
                        next: res => {
                          console.log('---------获取用户当前城市信息-------');
                          console.log(res);
                          wx.setStorageSync('locationName', res.parentLocation.locationName.replace('市', ''));
                          wx.setStorageSync('locationCode', res.parentLocation.locationCode);
                          that.setData({
                            locationName: res.parentLocation.locationName.replace('市', ''),
                            locationCode: res.parentLocation.locationCode
                          });
                        }
                      });
                      //根据位置查询附近精选
                      var obj = {
                        // providerId: res1.id,
                        providerId: that.data.providerId,
                        type: 'PRODUCT',
                        sortField: 'IDX',
                        sortOrder: 'ASC',
                        pageNo: that.data.pageNo,
                        pageSize: that.data.pageSize,
                        longitude: wx.getStorageSync('curLongitude'),
                        latitude: wx.getStorageSync('curLatitude')
                      };
                      that.getRecommendPage(obj);
                    }
                  });
                  clearInterval(that.userLocationInterval);
                }
              }
            });
          }, 1000);
        }
      }
      //如果相同的位置名称 首页数据不用更新
    } else { //不存在 还没有进行定位 => 没有根据定位获取城市信息
      //
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    let that = this;
    this.setData({
      pageNo: 1
    });
    //根据位置查询附近精选
    var obj = {
      // providerId: res1.id,
      providerId: that.data.providerId,
      type: 'PRODUCT',
      sortField: 'IDX',
      sortOrder: 'ASC',
      pageNo: that.data.pageNo,
      pageSize: that.data.pageSize,
      longitude: wx.getStorageSync('curLongitude'),
      latitude: wx.getStorageSync('curLatitude')
    };
    this.getRecommendPage(obj);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let p = ++this.data.pageNo;
    console.log('page:' + p);

    let obj = {
      providerId: this.data.providerId,
      type: 'PRODUCT',
      sortField: 'IDX',
      sortOrder: 'ASC',
      pageNo: p,
      pageSize: this.data.pageSize,
      longitude: '116.470959',
      latitude: '39.992368'
    };

    service.getRecommendPage(obj).subscribe({
      next: res => {
        console.log(res);
        this.setData({
          recommendPage: this.data.recommendPage.concat(res.list)
        });
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})