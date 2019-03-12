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
    locationPcode: '',
    locationCode: '',
    locationName: '',
    businessList: [],
    leavePage: false,
    autoplay: true,
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
    pointBalance: 0,
    imageWidth:'200rpx',
    sortField:'IDX',
    pullUpFlag: true,
    showPageLoading: true,//首页加载过程中标记 当最后一层的pageComment返回之后设置为false
    // citylist: [],
    citylist: [{
      "version": 0,
      "dateCreated": "2019-01-23 18:31:25",
      "lastUpdated": "2019-01-23 18:31:25",
      "deleted": 0,
      "locationCode": "410000",
      "locationName": "河南省",
      "locationType": "PROVINCE",
      "parentLocationCode": "0",
      "parentLocation": null,
      "subList": [
        {
          "version": 0,
          "dateCreated": "2019-01-23 18:31:25",
          "lastUpdated": "2019-01-23 18:31:25",
          "deleted": 0,
          "locationCode": "410100",
          "locationName": "郑州市",
          "locationType": "CITY",
          "parentLocationCode": "410000",
          "parentLocation": null,
          "subList": [
            {
              "version": 0,
              "dateCreated": "2019-01-23 18:31:25",
              "lastUpdated": "2019-01-23 18:31:25",
              "deleted": 0,
              "locationCode": "410105",
              "locationName": "金水区",
              "locationType": "DISTRICT",
              "parentLocationCode": "410100",
              "parentLocation": null,
              "subList": null
            }
          ]
        }
      ]
    }],
    isFirstShow:true,
    isLoadedBalance:true
  },
  onLoad: function(options) {
    console.log(options);
    wx.setNavigationBarTitle({
      title: ''
    });
    wx.showShareMenu({
      withShareTicket: true
    });
    console.log('--------------index-onLoad-------------');

    let that = this;

    new Promise(function(resolve, reject) {
      console.log('Promise is ready!');
      wx.getSetting({
        success: (res) => {
          console.log(res.authSetting['scope.userInfo']);
          if (!res.authSetting['scope.userInfo']) {
            wx.reLaunch({
              url: '/pages/login/index?fromPage=index&inviteCode=' + options.inviteCode
            });
          } else { //如果已经授权
            //判断rowData是否存在
            // if (wx.getStorageSync('rawData')) { //如果存在
              resolve();
            // } else { //如果不存在rowData
            //   reject('未获取rawData');
            // }
          }
        }
      });
    }).then(function() {

      return new Promise(function(resolve1, reject1) {
        wx.login({
          success: res => {
            console.log('code: ' + res.code);
            console.log(constant.APPID);
            resolve1(res.code);
          }
        });

      })
    }).then(function(code) {

      return new Promise(function(resolve2, reject2) {
        wx.request({
          url: 'https://c.juniuo.com/shopping/user/login.json',
          method: 'GET',
          data: {
            code: code,
            appId: constant.APPID,
            isMock: false, //测试标记
            inviteCode: options.inviteCode,
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
              wx.setStorageSync('inviteCode', res1.data.data.inviteCode);
              wx.setStorageSync('userinfo', JSON.stringify(res1.data.data));

              //成功登陆之后 查询新用户见面礼
              service.isNewer().subscribe({
                next: res2 => {
                  console.log(res2)
                  if (res2) {
                    that.setData({
                      isShowNewerGet: true
                    });
                  }

                },
                error: err => console.log(err)
              });

              //桔子球 查询用户当前桔子数
              that.currentPoint();

              //获取热门城市
              // var imageWidth = (wx.getSystemInfoSync().windowWidth - 66) / 3;
              // that.setData({
              //   imageWidth: imageWidth + 'px'
              // });
              // service.getHotData().subscribe({
              //   next: res => {
              //     console.log(res);
              //     let arr = [];
              //     res.forEach(function(item,index){
              //       if (item.subList[0].locationCode != wx.getStorageSync('locationCode')){
              //         arr.push(item);
              //       }
              //     });
              //     that.setData({
              //       citylist: arr
              //     });
              //   },
              //   error: err => errDialog(err),
              //   complete: () => wx.hideToast()
              // })

              resolve2();
            } else {
              reject2('登录失败，错误码:' + res1.data.errorCode + ' 返回错误: ' + res1.data.errorInfo);
            }
          },
          fail:(err) =>{
            that.setData({
              showPageLoading: false
            });
            reject2(err.errMsg);
          }
        });
      });

    }).then(function() {
      console.log('---------用户位置--------');
      return new Promise(function(resolve3, reject3) {
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
      });

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
            } else { //如果不存在服务商
              wx.showModal({
                title: '错误',
                content: '当前位置不存在服务商'
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
  onShow: function () {
    var that = this;
    setTimeout(() => {
      that.setData({
        showPageLoading: false
      });
    }, 5000);
    if (wx.getStorageSync('selectCode')){//存在 说明用户选过异地城市
      if (wx.getStorageSync('locationCode') != wx.getStorageSync('selectCode')) {
        //如果城市更换了 需要通过用户选择的城市编号code重新加载页面
        console.log('用户更换城市为：' + wx.getStorageSync('selectCityName'));
        //此处应该判断用户有没有再次更换城市 如果没有更换城市不再次查询
        if (this.data.locationCode == wx.getStorageSync('selectCode')){
          this.currentPoint();
          return ;
        }else{
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
        console.log('没有更换城市');
        if (this.data.isFirstShow) {
          this.setData({
            isFirstShow: false
          })
          return;
        }
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
    }else{//不存在 定位获取
      this.setData({
        showPageLoading: false
      });
      return ;
    }

  },
  currentPoint: function () {
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
  share: function (obj) {

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
  onTapBanner:function(e){
    var link = e.currentTarget.dataset.link;
    if (link == '/juzihl/index' && this.data.pointProductList.length==0){
      return ;
    }
      wx.navigateTo({
        url: '/pages'+link
      });
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
  onTapJuziqiu:function(){
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
          if (res.countPage <= this.data.pageNo){
            this.setData({
              pullUpFlag: false
            });
          }
        },
        error: err => console.log(err),
        complete: () => wx.hideToast()
      });
    }else{
      return ;
    }
    

  },
  //下拉刷新
  onPullDownRefresh() {
    let that = this;
    this.setData({
      pullUpFlag:true,
      sortField:'IDX',
      sortIndex: 1,
      pageNo: 1,
      sortArray: ['ASC', 'ASC', 'ASC', 'DESC']
    });
    this.getIndexData();
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
          showPageLoading:false,
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
  selectCity:function(e){
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
  onShareAppMessage: function (res) {
    var obj = {
      type: 'SHARE_PROGRAM',
      sharePath: '/pages/index/index'
    };
    this.share(obj);
    return {
      title: '桔集：聚集优质好店，体验美好生活！',
      imageUrl: '/images/shareMinPro.png',
      path: '/pages/index/index?inviteCode=' + wx.getStorageSync('inviteCode')
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