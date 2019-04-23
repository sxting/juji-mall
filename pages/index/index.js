var QQMapWX = require('../../lib/qqmap-wx-jssdk.min.js');
import {constant} from '../../utils/constant';
import {service} from '../../service';
var app = getApp();
Page({
  data: {
    locationPcode: '',
    locationCode: '',
    locationName: '',
    businessList: [],
    leavePage: false,
    autoplay: true,
    dotsColor: 'rgba(51,51,51,0.3)',
    dotsActiveColor: '#FFDC00',
    swiperH: '', //swiper高度
    nowIdx: 0, //当前swiper索引
    slideShowList: [{}],
    pointProductList: [],
    recommendPage: [],
    sortIndex: 1,
    pageNo: 1,
    pageSize: 5,
    sortArray: ['ASC', 'ASC', 'ASC', 'DESC'],
    providerId: '',
    isShowNewerGet: false,

    productInfo:{},//当前商品的信息
    isShowModal:true,
    windowWidth: 345,
    windowHeight: 430,
    shareBg: '../../images/shareBg.png',
    headImg: '',
    erwmImg: '',
    userImg:'',

    pointBalance: 0,
    imageWidth: '200rpx',
    sortField: 'IDX',
    isShowModal:true,
    pullUpFlag: true,
    showPageLoading: true, //首页加载过程中标记 当最后一层的pageComment返回之后设置为false
    citylist: [],
    isFirstShow: true,
    isLoadedBalance: true
  },
  onLoad: function(options) {
    console.log(options);
    wx.setNavigationBarTitle({title: '桔 集'});
    wx.showShareMenu({
      withShareTicket: true
    });
    console.log('--------------index-onLoad-------------');

    let that = this;

    //成功登陆之后 查询新用户见面礼
    service.isNewer().subscribe({
      next: res2 => {
        console.log(res2)
        if (res2) {
          that.setData({
            isShowNewerGet: true
          });
          service.newerGet().subscribe({
            next: res3 => {
              console.log(res3);
              that.currentPoint();
            }
          });
        }

      },
      error: err => console.log(err)
    });

    //桔子球 查询用户当前桔子数
    that.currentPoint();

    //获取热门城市
    var imageWidth = (wx.getSystemInfoSync().windowWidth - 66) / 3;
    that.setData({
      imageWidth: imageWidth + 'px'
    });
    service.getOpenedData().subscribe({
      next: res => {
        console.log('--------------新版开通的热门城市--------------');
        console.log(res);
        // let arr = [];
        // res.forEach(function(item,index){
        //   if (item.subList[0].locationCode != wx.getStorageSync('locationCode')){
        //     arr.push(item);
        //   }
        // });
        that.setData({
          citylist: res
        });
      },
      error: err => errDialog(err),
      complete: () => wx.hideToast()
    })

    console.log('---------用户位置--------');
    new Promise(function(resolve3, reject3) {
      wx.getLocation({
        type: 'wgs84',
        success: function(res) { //res是经纬度
          console.log(res);
          wx.setStorageSync('curLatitude', res.latitude);
          wx.setStorageSync('curLongitude', res.longitude);
          console.log('--------位置调用成功--------');
          resolve3(res);
        },
        fail: function(err) {
          console.log('---------位置调用失败或是被拒绝--------');
          console.log(err);
          reject3('您没有授权获取您的地理位置，无法获取附近的优惠信息，您可以在小程序设置界面（「右上角」 - 「关于」 - 「右上角」 - 「设置」）中设置对该小程序的授权状态，并在授权之后重启小程序。');
        }
      })
    }).then(function(res) {
      return new Promise(function(resolve4, reject4) {
        //获取用户当前城市信息
        service.getCurrentLoc({
          latitude: res.latitude,
          longitude: res.longitude
        }).subscribe({
          next: res1 => { //res1是定位位置的省市区县
            console.log(res1);

            wx.setStorageSync('locationName', res1.parentLocation.locationName.replace('市', ''));
            wx.setStorageSync('locationCode', res1.parentLocation.locationCode);
            wx.setStorageSync('locationPcode', res1.parentLocation.parentLocation.locationCode);

            if (res1.locationType != 'CITY') { //查出是区县 DISTRICT
              if (res1.parentLocation.locationType == 'CITY') { //查出是城市
                var oldcitycode = wx.getStorageSync('locationCode');
                console.log(oldcitycode);
                console.log(res1.parentLocation.locationCode);
                if (!oldcitycode) { //如果不存在定位的城市 是第一次获取位置，不询问 根据定位查询代理商信息

                  that.setData({
                    locationName: res1.parentLocation.locationName.replace('市', ''),
                    locationPcode: res1.parentLocation.parentLocation.locationCode,
                    locationCode: res1.parentLocation.locationCode
                  });
                  //根据定位查询代理商信息
                  resolve4(1); //1是定位获取代理商 2是区号获取代理商
                } else { //存在定位的城市

                  var oldselectCode = wx.getStorageSync('selectCode');

                  if (oldselectCode) { //判断selectCityCode存在
                    if (oldselectCode == wx.getStorageSync('locationCode')) { //如果相同 选择与定位的一样
                      that.setData({
                        locationName: res1.parentLocation.locationName.replace('市', ''),
                        locationPcode: res1.parentLocation.parentLocation.locationCode,
                        locationCode: res1.parentLocation.locationCode
                      });
                      resolve4(1);
                    } else { //如果不等 选择了其他城市

                      that.setData({
                        locationName: wx.getStorageSync('selectCityName'),
                        locationPcode: wx.getStorageSync('selectPcode'),
                        locationCode: wx.getStorageSync('selectCode')
                      });

                      console.log('不切换定位名称 继续使用用户选择的外地城市');
                      var obj = {
                        provinceCode: that.data.locationPcode,
                        cityCode: that.data.locationCode,
                        areaCode: '',
                      };
                      //选择省市县确认服务商信息
                      service.getSelectHotCity(obj).subscribe({
                        next: res => {
                          console.log('--------选择省市县确认服务商信息---------');
                          console.log(res);
                          wx.setStorageSync('providerId', res.id ? res.id : '');
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
                        error: err => console.log(err)
                      });

                      //showModal询问是否更换城市到当前定位城市

                      wx.showModal({
                        title: '提示',
                        content: '是否切换到' + res1.parentLocation.locationName + '?',
                        success: function(res2) { //res3是确认框返回的结果 是确认 还是取消


                          if (res2.confirm) {
                            wx.setStorageSync('selectCityName', res1.parentLocation.locationName.replace('市', ''));
                            wx.setStorageSync('selectCode', res1.parentLocation.locationCode);
                            wx.setStorageSync('selectPcode', res1.parentLocation.parentLocation.locationCode);
                            //如果是 切换到当前定位城市 通过selectPcode selectCode等查询代理商数据
                            that.setData({
                              showPageLoading: true,
                              locationName: res1.parentLocation.locationName.replace('市', ''),
                              locationPcode: res1.parentLocation.parentLocation.locationCode,
                              locationCode: res1.parentLocation.locationCode
                            });
                            resolve4(1);
                          }
                          // else if (res2.cancel) {
                          //   //如果否 不切换定位名称 继续使用用户选择的外地城市
                          //   that.setData({
                          //     locationName: wx.getStorageSync('selectCityName'),
                          //     locationPcode: wx.getStorageSync('selectPcode'),
                          //     locationCode: wx.getStorageSync('selectCode')
                          //   });
                          //   resolve4(2);
                          // }
                        }
                      });

                    }

                  } else { //如果不存在 用户没有选择异地城市 直接根据定位查询代理商信息
                    that.setData({
                      locationName: res1.parentLocation.locationName.replace('市', ''),
                      locationPcode: res1.parentLocation.parentLocation.locationCode,
                      locationCode: res1.parentLocation.locationCode
                    });
                    resolve4(1);
                  }

                }

              } else { //不是城市
                //暂时不处理
              }
            } else { //查出是城市
              //暂时不处理
            }
          },
          error: err => reject4(err)
        });
      });
    }).then(function(result) {
      console.log('-----查询代理商信息-----');
      console.log(result);
      return new Promise(function (resolve5, reject5){
        if (result == 1) {
          console.log('根据定位查询代理商信息');

          var obj = {
            latitude: wx.getStorageSync('curLatitude'),
            longitude: wx.getStorageSync('curLongitude')
          }
          //获取服务商信息 并加载首页数据
          service.getSelectProviderByLoc(obj).subscribe({
            next: res => {
              console.log('----------服务商信息---------');
              console.log(res);
              if (res.id) { //如果存在服务商
                wx.setStorageSync('providerId', res.id ? res.id : '');
                that.setData({
                  providerId: res.id
                });
                that.getIndexData();
                //根据位置查询附近精选
                var obj1 = {
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
              } else { //如果不存在服务商 显示当前地区暂未开通
                // wx.showModal({
                //   title: '错误',
                //   content: '当前位置不存在服务商'
                // });
                that.setData({
                  showPageLoading: false
                });
              }
            }
          });
        } else if (result == 2) {
          console.log('不切换定位名称 继续使用用户选择的外地城市');
          var obj = {
            provinceCode: that.data.locationPcode,
            cityCode: that.data.locationCode,
            areaCode: '',
          };
          //选择省市县确认服务商信息
          service.getSelectHotCity(obj).subscribe({
            next: res => {
              console.log('--------选择省市县确认服务商信息---------');
              console.log(res);
              wx.setStorageSync('providerId', res.id ? res.id : '');
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
            error: err => console.log(err)
          });
        }
      })
      

    }).catch(function(err) {
      console.log(err);
      that.setData({
        showPageLoading: false
      });
      wx.showModal({
        title: '错误',
        content: err
      });
    });
  },
  onShow: function() {
    var that = this;
    setTimeout(() => {
      that.setData({
        showPageLoading: false
      });
    }, 5000);
    if (wx.getStorageSync('selectCode')) { //存在 说明用户选过异地城市
      if (wx.getStorageSync('locationCode') != wx.getStorageSync('selectCode')) {
        //如果城市更换了 需要通过用户选择的城市编号code重新加载页面
        console.log('用户使用自选城市：' + wx.getStorageSync('selectCityName'));
        console.log('selectCode: ' + wx.getStorageSync('selectCode'));
        console.log('selectPcode: ' + wx.getStorageSync('selectPcode'));
        console.log('selectCityName: ' + wx.getStorageSync('selectCityName'));
        //此处应该判断用户有没有再次更换城市 如果没有更换城市不再次查询
        if (this.data.locationCode == wx.getStorageSync('selectCode')) {
          this.currentPoint();
          return;
        } else {
          this.setData({
            showPageLoading: true,
            sortIndex: 1,
            pageNo: 1,
            pullUpFlag: true,
            sortArray: ['ASC', 'ASC', 'ASC', 'DESC'],
            locationCode: wx.getStorageSync('selectCode'),
            locationPcode: wx.getStorageSync('selectPcode'),
            locationName: wx.getStorageSync('selectCityName')
          });
          if (this.data.isFirstShow) {
            this.setData({
              isFirstShow: false
            })
            return;
          }
          this.currentPoint();
          this.getDataByCity(); //首页数据已经更新
          //如果用getDataByCity更新了数据 就不能用getSelectProviderByLoc再获取 否则数据会覆盖
        }

      } else {
        //是首次载入吗
        console.log('用户使用定位城市：' + this.data.locationName);
        if (this.data.isFirstShow) {
          this.setData({
            isFirstShow: false
          })
          return;
        }
        this.currentPoint();
        //如果没有更换城市 有两种情况 一种是由其他城市切回所在城市 一种是由其他页面回退到本页面
        if (this.data.locationCode == wx.getStorageSync('selectCode')) {
          return;
        } else {
          this.setData({
            showPageLoading: true,
            locationCode: wx.getStorageSync('locationCode'),
            locationPcode: wx.getStorageSync('locationPcode'),
            locationName: wx.getStorageSync('locationName')
          });
          var curLatitude = wx.getStorageSync('curLatitude'),
            curLongitude = wx.getStorageSync('curLongitude');
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
                  wx.setStorageSync('providerId', res1.id ? res1.id : '');
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
                    longitude: curLongitude,
                    latitude: curLatitude
                  };
                  that.getRecommendPage(obj);
                } else { //如果不存在服务商
                  that.setData({
                    showPageLoading: false,
                    providerId: '',
                    pageNo: 1
                  });
                  // wx.showToast({
                  //   title: '当前位置不存在服务商',
                  //   icon: 'none'
                  // })
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
                            wx.setStorageSync('locationPcode', res.parentLocation.parentLocation.locationCode);
                            that.setData({
                              locationName: res.parentLocation.locationName.replace('市', ''),
                              locationCode: res.parentLocation.locationCode,
                              locationPcode: res.parentLocation.parentLocation.locationCode
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

        this.currentPoint();

      }
    } else { //不存在 定位获取
      this.currentPoint();
      if (this.data.isFirstShow) {
        this.setData({
          isFirstShow: false
        })
      }
      this.setData({
        showPageLoading: false
      });
      return;
    }

  },
  currentPoint: function() {
    //桔子球 查询用户当前桔子数
    service.currentPoint().subscribe({
      next: res3 => {
        console.log(res3);
        this.setData({
          pointBalance: res3.pointBalance,
        });
      }
    });
  },
  share: function(obj) {

    service.share(obj).subscribe({
      next: res => {
        console.log('---------分享接口返回--------');
        console.log(res);
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  //关闭新用户见面礼
  closeGetNewer: function() {
    this.setData({
      isShowNewerGet: false
    });
  },
  //领取桔集见面礼
  getNewer: function() {
    this.setData({
      isShowNewerGet: false
    });

    service.newerGet().subscribe({
      next: res => {
        console.log(res);
        wx.showToast({
          title: '领取成功！',
          icon: 'none'
        });
        this.currentPoint();
      },
      error: err => wx.showToast({
        title: err,
        icon: 'none'
      })
    });
  },
  //swiper滑动事件
  swiperChange: function(e) {
    this.setData({
      nowIdx: e.detail.current
    })
  },
  //点击banner
  onTapBanner: function(e) {
    var link = e.currentTarget.dataset.link;
    if (link == '/juzihl/index' && this.data.pointProductList.length == 0) {
      return;
    }
    wx.navigateTo({
      url: '/pages' + link
    });
  },
  //跳转到商品详情
  toComDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    var storeid = e.currentTarget.dataset.storeid;
    console.log(id);
    wx.navigateTo({
      url: '/pages/comDetail/index?share=0&id=' + id + '&storeid=' + storeid
    });
  },
  toComDetailAndShare: function(e) {
    var id = e.currentTarget.dataset.id;
    var storeid = e.currentTarget.dataset.storeid;
    wx.navigateTo({
      url: '/pages/comDetail/index?share=1&id=' + id + '&storeid=' + storeid
    });
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
        this.setData({
          pullUpFlag: true,
          sortField: 'IDX'
        });
        obj = {
          providerId: this.data.providerId,
          // providerId: '1215422531428605',
          type: 'PRODUCT',
          sortField: 'IDX',
          sortOrder: 'ASC',
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize,
          longitude: wx.getStorageSync('curLongitude'),
          latitude: wx.getStorageSync('curLatitude')
        };
        break;
      case '2':
        this.setData({
          pullUpFlag: true,
          sortField: 'PRICE'
        });
        obj = {
          providerId: this.data.providerId,
          type: 'PRODUCT',
          sortField: 'PRICE',
          sortOrder: this.data.sortArray[Number(sortIndex) - 1],
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize,
          longitude: wx.getStorageSync('curLongitude'),
          latitude: wx.getStorageSync('curLatitude')
        };
        break;
      case '3':
        this.setData({
          pullUpFlag: true,
          sortField: 'DISTANCE'
        });
        obj = {
          providerId: this.data.providerId,
          type: 'PRODUCT',
          sortField: 'DISTANCE',
          sortOrder: this.data.sortArray[Number(sortIndex) - 1],
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize,
          longitude: wx.getStorageSync('curLongitude'),
          latitude: wx.getStorageSync('curLatitude')
        };
        break;
      case '4':
        this.setData({
          pullUpFlag: true,
          sortField: 'SOLDNUM'
        });
        obj = {
          providerId: this.data.providerId,
          type: 'PRODUCT',
          sortField: 'SOLDNUM',
          sortOrder: 'DESC',
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize,
          longitude: wx.getStorageSync('curLongitude'),
          latitude: wx.getStorageSync('curLatitude')
        };
        break;
    }
    console.log(obj);
    this.getRecommendPage(obj);
  },
  //点击桔子球
  onTapJuziqiu: function() {
    wx.switchTab({
      url: '../juzi/index',
    })
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
  toPro: function(e) {
    wx.navigateTo({
      url: '/pages/jujiGarden/recommend/index?productid=' + e.currentTarget.dataset.id
    });
  },
  //上拉加载
  onReachBottom() {
    //判断是否还可以上拉
    if (this.data.pullUpFlag) {
      let that = this;
      let p = ++this.data.pageNo;
      console.log('page:' + p);
      let obj = {
        providerId: that.data.providerId,
        type: 'PRODUCT',
        sortField: that.data.sortField,
        sortOrder: that.data.sortArray[Number(that.data.sortIndex) - 1],
        pageNo: p,
        pageSize: that.data.pageSize,
        longitude: wx.getStorageSync('curLongitude'),
        latitude: wx.getStorageSync('curLatitude')
      };

      service.getRecommendPage(obj).subscribe({
        next: res => {
          console.log(res);
          this.setData({
            recommendPage: this.data.recommendPage.concat(res.list)
          });
          console.log(res.countPage);
          console.log(this.data.pageNo);
          if (res.countPage <= this.data.pageNo) {
            this.setData({
              pullUpFlag: false
            });
          }
        },
        error: err => console.log(err),
        complete: () => wx.hideToast()
      });
    } else {
      return;
    }


  },
  //下拉刷新
  onPullDownRefresh() {
    let that = this;
    this.setData({
      pullUpFlag: true,
      sortField: 'IDX',
      sortIndex: 1,
      pageNo: 1,
      sortArray: ['ASC', 'ASC', 'ASC', 'DESC']
    });
    this.getIndexData();
    this.currentPoint();
    //根据位置查询附近精选
    var obj = {
      providerId: that.data.providerId,
      type: 'PRODUCT',
      sortField: 'IDX',
      sortOrder: 'ASC',
      pageNo: that.data.pageNo,
      pageSize: that.data.pageSize,
      longitude: wx.getStorageSync('curLongitude'),
      latitude: wx.getStorageSync('curLatitude')
    };
    service.getRecommendPage(obj).subscribe({
      next: res => {
        console.log(res);
        this.setData({
          recommendPage: res.list
        });
      },
      error: err => console.log(err),
      complete: () => {
        setTimeout(() => {
          wx.stopPullDownRefresh()
        }, 1000);
      }
    });
  },
  //根据服务商id（providerId）获取首页轮播图地址和桔子换礼的推荐
  getIndexData: function() {
    service.getIndexData({
      // providerId: this.data.providerId
      providerId: this.data.providerId,
      longitude: wx.getStorageSync('curLongitude'),
      latitude: wx.getStorageSync('curLatitude')
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
          showPageLoading: false,
          recommendPage: res.list
        });
      },
      error: err => {
        console.log(err);
        this.setData({
          showPageLoading: false
        });
      },
      complete: () => wx.hideToast()
    });
  },
  //当前城市没有数据时 点击了其他热门城市
  selectCity: function(e) {
    this.setData({
      showPageLoading: true
    });
    console.log('点击了下面的其他城市');
    var selectCityName = e.currentTarget.dataset['name'].replace('市', '');
    var selectPcode = e.currentTarget.dataset['pcode'];
    var selectCode = e.currentTarget.dataset['code'];
    wx.setStorageSync('selectCityName', selectCityName);
    wx.setStorageSync('selectPcode', selectPcode);
    wx.setStorageSync('selectCode', selectCode);
    this.setData({
      sortIndex: 1,
      pageNo: 1,
      pullUpFlag: true,
      sortArray: ['ASC', 'ASC', 'ASC', 'DESC'],
      locationCode: wx.getStorageSync('selectCode'),
      locationPcode: wx.getStorageSync('selectPcode'),
      locationName: wx.getStorageSync('selectCityName')
    });
    this.currentPoint();
    this.getDataByCity(); //首页数据已经更新
    // this.onShow();
  },
  /**
   * 用户点击右上角分享或页面中的分享
   */
  onShareAppMessage: function(res) {
    var obj = {
      type: 'SHARE_PROGRAM',
      sharePath: '/pages/index/index'
    };
    this.share(obj);
    return {
      title: '桔集：聚集优质好店，体验美好生活！',
      imageUrl: 'https://upic.juniuo.com/file/picture/26PTWGQU8nHo/resize_400_320/mode_filt/format_jpg/quality_0',
      path: '/pages/login/index?invitecode=' + wx.getStorageSync('inviteCode')
    }
  },
  //已知省市代码，获取该地点的服务商信息，然后更新首页数据
  getDataByCity: function() {
    var that = this;
    var obj = {
      provinceCode: this.data.locationPcode,
      cityCode: this.data.locationCode,
      areaCode: '',
    };
    console.log(JSON.stringify(obj));
    //选择省市县确认服务商信息
    service.getSelectHotCity(obj).subscribe({
      next: res => {
        console.log('--------选择省市县确认服务商信息---------');
        console.log(res);
        that.setData({
          providerId: res.id,
          pageNo: 1
        });
        wx.setStorageSync('providerId', res.id ? res.id : '');
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
  },
  callPhone: function() {
    wx.makePhoneCall({
      phoneNumber: '4000011139',
    });
  },
  //------------------------------ 点击推广--------------------------------------//
  showShare:function(e){
    this.setData({productInfo:this.data.recommendPage[e.currentTarget.dataset.index]});
    console.log('生成分享图片');
    console.log(constant.basePicUrl + this.data.productInfo.picId +'/resize_750_420/mode_filt/format_jpg/quality_70');
    service.userInfo({ openId: wx.getStorageSync('openid') }).subscribe({
        next: res => {
            this.setData({
                nickName: res.nickName,
                userImgUrl: res.avatar
            });
            wx.showLoading({title: '生成分享图片'});
            wx.downloadFile({
              url: constant.basePicUrl + this.data.productInfo.picId +'/resize_750_420/mode_filt/format_jpg/quality_70',
              success: (res) => {
                if (res.statusCode === 200) {
                    this.setData({headImg:res.tempFilePath});
                    console.log(this.data.userImgUrl);
                    wx.downloadFile({
                      url: this.data.userImgUrl,
                      success: (obj) => {
                        if (obj.statusCode === 200) {
                          this.setData({userImg:obj.tempFilePath});
                          this.getQrCode();
                        }else{
                          wx.hideLoading();
                        }
                      },
                      fail:(err)=>{
                          console.log('头像下载失败');
                      }
                    });
                }else{
                  wx.hideLoading();
                }
              }
            });
        },
        // error: err => errDialog(err),
        complete: () => {}
    })
  },
  closeModal:function(){
      this.setData({isShowModal:true});
  },
  getQrCode: function() {
      service.getQrCode({ productId:this.data.productId,path: 'pages/login/index'}).subscribe({
          next: res => {
            var picId = res;
            wx.downloadFile({
              url: constant.basePicUrl + picId +'/resize_200_200/mode_filt/format_jpg/quality_0',
              success: (res1) => {
                if (res1.statusCode === 200) {
                    this.setData({erwmImg:res1.tempFilePath});
                    var info = this.data.productInfo;
                    var point = info.point==null||info.point==0?'':info.point+'桔子';
                    var price = info.price==null||info.price==0?'':Number(info.price/100).toFixed(2)+'元';
                    var link = (info.price!=null&&info.price!=0)&&(info.point!=null&&info.point!=0)?'+':'';
                    var price1 = point + link + price;
                    var name = info.productName;
                    var price2 = Number(info.originalPrice / 100).toFixed(2) + '元';
                    var storeLen = info.nearStoreCount;
                    this.drawImage(info.merchantName,name,'',price1,price2,storeLen);//参数依次是storeName,desc,现价,原价,门店数
                    this.setData({isShowModal:false});
                }else{
                  wx.hideLoading();
                }
              }
            });
          },
          error: err => {
            errDialog(err);
            wx.hideLoading();
          },
          complete: () => wx.hideToast()
      });
  },
  drawImage: function(merchant,name,desc,price1,price2,storeLen) {
      var size = {w:260,h:424};
      var context = wx.createCanvasContext('myCanvas');
      context.drawImage(this.data.shareBg, 0, 0, size.w, size.h);
      context.drawImage("../../images/logo.png", 20, 18, 20, 21);
      setText(context,"“桔”美好生活，集好店优惠", 52, 35,"#000",15,'left');
      context.drawImage(this.data.headImg, 10, 52, size.w - 20,138);
      rectPath(context, 10, 190, size.w-20, 134);
      setText(context,merchant, 20, 210,"#999",10,'left');//商户名
      drawText(context,name,20,230,50,216);//商品名字
      setText(context,"适用"+storeLen+"家门店", size.w - 20, 210,"#999",10,'right');//适用门店

      context.drawImage("../../images/price.png", 20, 263, 30,13);
      setText(context,price1, 55, 275,'#E83221',14,'left');//价格
      setText(context,"原价:" + price2, size.w - 20, 275,'#999',10,'right');//原价

      context.drawImage("../../images/gou.png", 20, 293, 10,10);
      setText(context,"可退款", 35, 302,'#999',9,'left');
      context.drawImage("../../images/gou.png", 80, 293, 10,10);
      setText(context,"可转赠", 95, 302,'#999',9,'left');

      rectPath(context, 0, 334, size.w, 88);
      context.drawImage('../../images/erbg.png', 70, 387, 103, 18);
      setText(context,"长按识别小程序码", 77, 400,'#333',11,'left');

      context.save();
      context.beginPath();
      context.arc(35, 375, 25, 0, Math.PI * 2, false);
      context.clip();
      context.drawImage(this.data.userImg, 10, 350, 50, 50);
      context.restore();

      context.drawImage(this.data.erwmImg, size.w - 80, 342.5, 70, 70);
      var name = this.data.nickName;
      var nickName = name.length>8?name.substring(0,8)+'...':name;
      setText(context,nickName, 70, 360,"#333",12,'left');
      setText(context,"私藏好物，分享给你", 70, 379,'#666',11,'left');
      context.draw(true,function(){
        wx.hideLoading();
      });
  },
  savePic: function(e) {
      var that = this;
      wx.canvasToTempFilePath({
          canvasId: 'myCanvas',
          success: function(res) {
              wx.getSetting({
                  success(rep) {
                      if (!rep.authSetting['scope.writePhotosAlbum']) {
                          wx.authorize({
                              scope: 'scope.writePhotosAlbum',
                              success() {
                                  that.saveAsPhoto(res.tempFilePath);
                              },
                              fail() {
                                  wx.openSetting({
                                      success: function() {
                                          console.log("openSetting: success");
                                      },
                                      fail: function() {
                                          console.log("openSetting: fail");
                                      }
                                  });
                              }
                          })
                      } else {
                          that.saveAsPhoto(res.tempFilePath);
                      }
                  },
                  fail() {
                      console.log("getSetting: fail");
                  }
              })
          },
          fail: function(res) {
              console.log(res);
          }
      });
  },
  saveAsPhoto: function(imgUrl) {
      wx.saveImageToPhotosAlbum({
          filePath: imgUrl,
          success: (res) => {
            this.share();//分享获得桔子
            this.closeModal();
            wx.showToast({
                title: "已保存至相册",
                icon: "success"
            });
          },
          fail: function(res) {
              console.log(res);
          }
      })
  }
})


function setText(ctx,str,x,y,color,size,align){
    ctx.setFontSize(size);
    ctx.setTextAlign(align);
    ctx.setFillStyle(color);
    ctx.fillText(str, x, y);
    ctx.stroke();
}

function rectPath(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.setFillStyle('#ffffff');
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y);
    ctx.setStrokeStyle('#ffffff');
    ctx.fill();
    ctx.closePath();
}

//1、canvas对象，2、文本 3、距离左侧的距离 4、距离顶部的距离 5、6、文本的宽度
function drawText(ctx, str, left, top, titleHeight, canvasWidth) {
    var lineWidth = 0;
    var lastSubStrIndex = 0; //每次开始截取的字符串的索引
    ctx.setFontSize(12);
    ctx.setTextAlign('left');
    ctx.setFillStyle('#333');
    if(str.length>36){
      var str = str.substring(0,36)+'...';
    }
    for (let i = 0; i < str.length; i++) {
        lineWidth += ctx.measureText(str[i]).width;
        if (lineWidth > canvasWidth) {
            ctx.fillText(str.substring(lastSubStrIndex, i), left, top); //绘制截取部分
            top += 16; //16为字体的高度
            lineWidth = 0;
            lastSubStrIndex = i;
            titleHeight += 30;
        }
        if (i == str.length - 1) { //绘制剩余部分
            ctx.fillText(str.substring(lastSubStrIndex, i + 1), left, top);
        }
    }
    ctx.stroke();
    titleHeight = titleHeight + 10;
    return titleHeight
}