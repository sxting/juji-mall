import {
  service
} from '../../../../service';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    merchantId: {
      type: String,
      value: ''
    },
    //设置单选和多选
    moreSwitchSet: {
      type: Boolean,
      value: false
    },
    //卡片列表的数组数据
    cardsDataList: {
      type: Array,
      value: []
    },
    isShowHycardModal: {
      type: Boolean,
      value: true
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    amount: 0,
    checkedId: ''
  },
  ready: function() {
    /*查询卡列表*/
    service.listCards({
      merchantId: this.data.merchantId
    }).subscribe({
      next: res => {
        console.log('-----------组件返回卡列表---------');
        console.log(res);
        this.setData({
          amount: res[0].price,
          cardsDataList: res,
          checkedId: res[0].id
        });
        console.log('-----------组件返回修改后（添加了总额）的卡列表---------');
        console.log(this.data.cardsDataList);
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });


  },
  /**
   * 组件的方法列表
   */
  methods: {
    tapwin:function(){
      console.log('点击了边框部分');
    },
    _closeHycardModal: function() {
      console.log('触发关闭');
      //触发关闭回调
      this.triggerEvent("closeEvent")
    },
    /*跳转支付*/
    payBuyCards: function() {
      this.closeHycardModal();
      //wx支付api
    },
    // 计算合计回调函数
    _changeBuyCardsNum: function(e) {
      console.log(e.detail);
      let checkedId = this.data.checkedId;
      let num = e.detail.num;
      let itemid = e.detail.itemid;
      let arr = this.data.cardsDataList;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].id == itemid) {
          arr[i].count = num;
          // console.log('给id为' + itemid + '的数据赋值了count' + num);
        }
      }
      this.setData({
        cardsDataList: arr
      });
      if (itemid === checkedId) {
        let amount = 0;
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].id === checkedId) {
            amount = arr[i].price * arr[i].count;
          }
        }
        this.setData({
          amount: amount
        });
      }
    },
    _selectCards: function(event) {
      console.log(event);
      console.log(this.data.cardsDataList);
      let checkedId = event.currentTarget.dataset.itemid;
      let amount = 0;
      for (let i = 0; i < this.data.cardsDataList.length; i++) {
        if (checkedId == this.data.cardsDataList[i].id) {
          if (this.data.cardsDataList[i].count) {
            amount = this.data.cardsDataList[i].price * this.data.cardsDataList[i].count;
          } else {
            amount = this.data.cardsDataList[i].price;
          }
        }
      }
      this.setData({
        amount: amount,
        checkedId: checkedId
      });
    },
    _buyCards: function() {
      let that = this;
      let cardid = this.data.checkedId;
      let count = 0;
      for (let i = 0; i < this.data.cardsDataList.length; i++) {
        if (cardid == this.data.cardsDataList[i].id) {
          if (this.data.cardsDataList[i].count) {
            count = this.data.cardsDataList[i].count;
          } else {
            count = 1;
          }
        }
      }
      console.log('购买卡片id：' + cardid + ' 数量：' + count);
      service.buyCard({
        cardId: cardid,
        count: count
      }).subscribe({
        next: res => {
          console.log(res);
          console.log('--调用支付接口--');
          wx.requestPayment({
            'timeStamp': res.timeStamp,
            'nonceStr': res.nonceStr,
            'package': res.package,
            'signType': res.signType,
            'paySign': res.paySign,
            'success': function(res) {
              console.log(res);
              //请到我的卡包中关闭/开启卡片共享
              that.triggerEvent("showPreBuyCardEvent", {
                confirmTitle: '购卡成功',
                confirmContent: '请到我的卡包中确认查看'
              });
            },
            'fail': function(res) {
              console.log(res);
              that.triggerEvent("showPreBuyCardEvent", {
                confirmTitle: '购卡失败',
                confirmContent: '请确认网络并重新支付'
              });
            }
          })


        },
        error: err => {
          console.log(err);
          that.triggerEvent("showPreBuyCardEvent", {
            confirmTitle: '购卡失败',
            confirmContent: err
          });
        },
        complete: () => wx.hideToast()
      });
      this._closeHycardModal();
    }

  }
})