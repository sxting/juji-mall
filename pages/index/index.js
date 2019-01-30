var QQMapWX = require('../../lib/qqmap-wx-jssdk.min.js');
import {
  service
} from '../../service';
var app = getApp();
Page({
  data: {
    tablist: ['发现'], //['发现', '关注']
    curTabIndex: 0,
    businessList: [],
    page: 1,
    leavePage: false,
    autoplay: false,
    current: 1,
    swiperH: '', //swiper高度
    nowIdx: 1, //当前swiper索引
    banners: ['../../images/homeBanner.png', '../../images/banner1.png', '../../images/freeGet.png'],
    slideShowList:[],
    pointProductList:[],
    recommendPage:[]
  },
  //swiper滑动事件
  swiperChange: function(e) {
    this.setData({
      nowIdx: e.detail.current
    })
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
  toFujinyh: function() {
    wx.navigateTo({
      url: '../home/index'
    });
  },
  toFreeGet: function() {
    wx.navigateTo({
      url: '../freeGet/index'
    });
  },
  toJuzihl: function() {
    wx.navigateTo({
      url: '../juzihl/index'
    });
  },
  switchTab: function(event) {
    var thisIndex = event.currentTarget.dataset['index'];
    this.setData({
      curTabIndex: thisIndex
    });
  },
  //上拉加载
  onReachBottom() {
    let that = this;
    let obj = {};
    wx.getStorageSync('curLongitude') ? obj.lng = wx.getStorageSync('curLongitude') : obj = {};
    wx.getStorageSync('curLatitude') ? obj.lat = wx.getStorageSync('curLatitude') : obj = {};
    let p = ++this.data.page;
    console.log('page:' + p);
    obj.page = p;
    service.listCommentsNearBy(obj).subscribe({
      next: res => {
        console.log('--------上拉加载更多附近的商户评价--------');
        if (res.length === 0) {
          --p;
        }
        that.setData({
          page: p
        });
        res.forEach(function(item, index, arr) {
          item.pics.forEach(function(it, i, a) {
            item.pics[i] = 'https://upic.juniuo.com/file/picture/' + it + '/resize_200_0/mode_fill';
          })
        });
        console.log(res);
        //缓存之前两页的总数据
        wx.setStorageSync('indexPageData', that.data.businessList);
        that.setData({
          businessList: that.data.businessList.concat(res)
        });
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
  //下拉刷新
  onPullDownRefresh() {
    let that = this;
    let obj = {};
    wx.getStorageSync('curLongitude') ? obj.lng = wx.getStorageSync('curLongitude') : obj = {};
    wx.getStorageSync('curLatitude') ? obj.lat = wx.getStorageSync('curLatitude') : obj = {};
    obj.page = 1;
    this.setData({
      page: 1
    });
    service.listCommentsNearBy(obj).subscribe({
      next: res => {
        console.log('--------首页附近商户评价--------');
        res.forEach(function(item, index, arr) {
          item.pics.forEach(function(it, i, a) {
            item.pics[i] = 'https://upic.juniuo.com/file/picture/' + it + '/resize_200_0/mode_fill';
          })
        });
        console.log(res);
        that.setData({
          businessList: res
        });
      },
      error: err => console.log(err),
      complete: () => {
        wx.hideToast();
        // 数据成功后，停止下拉刷新
        wx.stopPullDownRefresh();
      }
    });
  },
  //点赞
  toPraise: function(event) {
    // wx.showLoading({
    //   title: '请稍候',
    // });
    console.log(event);
    console.log(event.currentTarget.dataset.maker);
    let that = this;
    let commentId = event.currentTarget.dataset.comid;
    let status = event.currentTarget.dataset.status;
    status == 1 ? status = 0 : status = 1;
    service.praise({
      commentId: commentId,
      status: status
    }).subscribe({
      next: res => {
        console.log('-----------点赞返回结果---------');
        console.log(res);
        let arr = that.data.businessList;
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].id == commentId) {
            arr[i].praise = status;
            let praiseCount = arr[i].praiseCount;

            if (status == 1) {
              arr[i].praiseCount = ++praiseCount;
            } else {
              arr[i].praiseCount = --praiseCount;
            }
          }
        }

        that.setData({
          businessList: arr
        });
        console.log(that.data.businessList);

        // wx.hideLoading();
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
  goCommentDetail: function(event) {
    this.setData({
      leavePage: true
    });
    console.log(event);
    let comid = event.currentTarget.dataset.comid;
    console.log(comid);
    wx.navigateTo({
      url: '/pages/commentDetail/index?id=' + comid
    });
  },
  getCurLocation: function() {
    var that = this;
    var qqmapsdk = new QQMapWX({
      key: 'WW6BZ-WDS3F-WIVJN-JHT4U-5LDQ6-CYBPY'
    });
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        wx.setStorageSync('curLatitude', res.latitude);
        wx.setStorageSync('curLongitude', res.longitude);
        console.log('--------位置调用成功--------');
        let obj = {
          lng: res.longitude,
          lat: res.latitude,
          page: 1
        };
        // that.getNearCommentsData(obj);
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function(res) {
            var city = res.result.address_component.city.substring(0, 2);
            wx.setStorageSync('curCity', city);
            console.log(res.result.formatted_addresses.recommend);
          }
        })
      },
      fail: function(err) {
        console.log('---------位置调用失败或是被拒绝--------');
        console.log(err);
        console.log('--------不传输坐标获取默认商户评价--------');
        let obj = {
          page: 1
        };
        // that.getNearCommentsData(obj);
      }
    })
  },
  getNearCommentsData: function(obj) {
    let that = this;
    service.listCommentsNearBy(obj).subscribe({
      next: res => {
        console.log('--------返回附近评价列表--------');
        res.forEach(function(item, index, arr) {
          item.pics.forEach(function(it, i, a) {
            item.pics[i] = 'https://upic.juniuo.com/file/picture/' + it + '/resize_200_0/mode_fill';
          })
        });
        console.log(res);
        that.setData({
          businessList: res
        });
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
  toUserCircle: function(event) {
    console.log(event.currentTarget.dataset.userid);
    wx.navigateTo({
      url: '/pages/myCircle/index?id=' + event.currentTarget.dataset.userid
    });
  },
  getIndexImages() {
    consolel.log('');
  },
  getPreOrder: function() {
    var obj = {
      openid: wx.getStorageSync('accessToken')
    };
    // var obj = wx.getStorageSync('accessToken');
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
  getIndexData:function(){
    service.getIndexData({ providerId:'1215422531428605'}).subscribe({
      next: res => { 
        console.log(res);
        this.setData({
          slideShowList: res.slideShowList,
          pointProductList: res.pointProductList
        })
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
  getRecommendPage:function(){
    service.getRecommendPage({
      providerId: '1215422531428605',
      type:'PRODUCT',
      sortField:'IDX',
      sortOrder:'ASC',
      pageNo:1,
      pageSize:10,
      longitude:'116.470959',
      latitude:'39.992368'}).subscribe({
      next: res => {
        console.log(res);
        this.setData({
          recommendPage:res.list
        });
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
  onLoad: function(options) {
    // this.getPreOrder();
    console.log('--------------index-onLoad-------------');
    wx.setNavigationBarTitle({
      title: ''
    });
    this.getIndexData();
    this.getRecommendPage();
  }
})