// pages/activities/my-collage/index.js
var util = require('../../../utils/util.js');
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
    activityStatus: 'IN_PROGRESS'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;
    this.setData({
      activityId: options.activityId,
      activityOrderId: activityOrderId,
      activityType: options.activityType ? options.activityType : 'SPLICED'
    })
    getItemInfo.call(self);//调取详情页接口
  },

  /**
   * 去订单详情页面
   */
  switchToOrderDetailPage: function () {
    wx.navigateTo({
      url: 'pages/orderDetail/index?id='+ this.data.orderId,
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '嗨！便宜一起拼￥' + this.data.productInfo.price / 100 + '【' + this.data.productInfo.productName + '】',
      path: '/pages/login/index?pagetype=projectDetail&type=' + this.data.type + '&activityId=' + this.data.activityId + '&activityOrderId=' + this.data.activityOrderId,
      imageUrl: constant.basePicUrl + this.data.productInfo.picId + '/resize_751_420/mode_fill',
    }
  }
})

function getItemInfo() {
  let that = this;
  let data = {
    activityId: this.data.activityId,
    activityOrderId: this.data.activityOrderId ? this.data.activityOrderId : '',
    activityType: this.data.type
  }
  activitiesService.activity(data).subscribe({
    next: res => {
      if(res){
        console.log(res);

      }
    },
    error: err => console.log(err),
    complete: () => wx.hideToast()
  })
}
