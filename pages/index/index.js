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
    page: 1,
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
    pageSize: 10,
    sortArray: ['', 'ASC', 'ASC', ''],
    providerId: ''
  },
  //swiper滑动事件
  swiperChange: function(e) {
    this.setData({
      nowIdx: e.detail.current
    })
  },
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
      sortIndex: sortIndex
    });
    console.log(this.data.sortIndex);
    let obj = {};
    switch (sortIndex) {
      case '1':
        obj = {
          providerId: '1215422531428605',
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
          providerId: '1215422531428605',
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
          providerId: '1215422531428605',
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
          providerId: '1215422531428605',
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
  toJuzihl: function() {
    wx.navigateTo({
      url: '../juzihl/index'
    });
  },
  toCityList: function() {
    wx.navigateTo({
      url: '../citylist/index'
    });
  },
  //上拉加载
  onReachBottom() {
    let p = ++this.data.page;
    console.log('page:' + p);

    let obj = {
      providerId: '1215422531428605',
      type: 'PRODUCT',
      sortField: 'IDX',
      sortOrder: 'ASC',
      pageNo: p,
      pageSize: this.pageSize,
      longitude: '116.470959',
      latitude: '39.992368'
    };

    service.getRecommendPage(obj).subscribe({
      next: res => {
        console.log(res);
        //缓存之前两页的总数据
        wx.setStorageSync('indexPageData', this.data.recommendPage);
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

    service.getIndexData({
      providerId: this.data.providerId
    }).subscribe({
      next: res => {
        console.log(res);
        this.setData({
          slideShowList: res.slideShowList,
          pointProductList: res.pointProductList
        });

        let obj = {
          providerId: '1215422531428605',
          type: 'PRODUCT',
          sortField: 'IDX',
          sortOrder: 'ASC',
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          longitude: '116.470959',
          latitude: '39.992368'
        };

        service.getRecommendPage(obj).subscribe({
          next: res => {
            console.log(res);
            this.setData({
              recommendPage: res.list
            });
            wx.stopPullDownRefresh();
          },
          error: err => console.log(err),
          complete: () => wx.hideToast()
        });

      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
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
        //获取用户当地服务商信息
        service.getSelectProviderByLoc(obj).subscribe({
          next: res => {
            console.log('----------服务商信息---------');
            console.log(res);
            that.setData({
              providerId: res.id
            });
            that.getIndexData();
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
          error: err => errDialog(err),
          complete: () => wx.hideToast()
        });
      },
      fail: function(err) {
        console.log('---------位置调用失败或是被拒绝--------');
        console.log(err);
      }
    })
  },
  getPreOrder: function() {
    var obj = {
      openid: wx.getStorageSync('openid')
    };
    service.testPreOrder(obj).subscribe({
      next: res => {
        console.log(res);
        wx.requestPayment({
          timeStamp: res.timeStamp,
          nonceStr: res.nonceStr,
          package: res.package,
          signType: res.signType,
          paySign: res.paySign,
          success(res) {
            // alert('支付成功');
          },
          fail(res) {
            // alert('支付失败');
          }
        })
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
  getIndexData: function() {
    service.getIndexData({
      providerId: this.data.providerId
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
  getDataByCity: function() {
    var that = this;
    var obj = {
      provinceCode: this.data.locationCode,
      cityCode: this.data.locationCode,
      areaCode: '',
    };
    service.getSelectHotCity(obj).subscribe({
      next: res => {
        console.log(res);
        that.setData({
          providerId: res.id
        });
        that.getIndexData();
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
  onShow: function() {
    if (this.data.locationName) {
      if (this.data.locationName != wx.getStorageSync('locationName')) {
        //如果城市更换了 需要重新加载页面
        this.setData({
          locationCode: wx.getStorageSync('locationCode'),
          locationName: wx.getStorageSync('locationName')
        });
        this.getDataByCity();
      }
      
    }

  },
  onLoad: function(options) {
    console.log(options);
    wx.setNavigationBarTitle({
      title: ''
    });
    

    wx.getSetting({
      success: (res) => {
        console.log(res.authSetting['scope.userInfo']);
        if (!res.authSetting['scope.userInfo']) {
          wx.reLaunch({
            url: '/pages/login/index'
          });
        }else{//如果已经授权
          //判断rowData是否存在
          if(wx.getStorageSync('rawData')){//如果存在

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
                      this.getCurLocation(); //用户位置

                      //根据位置查询附近精选
                      let obj = {
                        providerId: '1215422531428605',
                        type: 'PRODUCT',
                        sortField: 'IDX',
                        sortOrder: 'ASC',
                        pageNo: this.pageNo,
                        pageSize: this.pageSize,
                        longitude: '116.470959',
                        latitude: '39.992368'
                      };
                      this.getRecommendPage(obj);
                    } else {
                      wx.showToast({
                        title: '登录失败，错误码:' + res1.data.errorCode+' 返回错误: ' + res1.data.errorInfo,
                        icon: 'none',
                        duration: 3000
                      })
                    }
                  }
                });
              }
            });

          }else{//如果不存在rowData

          }
          
        }
      }
    });
    


    // this.getPreOrder();
    console.log('--------------index-onLoad-------------');
    
    

    
  }
})