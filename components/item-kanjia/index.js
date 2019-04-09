// shared/component/item-kanjia/index.js
let timer;
Component({
  properties: {
    productInfo: {
      type: Object,
      value: {}
    },
    btn: {
      type: Boolean,
      value: false
    }
  },

  data: {
    showAlert1: false,
    showAlert2: true,
    status: 'init', //未开始 init，砍价中 ing，砍价失败 fail，砍价成功 success
    shared: true,
    self: true, //是否活动发起者
    help: true, //是否已帮砍
    hours: 23,
    minites: 20,
    seconds: 58,
  },

  ready: function () {
    // getData.call(this);
  },

  methods: {
    onShareAppMessage(res) {
      if (res.from === 'button' && res.target.dataset.type === 'share2') {
        // 分享砍价
        return {
          title: '',
          path: "/pages/login/login?type=share&storeId=" + wx.getStorageSync(constant.STORE_INFO) + "&orderNo=" + this.data.orderNo + "&activityId=" + this.data.activityId,
          success: function (res) {
            console.log(res);
            this.setData({
              showAlert1: true,
              showAlert2: false
            });
          },
          fail: function (res) {
            console.log(res);
          }
        }
      } else {
        // 分享商品
        return {
          title: '',
          path: "/pages/login/login?type=share&storeId=" + wx.getStorageSync(constant.STORE_INFO) + "&activityId=" + this.data.activityId,
          success: function (res) {
            console.log(res);
          },
          fail: function (res) {
            console.log(res);
          }
        }
      }
    },

    onlyBuy() {
      let orderNo = this.data.bargainDetail.orderNo;
      let bargainDetail = JSON.stringify(this.data.bargainDetail);
      wx.navigateTo({
        url: `/pages/kanjia/submit/submit?orderNo=${orderNo}&storeId=${this.data.storeId}&bargainDetail=${bargainDetail}`,
      })
    },

    // 发起砍价 
    startKanjia() {
      this.setData({
        showAlert1: true,
        showAlert2: false
      });

      let data = {
        activityId: this.data.activityId,
        storeId: this.data.storeId
      };
      kanjiaService.initiateBargain(data).subscribe({
        next: res => {
          if (res) {
            this.setData({
              orderNo: res
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
      wx.switchTab({
        url: '/pages/home/home',
      })
    }
  }
})

// 砍价
function doBargain() {
  let data = {
    orderNo: this.data.orderNo
  }
  kanjiaService.doBargain(data).subscribe({
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
    storeId: this.data.storeId,
    orderNo: this.data.orderNo ? this.data.orderNo : ''
  }
  // kanjiaService.getBargainDetail(data).subscribe({
  //   next: res => {
  //     console.log(res);
  //     if (res.cover.imageUrl) {
  //       res.cover.imageUrl = `${constant.OSS_IMAGE_URL}${res.cover.imageUrl}/resize_375_259/mode_fill`;
  //     }
  //     if (res.picColl) {
  //       res.picColl.forEach(function (item) {
  //         item.imageUrl = `${constant.OSS_IMAGE_URL}${item.imageUrl}/resize_345_240/mode_fill`
  //       })
  //     }
  //     if (res.currentPrice) {
  //       res.yikan = NP.minus(res.activityItem.originalPrice, res.currentPrice)
  //     }

  //     // status: 'init', //未开始 init，砍价中 ing，砍价失败 fail，砍价成功 success
  //     let status = 'init'
  //     switch (res.bargainStatus) {
  //       case "BARGAINING": status = 'ing';
  //         break;
  //       case "BARGAIN_SUCCESS": status = 'success';
  //     }

  //     /* 倒计时start */
  //     if (res.bargainEndTime) {
  //       let time2 = new Date(res.bargainEndTime.replace(/-/g, '/')).getTime() - new Date().getTime();
  //       if (time2 <= 0) {
  //         self.data.hours = '00';
  //         self.data.minites = '00';
  //         self.data.seconds = '00';
  //       } else {
  //         let a = time2 / 1000 / 60 / 60;
  //         let hours = parseInt(a + '');
  //         let minutes = parseInt(time2 / 1000 / 60 - hours * 60 + '');
  //         let seconds = parseInt(time2 / 1000 - minutes * 60 - hours * 3600 + '');
  //         self.data.hours = hours.toString().length < 2 ? '0' + hours : hours;
  //         self.data.minites = minutes.toString().length < 2 ? '0' + minutes : minutes;
  //         self.data.seconds = seconds.toString().length < 2 ? '0' + seconds : seconds;
  //       }

  //       if (time2 > 0) {
  //         //倒计时
  //         timer = setInterval(function () {
  //           if (new Date('2000/01/01 ' + self.data.hours + ':' + self.data.minites + ':' + self.data.seconds).getHours().toString() === '0' && new Date('2000/01/01 ' + self.data.hours + ':' + self.data.minites + ':' + self.data.seconds).getMinutes().toString() === '0' && new Date('2000/01/01 ' + self.data.hours + ':' + self.data.minites + ':' + self.data.seconds).getSeconds().toString() === '0') {
  //             self.data.hours = '00';
  //             self.data.minites = '00';
  //             self.data.seconds = '00';
  //           } else {
  //             let time = new Date(new Date('2000/01/01 ' + self.data.hours + ':' + self.data.minites + ':' + self.data.seconds).getTime() - 1000);
  //             self.data.hours = time.getHours().toString().length < 2 ? '0' + time.getHours() : time.getHours();
  //             self.data.minites = time.getMinutes().toString().length < 2 ? '0' + time.getMinutes() : time.getMinutes();
  //             self.data.seconds = time.getSeconds().toString().length < 2 ? '0' + time.getSeconds() : time.getSeconds();
  //           }
  //           self.setData({
  //             hours: self.data.hours,
  //             minites: self.data.minites,
  //             seconds: self.data.seconds
  //           })

  //           if (self.data.hours == '00' && self.data.minites == '00' && self.data.seconds == '00') {
  //             getData.call(self);
  //           }
  //         }, 1000);
  //       }

  //       self.setData({
  //         hours: self.data.hours,
  //         minites: self.data.minites,
  //         seconds: self.data.seconds
  //       })
  //     }
  //     /* 倒计时end */

  //     this.setData({
  //       bargainDetail: res,
  //       orderNo: res.orderNo ? res.orderNo : '',
  //       status: status,
  //       help: res.remainBargainCount == 0 ? true : false,
  //       self: (!res.initiator && !res.bargainStatus) || (res.initiator && res.bargainStatus)
  //     })
  //   },
  //   error: err => {
  //     console.log(err);
  //     errDialog(err);
  //   },
  //   complete: () => wx.hideToast()
  // })
}
