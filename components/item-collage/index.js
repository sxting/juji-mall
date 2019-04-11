// shared/component/item-collage/index.js
import { componentService } from '../shared/service';


Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pintuanListInfor: {
      type: Array,
      value: ['','']
    },
    headPortraitList: {
      type: Array,
      value: ['', '']
    },
    fleg: {
      type: String,
      value: ''
    },
    collageInforData: {
      type: Object,
      value: {}
    },
    resData: {
      type: Object,
      value: {}
    },
    activityOrderId: {
      type: String,
      value: ''
    },
    activityId: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    collageInforData: {},//获取过来的数据
    headPortraitList: [],//拼团中 参团的头像
    pintuanListInfor: [],//正在参团的小伙伴
    portraitUrl: '/images/unkonw-icon.png',
    resData: {},//拿过来的全部信息
    activityOrderId: '',//订单ID
    activityId: '',//活动ID
    orderStatus: '',//订单状态
    isInitiator: 1,//是否为发起者 (判断进入是自己 1 还是他人 0)
    orderStock: 0,//查看此活动的库存
    restHour: '00',
    restMinute: '00',
    restSecond: '00',


  },

  ready: function () {
    console.log(this.data.resData);
    console.log(this.data.activityOrderId);
    console.log(this.data.activityId);
    let self = this;

    // {
    //   activityId(string, optional): 活动id,
    //     activityOrderId(string, optional): 活动订单id,
    //       activityOrderStatus(string, optional): 活动订单状态 = ['IN_PROGRESS', 'WAIT_PAY', 'SUCCESS', 'FAIL']stringEnum: "IN_PROGRESS", "WAIT_PAY", "SUCCESS", "FAIL",
    //         activityPrice(integer, optional): 活动价格,
    //           activityType(string, optional): 活动类型 = ['BARGAIN', 'SEC_KILL', 'SPLICED']stringEnum: "BARGAIN", "SEC_KILL", "SPLICED",
    //             allowParticipate(boolean, optional): 是否允许参与,
    //               cover(string, optional): 首图,
    //                 expirationTime(string, optional): 过期时间,
    //                   initiationTime(string, optional): 发起时间,
    //                     isInitiator(integer, optional): 是否为发起者,
    //                       originalPrice(integer, optional): 商品原价,
    //                         participantQuantity(integer, optional): 参与数量,
    //                           participateCount(integer, optional): 参与数量,
    //                             productId(string, optional): 商品id,
    //                               productName(string, optional): 商品名称,
    //                                 progresses(Array[活动进度详情], optional): 活动进度详情,
    //                                   rules(Array[ActivityRuleDetail], optional): 活动规则,
    //                                     stock(integer, optional): 商品库存
    // }

    // 是否有其他参团者的活动
    if (this.data.resData.otherDigests){
      this.data.resData.otherDigests.forEach(function (item) {
        let picArr = [];
        item.resNum = (item.totalPeopleCount - item.groupPeopleCount) ? (item.totalPeopleCount - item.groupPeopleCount) : 0;
        picArr.push(item.picUrl);
        for (let i = 0; i < item.resNum; i++) {
          picArr.push('');
        }
        item.picArr = picArr;
      })
    }
    this.setData({
      pintuanListInfor: this.data.resData.otherDigests,//其他正在参团的小伙伴
      orderStatus: this.data.resData.orderDigest ? this.data.resData.orderDigest.activityOrderStatus : '',//订单状态
      isInitiator: this.data.resData.orderDigest ? this.data.resData.orderDigest.isInitiator : 1,//是否为发起者 (判断进入是自己还是他人)
      orderStock: this.data.resData.orderDigest ? this.data.resData.orderDigest.stock : 0,//查看此活动的库存
      orderInfor: this.data.resData.orderDigest,//订单信息
    })

    /** 拼团数据 **/
    let countDownTime = '';
    let haha = "2019-04-11 16:33:57";//模拟假的

    // let expireTime = this.data.resData.orderDigest && this.data.resData.orderDigest != null ? this.data.resData.orderDigest.expirationTime.replace(/-/g, '/') : '';
    let expireTime = haha.replace(/-/g, '/');//模拟假的

    if (expireTime){
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
      console.log(countDownTime);
      this.setData({
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
        self.setData({
          restHour: countDownTime.substring(0, 2),
          restMinute: countDownTime.substring(3, 5),
          restSecond: countDownTime.substring(6)
        })
      }, 1000)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /****  到我的订单 ****/ 
    switchToMineOrderList(){

    },

    /****  去参团 ****/
    onGoJoinCollageClick(e){

    },

    /****  一键开团 ****/
    payImmediately(e){
      console.log(e.currentTarget.dataset.productid);
      wx.navigateTo({
        url: '/pages/payOrder/index?id=' + e.currentTarget.dataset.productid + '&paytype==3',
      })
    }

// paytype=2 & id=2019022720003453911227326& storeid=null& sceneid=

  }
})

