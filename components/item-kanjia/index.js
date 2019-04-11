// shared/component/item-kanjia/index.js
import { componentService } from '../shared/service';
import { errDialog, loading } from '../../utils/util';
import { constant } from '../../utils/constant';

let timer;
Component({
  properties: {
    productInfo: {
      type: Object,
      value: {}
    },
    resData: {
      type: Object,
      value: {}
    },
    btn: {
      type: Boolean,
      value: false
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

  data: {
    showAlert1: false,
    showAlert2: false,
    status: 'init', //未开始 init，砍价中 ing，砍价失败 fail，砍价成功 success
    shared: true,
    self: true, //是否活动发起者
    help: true, //是否已帮砍
    hours: 23,
    minites: 20,
    seconds: 58,
  },

  ready: function () {
    console.log(this.data.resData)
    // getData.call(this);
  },

  methods: {
    onlyBuy() {
      let orderNo = this.data.bargainDetail.orderNo; 
      let resData = JSON.stringify(this.data.resData); 
      if (e.currentTarget.dataset.type == '1') {
        wx.navigateTo({
          url: `/pages/payOrder/index?resData=${resData}`,
        })
      } else {
        wx.navigateTo({
          url: `/pages/payOrder/index?activityOrderId=${this.data.activityOrderId}&resData=${resData}`,
        })
      }
    },

    // 发起砍价 
    startKanjia() {
      this.setData({
        showAlert2: false
      });

      let data = {
        activityId: this.data.activityId
      };
      console.log(data)
      componentService.initiateBargain(data).subscribe({
        next: res => {
          if (res) {
            this.setData({
              showAlert1: true,
              activityOrderId: res
            })
            doBargain.call(this);
          }
        },
        error: err => errDialog(err),
        complete: () => wx.hideToast()
      })
    },

    helpKJ() {
      this.setData({
        showAlert2: true
      })
      doBargain.call(this);
    },

    closeAlert1() {
      this.setData({
        showAlert1: false
      })
      getData.call(this);
    },

    closeAlert2() {
      this.setData({
        showAlert2: false
      })
      getData.call(this);
    },

    lookOthers() {
      wx.navigateTo({
        url: '/pages/activities/project-list/index?sceneType=BARGAIN',
      })
    }
  }
})

// 砍价
function doBargain() {
  let data = {
    activityOrderId: this.data.activityOrderId
  }
  componentService.doBargain(data).subscribe({
    next: res => {
      this.setData({
        price1: res
      })
    },
    error: err => errDialog(err),
    complete: () => wx.hideToast()
  })
}

// 项目详情
function getData() {
  let self = this;
  if (timer) {
    clearInterval(timer);
  }
  let data = {
    activityId: this.data.activityId,
    activityOrderId: this.data.activityOrderId ? this.data.activityOrderId : '',
    activityType: 'BARGAIN'
  }
  componentService.activity(data).subscribe({
    next: res => {
      console.log(res);
    
      if (res.currentPrice) {
        res.yikan = NP.minus(res.activityItem.originalPrice, res.currentPrice)
      }

      // status: 'init', //未开始 init，砍价中 ing，砍价失败 fail，砍价成功 success
      let status = 'init'
      switch (res.orderDigest.activityOrderStatus) {
        case "IN_PROGRESS": status = 'ing';
          break;
        case "WAIT_PAY": status = 'success';
          break;
        case "FAIL": status = 'fail'
      }

      /* 倒计时start */
      if (res.orderDigest && res.orderDigest.expirationTime) {
        let time2 = new Date(res.orderDigest.expirationTime.replace(/-/g, '/')).getTime() - new Date().getTime();
        if (time2 <= 0) {
          self.data.hours = '00';
          self.data.minites = '00';
          self.data.seconds = '00';
        } else {
          let a = time2 / 1000 / 60 / 60;
          let hours = parseInt(a + '');
          let minutes = parseInt(time2 / 1000 / 60 - hours * 60 + '');
          let seconds = parseInt(time2 / 1000 - minutes * 60 - hours * 3600 + '');
          self.data.hours = hours.toString().length < 2 ? '0' + hours : hours;
          self.data.minites = minutes.toString().length < 2 ? '0' + minutes : minutes;
          self.data.seconds = seconds.toString().length < 2 ? '0' + seconds : seconds;
        }

        if (time2 > 0) {
          //倒计时
          timer = setInterval(function () {
            if (new Date('2000/01/01 ' + self.data.hours + ':' + self.data.minites + ':' + self.data.seconds).getHours().toString() === '0' && new Date('2000/01/01 ' + self.data.hours + ':' + self.data.minites + ':' + self.data.seconds).getMinutes().toString() === '0' && new Date('2000/01/01 ' + self.data.hours + ':' + self.data.minites + ':' + self.data.seconds).getSeconds().toString() === '0') {
              self.data.hours = '00';
              self.data.minites = '00';
              self.data.seconds = '00';
            } else {
              let time = new Date(new Date('2000/01/01 ' + self.data.hours + ':' + self.data.minites + ':' + self.data.seconds).getTime() - 1000);
              self.data.hours = time.getHours().toString().length < 2 ? '0' + time.getHours() : time.getHours();
              self.data.minites = time.getMinutes().toString().length < 2 ? '0' + time.getMinutes() : time.getMinutes();
              self.data.seconds = time.getSeconds().toString().length < 2 ? '0' + time.getSeconds() : time.getSeconds();
            }
            self.setData({
              hours: self.data.hours,
              minites: self.data.minites,
              seconds: self.data.seconds
            })

            if (self.data.hours == '00' && self.data.minites == '00' && self.data.seconds == '00') {
              getData.call(self);
            }
          }, 1000);
        }

        self.setData({
          hours: self.data.hours,
          minites: self.data.minites,
          seconds: self.data.seconds
        })
      }
      /* 倒计时end */

      this.setData({
        resData: res,
        activityOrderId: res.orderDigest ? res.orderDigest.activityOrderId : '',
        status: status,
        help: res.remainBargainCount == 0 ? true : false,
        self: (!res.orderDigest) || (res.orderDigest && res.orderDigest.isInitiator)
      })
    },
    error: err => {
      console.log(err);
      errDialog(err);
    },
    complete: () => wx.hideToast()
  })
}
