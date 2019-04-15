// pages/activities/my-collage/index.js
import { service } from '../../../service';
import { activitiesService } from '../shared/service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    portraitUrl: '/images/unkonw-icon.png',
    headPortraitList: ['',''],//拼团中 参团的头像
    restHour: '00',
    restMinute: '00',
    restSecond: '00',
    activityId: '',
    activityOrderId: '',
    activityType: '',
    productInfo: {},//商品详情
    orderId: '',
    store: {},//
    activityStatus: 'IN_PROGRESS',
    progressId: '',
    storeId: '',
    productId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;
    console.log(options);
    this.setData({
      progressId: options.progressId ? options.progressId : '',
      activityId: options.activityId ? options.activityId : '',
      activityOrderId: options.activityOrderId ? options.activityOrderId : '',
      activityType: options.activityType ? options.activityType : 'SPLICED'
    })
    getItemInfo.call(self);//调取详情页接口
  },

  /**
   * 去订单详情页面
   */
  switchToOrderDetailPage: function () {
    let self = this;
    console.log(this.data.activityOrderId + '/' + this.data.progressId);
    wx.navigateTo({
      url: '/pages/orderDetail/index?id=' + self.data.activityOrderId + '&storeid=' + self.data.storeId
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let self = this;
    return {
      title: '嗨！便宜一起拼￥' + this.data.productInfo.activityPrice / 100 + '【' + this.data.productInfo.productName + '】',
      path: '/pages/login/index?pagetype=projectDetail&type=' + self.data.activityType + '&activityId=' + self.data.activityId + '&activityOrderId=' + self.data.activityOrderId + '&progressId=' + self.data.progressId,
      imageUrl: constant.basePicUrl + self.data.productInfo.cover + '/resize_751_420/mode_fill',
    }
  },

  /*** 打电话 **/ 
  callPhone(e){
    let phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
    });
  },

  // copyBtn(e){
  //   let copyData = e.currentTarget.dataset.copydata;
  //   wx.setClipboardData({
  //     data: copyData,
  //     success: function (res) {
  //       wx.getClipboardData({
  //         success: function (res) {
  //           console.log(res.data) // data
  //         }
  //       })
  //     }
  //   })
  // },

  // 使用几家门店
  toMerchantsList: function () {
    wx.navigateTo({
      url: '/pages/merchantsCanUse/index?id=' + this.data.productId
    });
  },

})

function getItemInfo() {
  let that = this;
  let data = {
    progressId: this.data.progressId,
    activityId: this.data.activityId,
    activityOrderId: this.data.activityOrderId ? this.data.activityOrderId : '',
    activityType: 'SPLICED'
  }
  activitiesService.activity(data).subscribe({
    next: res => {
      if(res){
        console.log(res);
        /** 倒计时 **/
        let countDownTime = '';
        let expireTime = res.orderDigest && res.orderDigest != null ? res.orderDigest.expirationTime.replace(/-/g, '/') : '';
        if (expireTime) {
          let time = new Date(expireTime).getTime() - new Date().getTime();
          console.log(time);
          if (time <= 0) {
            countDownTime = '00:00:00'
          } else {
            let hours = parseInt(time / 1000 / 60 / 60 + '');
            let minutes = parseInt(time / 1000 / 60 - hours * 60 + '');
            let seconds = parseInt(time / 1000 - minutes * 60 - hours * 3600 + '');
            countDownTime = (hours.toString().length < 2 ? '0' + hours : hours) + ':' +
              (minutes.toString().length < 2 ? '0' + minutes : minutes) + ':' +
              (seconds.toString().length < 2 ? '0' + seconds : seconds);
          }
          that.setData({
            restHour: countDownTime.substring(0, 2),
            restMinute: countDownTime.substring(3, 5),
            restSecond: countDownTime.substring(6)
          })
          /* 倒计时 */
          let downTime = '2000/01/01';
          let timer = setInterval(function () {
            if (new Date(downTime + ' ' + countDownTime).getHours().toString() === '0' && new Date(downTime + ' ' + countDownTime).getMinutes().toString() === '0' && new Date(downTime + ' ' + countDownTime).getSeconds().toString() === '0') {
              countDownTime = '00:00:00';
              clearInterval(timer);
            } else {
              let times = new Date(new Date(downTime + ' ' + countDownTime).getTime() - 1000);
              countDownTime =
                (times.getHours().toString().length < 2 ? '0' + times.getHours() : times.getHours()) + ':' +
                (times.getMinutes().toString().length < 2 ? '0' + times.getMinutes() : times.getMinutes()) + ':' +
                (times.getSeconds().toString().length < 2 ? '0' + times.getSeconds() : times.getSeconds());
            }
            that.setData({
              restHour: countDownTime.substring(0, 2),
              restMinute: countDownTime.substring(3, 5),
              restSecond: countDownTime.substring(6)
            })
          }, 1000)
        }

        /** 参团的人 **/
        if (res.orderDigest && res.orderDigest.progresses.length != 0){
          let resNum = 2 - res.orderDigest.progresses.length;
          for (let i = 0; i < resNum; i++) {
            res.orderDigest.progresses.push({});
          }
        }
        that.setData({
          productInfo: res,
          productOrderInfo: res.orderDigest,
          store: res.product.store,
          storeId: res.product.store.id,
          headPortraitList: res.orderDigest.progresses,
          productId: res.orderDigest ? res.orderDigest.productId : '',
          activityStatus: res.orderDigest? res.orderDigest.activityOrderStatus : '',
        })
      }
    },
    error: err => console.log(err),
    complete: () => wx.hideToast()
  })
}
