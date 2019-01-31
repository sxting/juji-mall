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
    recommendPage:[],
    sortIndex:1,
    pageNo: 1,
    pageSize: 10,
    sortArray:['','ASC','ASC','']
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
  toggleLabel: function (event){
    let sortIndex = event.currentTarget.dataset['label'];
    console.log(sortIndex);
    if (sortIndex != 1 && sortIndex != 4){
      if (this.data.sortIndex == sortIndex) {//两次相同 切换排序规则
        let arr = this.data.sortArray;
        console.log(arr);
        if (arr[Number(sortIndex)-1]=='ASC'){
          arr[Number(sortIndex)-1] = 'DESC';
        }else{
          arr[Number(sortIndex)-1] = 'ASC';
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
    switch (sortIndex){
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
          sortOrder: this.data.sortArray[Number(sortIndex)-1],
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
  toCityList:function(){
    wx.navigateTo({
      url: '../citylist/index'
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
  getRecommendPage:function(obj){
    console.log(obj);
    service.getRecommendPage(obj).subscribe({
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
    // this.getCurLocation();
    this.getIndexData();
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
  }
})