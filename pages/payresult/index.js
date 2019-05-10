import {
  constant
} from '../../utils/constant';
import {
  service
} from '../../service';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {showCapsule: 1,title: '支付结果'},
    addMoney:0,
    prepayMoney:0,
    wxPayMoney:0,
    payUrl: 'https://juji.juniuo.com',
    showDetail: false,
    recommendList: [],
    type:'',
    point: 0,
    preBalance: 0,
    balance: 0,
    givingMoney: 0,
    aMoney:0, //储值金额 不算赠送
    zhuheAmount: 0,
    providerId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options.orderId = '1552963656620554665079';//余额支付
    // options.orderId = '1552989230513662818301';//微信支付
    // options.orderId = '1552990946988705024048';//储值支付
    // options.orderId = '1552990220020184525455';//组合支付
    if (!options.orderId) {
      wx.showModal({
        title: '系统错误',
        content: '未能获取到订单',
      })
      return;
    } else {
      let payUrl = wx.getStorageSync('payUrl');
      if (payUrl) {
        this.setData({
          payUrl: payUrl
        });
        
      } else {
        this.setData({
          payUrl: constant.jujipayUrl
        });
      }
      wx.request({
        url: this.data.payUrl +'/customer/order/getOrdersDetail.json',
        method: 'GET',
        data: {
          orderId: options.orderId
        },
        header: {
          'content-type': 'application/json',
          'Access-Token': wx.getStorageSync('accessToken')
        },
        success: (res) => {
           console.log(res);
           if(res.data.errorCode=='0'){
             this.setData({
               type: res.data.data.type,
               zhuheAmount: res.data.data.wxPayMoney && res.data.data.wxPayMoney > 0 && res.data.data.prepayMoney > 0 ? (Number(res.data.data.prepayMoney) + Number(res.data.data.wxPayMoney)).toFixed(2) : res.data.data.prepayMoney,
               aMoney: res.data.data.givingMoney ? (Number(res.data.data.addMoney) - Number(res.data.data.givingMoney)).toFixed(2) : res.data.data.addMoney,
               givingMoney: res.data.data.givingMoney ? res.data.data.givingMoney:0,
               preBalance: res.data.data.preBalance ? res.data.data.preBalance : 0,
               balance: res.data.data.accountDto.balance,
               point: res.data.data.point,
               addMoney: res.data.data.addMoney?Number(res.data.data.addMoney):0,
               prepayMoney: res.data.data.prepayMoney?Number(res.data.data.prepayMoney):0,
               wxPayMoney: res.data.data.wxPayMoney?Number(res.data.data.wxPayMoney):0
             });
             var obj = {
                latitude: res.data.data.store.lat,
               longitude: res.data.data.store.lng
              }
             this.setData({ providerId: res.data.data.agentId });
            //  /recommend/hot.json
            wx.request({
              url: constant.apiUrl+'/recommend/hot.json',
              method: 'GET',
              data: {
                providerId: res.data.data.agentId
              },
              success: (res2) => {
                console.log(res2);
                if (res2.data.errorCode == '200') {
                    this.setData({
                      recommendList: res2.data.data
                    })
                  // console.log(this.data.recommendList);
                }else{
                    // wx.showModal({
                    //   title: '错误: ' + res2.data.errorCode,
                    //   content: res2.data.errorInfo,
                    // })
                }
              }
            })
           }else{
             wx.showModal({
               title: '错误: ' + res.data.errorCode,
               content: res.data.errorInfo,
             })
           }
        }
      });

      // service.getSelectProviderByLoc(obj).subscribe({
      //   next: res => {
      //     console.log('----------服务商信息---------');
      //     console.log(res);
      //     if (res.id) { //如果存在服务商
      //       //根据位置查询附近精选
      //       var obj = {
      //         providerId: res.id,
      //         type: 'PRODUCT',
      //         sortField: 'IDX',
      //         sortOrder: 'ASC',
      //         pageNo: 1,
      //         pageSize: 4,
      //         longitude: wx.getStorageSync('curLongitude'),
      //         latitude: wx.getStorageSync('curLatitude')
      //       };

      //       service.getRecommendPage(obj).subscribe({
      //         next: res => {
      //           console.log(res);
      //           this.setData({
      //             recommendList: res.list
      //           });
      //         },
      //         error: err => {
      //           console.log(err);
      //         },
      //         complete: () => wx.hideToast()
      //       });

      //     } else { //如果不存在服务商
      //       wx.showModal({
      //         title: '错误',
      //         content: '当前位置不存在服务商'
      //       });
      //     }
      //   }
      // });

      

    }
  },

  toCardList:function(){
    wx.redirectTo({
      url: '/pages/cardlist/index',
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // wx.setStorageSync('scene', '1011');//测试用
    let scene = wx.getStorageSync('scene');
    if (scene == '1011' || scene == '1012' || scene == '1013') {//扫描二维码场景值
      return;
    } else {
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
  },
  //切换详情的隐藏与显示
  toggleDetailWrap: function(){
    this.setData({
      showDetail: !this.data.showDetail
    });
  },
  goIndex: function(){
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
  toComDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    var storeid = e.currentTarget.dataset.storeid;
    console.log(id);
    wx.navigateTo({
      url: '/pages/comDetail/index?id=' + id + '&storeid=' + storeid
    });
  },

  phoneCall: function(){
    wx.makePhoneCall({
      phoneNumber: '4000011139'
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})