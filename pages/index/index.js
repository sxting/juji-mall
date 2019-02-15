var QQMapWX = require('../../lib/qqmap-wx-jssdk.min.js');
import {
  constant
} from '../../utils/constant';
import {
  service
} from '../../service';
var app = getApp();
Page({
  data: {
    locationCode: '',
    locationName: '',
    curTabIndex: 0,
    businessList: [],
    leavePage: false,
    autoplay: false,
    current: 1,
    swiperH: '', //swiper高度
    nowIdx: 1, //当前swiper索引
    banners: ['../../images/homeBanner.png', '../../images/banner1.png', '../../images/freeGet.png'],
    slideShowList: [],
    pointProductList: [],
    recommendPage: [],
    sortIndex: 1,
    pageNo: 1,
    pageSize: 2,
    sortArray: ['', 'ASC', 'ASC', ''],
    providerId: ''
  },
  onLoad: function(options) {
    console.log(options);
    wx.setNavigationBarTitle({
      title: ''
    });
    console.log('--------------index-onLoad-------------');
    wx.getSetting({
      success: (res) => {
        console.log(res.authSetting['scope.userInfo']);
        if (!res.authSetting['scope.userInfo']) {
          wx.reLaunch({
            url: '/pages/login/index'
          });
        } else { //如果已经授权
          //判断rowData是否存在
          if (wx.getStorageSync('rawData')) { //如果存在

            wx.login({
              success: res => {
                console.log('code: ' + res.code);
                console.log(constant.APPID);
                wx.request({
                  url: 'https://c.juniuo.com/shopping/user/login.json',
                  method: 'GET',
                  data: {
                    code: res.code,
                    appId: constant.APPID,
                    isMock: false, //测试标记
                    rawData: wx.getStorageSync('rawData')
                  },
                  header: {
                    'content-type': 'application/json',
                  },
                  success: (res1) => {
                    console.log(res1);
                    if (res1.data.errorCode == '200') {
                      wx.setStorageSync('token', res1.data.data.token);
                      wx.setStorageSync('openid', res1.data.data.openId);
                      wx.setStorageSync('userinfo', JSON.stringify(res1.data.data));
                      this.getCurLocation(); //用户位置+位置名称
                    } else {
                      wx.showToast({
                        title: '登录失败，错误码:' + res1.data.errorCode + ' 返回错误: ' + res1.data.errorInfo,
                        icon: 'none',
                        duration: 3000
                      })
                    }
                  }
                });
              }
            });
          } else { //如果不存在rowData
            wx.showToast({
              title: '已授权但未能获取到rawData',
            });
          }
        }
      }
    });
  },
  onShow: function() {
    var that = this;
    //每次进到该页面重置筛选条件
    this.setData({
      sortIndex: 1,
      pageNo: 1,
      sortArray: ['', 'ASC', 'ASC', '']
    });
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
                that.getIndexData();
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
          this.userLocationInterval = setInterval(function() {
            //判断是否有获取定位的权限
            wx.getSetting({
              success: (res) => {
                console.log('是否具有定位权限：' + res.authSetting['scope.userLocation']);
                if (res.authSetting['scope.userLocation']) { //如果已经授权
                  wx.getLocation({
                    type: 'wgs84',
                    success: function(res) {
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


                      that.getIndexData();
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
  //swiper滑动事件
  swiperChange: function(e) {
    this.setData({
      nowIdx: e.detail.current
    })
  },
  //跳转到商品详情
  toComDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    var storeid = e.currentTarget.dataset.storeid;
    console.log(id);
    wx.navigateTo({
      url: '/pages/comDetail/index?id=' + id + '&storeid=' + storeid
    });
  },
  //获取swiper高度
  getHeight: function(e) {
    var winWid = wx.getSystemInfoSync().windowWidth - 2 * 30; //获取当前屏幕的宽度
    var imgh = e.detail.height; //图片高度
    var imgw = e.detail.width;
    var sH = winWid * imgh / imgw + "px"
    this.setData({
      swiperH: sH //设置高度
    })
  },
  //切换筛选的升序和降序
  toggleLabel: function(event) {
    let sortIndex = event.currentTarget.dataset['label'];
    console.log(sortIndex);
    if (sortIndex != 1 && sortIndex != 4) {
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
          providerId:this.data.providerId,
          // providerId: '1215422531428605',
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
          sortField: 'PRICE',
          sortOrder: this.data.sortArray[Number(sortIndex) - 1],
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
          sortField: 'DISTANCE',
          sortOrder: this.data.sortArray[Number(sortIndex) - 1],
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
  //点击更多 跳转到桔子换礼列表页
  toJuzihl: function() {
    wx.navigateTo({
      url: '../juzihl/index'
    });
  },
  //跳转选择城市
  toCityList: function() {
    wx.navigateTo({
      url: '../citylist/index'
    });
  },
  //上拉加载
  onReachBottom() {
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
  //下拉刷新
  onPullDownRefresh() {
    let that = this;
    this.setData({
      pageNo: 1
    });
    this.getIndexData();
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
  //获取位置的经纬度，然后根据经纬度获取用户所在城市名称和编号
  getCurLocation: function() {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        wx.setStorageSync('curLatitude', res.latitude);
        wx.setStorageSync('curLongitude', res.longitude);
        console.log('--------位置调用成功--------');
        var obj = {
          latitude: res.latitude,
          longitude: res.longitude
        }
        //获取服务商信息
        service.getSelectProviderByLoc(obj).subscribe({
          next: res1 => {
            console.log('----------服务商信息---------');
            console.log(res1);
            if (res1.id) { //如果存在服务商
              that.setData({
                providerId: res1.id
              });
              that.getIndexData();
              //根据位置查询附近精选
              var obj1 = {
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
              that.getRecommendPage(obj1);
            } else { //如果不存在服务商
              wx.showToast({
                title: '当前位置不存在服务商',
                icon: 'none'
              })
            }
          }
        });

        //获取用户当前城市信息
        service.getCurrentLoc({
          latitude: res.latitude,
          longitude: res.longitude
        }).subscribe({
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
                        success: function(res1) {
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
                        fail: function() {
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
                  success: function(res1) {
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
                  fail: function() {
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
      fail: function(err) {
        console.log('---------位置调用失败或是被拒绝--------');
        console.log(err);
        wx.showModal({
          title: '无法获取地理位置',
          content: '无法获取附近的优惠信息，您可以在小程序设置界面（「右上角」 - 「关于」 - 「右上角」 - 「设置」）中设置对该小程序的授权状态，并在授权之后重启小程序。'
        })
      }
    })
  },
  //根据服务商id（providerId）获取首页轮播图地址和桔子换礼的推荐
  getIndexData: function() {
    service.getIndexData({
      // providerId: this.data.providerId
      providerId: this.data.providerId,
    }).subscribe({
      next: res => {
        console.log(res);
        this.setData({
          slideShowList: res.slideShowList,
          pointProductList: res.pointProductList
        });
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
  //获取所有商品，以分页列表形式展示
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
  //已知省市代码，获取该地点的服务商信息，然后更新首页数据
  getDataByCity: function() {
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
        that.getIndexData();
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
  }
})