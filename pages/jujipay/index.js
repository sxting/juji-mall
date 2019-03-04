import {
  service
} from '../../service';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    logo:'',//门店logo
    storeName:'',//门店名称
    showFocus: true,//显示光标
    numArr: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    amount: '',
    maxAmount: 20000,
    seledAccount:false,
    showBalanceWrap: false,
    showSelectCard: false,
    cardList: [{},{}],
    selectCardId:'',
    paytype:'recommend',
    recommend: '1',
    discount: 0 //储值折扣
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  },
  toPay: function(){
    if (this.data.toPayStatus) {
      return;
    }
    this.setData({
      toPayStatus: true
    });
    console.log('this.paytype: ' + this.data.paytype);
    let orderObj = {};
    this.data.paytype ? orderObj.choosenType = this.data.paytype : orderObj;
    this.data.selectCardId ? orderObj.prepayRuleId = this.data.selectCardId : orderObj;
    this.data.givingMoney != undefined && this.data.givingMoney != null ? orderObj.givingMoney = this.data.givingMoney : orderObj;
    orderObj.orderPay = Number(this.data.dAmount);//订单消费的金额 用户在门店消费金额
    if (this.data.seledAccount) {//勾选了余额支付
      // if (this.data.thirdtype == '1') {//判断第三方支付类型 
        if (this.data.paytype === 'account') { //如果勾选了余额支付且选择微信支付后 支付类型是account 是组合支付
          console.log('微信组合支付');
          orderObj.pay = Number(this.data.amount);
          this.wxpay(orderObj);
        } else if (this.data.paytype === 'recommend') { //如果是储值支付
          console.log('微信储值支付');
          orderObj.pay = Number(this.data.selectCardPay);
          this.wxpay(orderObj);
        }
      // } else {
      //   if (this.paytype === 'account') { //如果勾选了余额支付且选择微信支付后 支付类型是account 是组合支付
      //     console.log('支付宝组合支付');
      //     orderObj.pay = Number(this.amount);
      //     this.alipay(orderObj);
      //   } else if (this.paytype === 'recommend') { //如果是储值支付
      //     console.log('支付宝储值支付');
      //     orderObj.pay = Number(this.selectCardPay);
      //     this.alipay(orderObj);
      //   }
      // }
    } else {//没有勾选
      // if (this.thirdtype == '1') {//判断第三方支付类型
        if (this.data.paytype === 'recommend') {
          console.log('微信储值支付');
          orderObj.pay = Number(this.data.selectCardPay);
          this.wxpay(orderObj);
        } else {
          console.log('微信支付');
          orderObj.pay = Number(this.data.dAmount);
          this.wxpay(orderObj);

        }
      // } else {
      //   if (this.paytype === 'recommend') {
      //     console.log('支付宝储值支付');
      //     orderObj.pay = Number(this.selectCardPay);
      //     this.alipay(orderObj);
      //   } else {
      //     console.log('支付宝');
      //     orderObj.pay = Number(this.dAmount);
      //     this.alipay(orderObj);

      //   }
      // }
    }

    console.log(orderObj);
  },
  wxpay(orderObj) {
    service.preOrder({
      choosenType: this.data.paytype,
      givingMoney: Number(orderObj.givingMoney),
      orderPay: Number(orderObj.orderPay),
      pay: Number(orderObj.pay),
      prepayRuleId: orderObj.prepayRuleId,
      storeId: '1'
    }).subscribe({
      next: res => {
        console.log('---------使用微信支付返回数据----------');
        console.log(res);
        let that = this;
      }
    })
    axios({
      url: '/customer/order/preOrder.json',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': $$('accessToken').value
      },
      data: {
        choosenType: this.paytype,
        givingMoney: Number(orderObj.givingMoney),
        orderPay: Number(orderObj.orderPay),
        pay: Number(orderObj.pay),
        prepayRuleId: orderObj.prepayRuleId,
        storeId: $$('storeId').value
      }
    }).then(res => {
      console.log('---------使用微信支付返回数据----------');
      console.log(res);
      let that = this;
      // alert(JSON.stringify(res));
      if (res.data.errorCode == "0") {
        wx.requestPayment({
          timeStamp: res.timeStamp,
          nonceStr: res.nonceStr,
          package: res.package,
          signType: res.signType,
          paySign: res.paySign,
          success(res2) {
            console.log(res2);
            // wx.redirectTo({
            //   url: '/pages/orderDetail/index?id=' + res1.orderId,
            // });
            that.setData({
              toPayStatus: false
            });
          },
          fail(res2) {
            console.log(res2);
            if (res2.errMsg == 'requestPayment:fail cancel') {
              wx.showToast({
                title: '用户取消支付',
                icon: 'none'
              });
              //跳转到待支付列表
              that.toMyOrder();
              that.setData({
                toPayStatus: false
              });
            }

          }
        });
      } else {
        // this.$toast(res.data.errorInfo, 'center');
        wx.showModal({
          title: '提示',
          content: res.data.errorInfo,
        })
        that.setData({
          toPayStatus: false
        });
      }
    }).catch(err => {
      console.log(err);
    })
  },
  changePaytype: function() {
    this.setData({
      paytype: 'recommend'
    });
    // this.swiper.slideTo(this.selectedSlideIndex);
  },
  changePaytype3: function(){
    console.log(this.data.seledAccount);
    if(this.data.seledAccount){
      this.setData({
        paytype: 'account'
      });
    }else{
      this.setData({
        paytype: 'thirdpay'
      });
    }
    console.log(this.data.paytype);
  },

  keyTap:function(e){
    console.log(e.currentTarget.dataset.num);
    if (this.data.amount == '请输入付款金额') {
      this.data.amount = '';
    }
    let keys = e.currentTarget.dataset.num,
      content = this.data.amount, //金额字符
      len = content.length; //金额字符长度
    switch (keys) {
      case ".":
        if (len < 8 && content.indexOf(".") == -1) {
          //如果字符串里有小数点了，则不能继续输入小数点，且控制最多可输入10个字符串
          if (len < 1) {
            //如果小数点是第一个输入，那么在字符串前面补上一个0，让其变成0.
            content = "0.";
          } else {
            //如果不是第一个输入小数点，那么直接在字符串里加上小数点
            content += ".";
          }
        }
        break;
      case "-": //如果点击删除键就删除字符串里的最后一个
        content = content.substr(0, content.length - 1);
        break;
      case 0:
        if (content.indexOf("0") != 0) { //如果第一位不是0 可以显示一个0 如果第二位是个小数点可以再显示一个0
          //判断小数点前的数字位数 如果超过5位 则接下来只能输入小数点
          let arr = content.split('.');
          console.log(arr);
          if (arr.length < 2) { //如果没有小数位的情况下
            if (arr[0].length < 5) { //小数点前的数字在5位以内
              let str = content; //开始输入的4位（包括4位）以内的数
              str += keys;
              if (Number(str) > this.data.maxAmount) { //此处判断例如30000、40000等超过20000的情况
                wx.showModal({
                  title: '错误',
                  content: '输入最大金额不能超过' + this.data.maxAmount
                });
                return;
              } else {
                content += keys;
              }
            } else {
              wx.showModal({
                title: '错误',
                content: '输入最大金额不能超过' + this.data.maxAmount
              });
            }
          } else { //如果有小数位
            if (arr[1] == "" || arr[1].length === 1) {
              content += keys;
            }
          }
        } else { //如果第一位是0
          if (content.indexOf(".") == 1) { //在是 '0.' 的情况 可以再输入一次0 '0.0'的情况不可以再输入0
            if (content.length == 2) {
              content += keys;
            } else if (content.length == 3) {
              if (content == '0.0') {
                wx.showModal({
                  title: '错误',
                  content: '输入金额不能为 0.00'
                });
              } else {
                content += keys;
              }
            }
          }
        }
        break;
      default:
        let index = content.indexOf("."); //小数点在字符串中的位置
        if (index == -1 || len - index != 3) {
          //判断第一位为0且没有小数点的情况
          if (content.indexOf("0") == 0 && index == -1) {
            content = keys.toString();
          } else {
            //判断小数点前的数字位数 如果超过5位 则接下来只能输入小数点
            let arr = content.split('.');
            console.log(arr);
            if (arr.length < 2) { //如果没有小数位的情况下
              if (arr[0].length < 5) { //小数点前的数字在5位以内
                let str = content; //开始输入的3位（包括3位）以内的数
                str += keys;
                if (Number(str) > this.data.maxAmount) {
                  wx.showModal({
                    title: '错误',
                    content: '输入最大金额不能超过' + this.data.maxAmount
                  });
                  return;
                } else {
                  content += keys;
                }
              } else {
                wx.showModal({
                  title: '错误',
                  content: '输入最大金额不能超过' + this.data.maxAmount
                });
              }
            } else { //如果有小数位
              let str = content;
              str += keys;
              if (Number(str) > this.data.maxAmount) {
                wx.showModal({
                  title: '错误',
                  content: '输入最大金额不能超过' + this.data.maxAmount
                });
                return;
              } else {
                content += keys;
              }
            }
          }

        }
        break;
    }
    this.setData({
      amount: content
    });
  },

  toResult() {
    if (this.data.amount != '' && this.data.amount != '请输入付款金额' && this.data.amount != 0) {

      if (this.data.seledAccount) {//如果用户勾选了余额支付
        //此处判断余额付款和组合付款的情况 余额付款直接跳转到结果页面 组合支付还要到当前页的另一层
        if (Number(this.amount) > this.balance) {//如果输入金额比用户余额多
          this.dAmount = Number(this.amount).toFixed(2);//保存一个接口传入需要用的amount
          this.amount = Number(Number(this.amount) - this.balance).toFixed(2);
          this.getPayment(this.dAmount);
          this.showBalanceWrap = false;
          this.showFocus = false;
          this.showSelectCard = true;
        } else {//如果用户余额充足，可以执行余额支付
          this.accountpaystatus = true;
          let orderObj = {};
          this.paytype ? orderObj.choosenType = this.paytype : orderObj;
          orderObj.orderPay = Number(this.amount);
          orderObj.pay = Number(this.amount);
          this.accountPay(orderObj);
        }
      } else {
        //如果没有勾选 
        this.setData({
          amount: Number(this.data.amount).toFixed(2),
          dAmount: Number(this.data.amount).toFixed(2)
        });
        this.getPayment(this.data.dAmount);
        this.setData({
          showBalanceWrap: false,
          showFocus: false,
          showSelectCard: true
        });
      }
    }
  },

  getPayment(orderPay) {
    service.getPayment({
      storeId: '1',
      orderPay: orderPay
    }).subscribe({
      next: res => {
        console.log('----------余额以及卡列表数据等----------');
        console.log(res);
        if (res.data.errorCode == "0") {
          //支付类型不再依赖于返回 如果 this.cardList长度>0则默认 recommend 没有选择余额时为 thirdpay
          this.setData({
            cardList : res.data.data.recommendCards
          });
          if (this.data.cardList.length > 0) {
            //$$('recommend').value 是否优先储值支付 1是储值 0是只有余额
            if (this.data.recommend == '1') {
              this.setData({
                paytype: 'recommend'
              });
              // this.changeSelectCard(this.cardList[0], 0);
            } else {
              if (this.data.seledAccount) {//如果选择余额支付
                //组合支付情况
                this.setData({
                  paytype : 'account'
                })
              } else {
                this.setData({
                  paytype: 'thirdpay'
                })
              }
              this.setData({
                selectCardId: this.data.cardList[0].prepayRuleId,
                selectCardPay: Number(this.data.cardList[0].pay).toFixed(2),
                givingMoney: this.data.cardList[0].givingMoney,
                discount: this.data.cardList[0].discount,
                selectedSlideIndex: 0
              })
            }
          } else {
            if (this.seledAccount) {//如果选择余额支付
              //组合支付情况
              this.setData({
                paytype: 'account'
              })
            } else {
              this.setData({
                paytype: 'thirdpay'
              })
            }
          }
          console.log('paytype: ' + this.data.paytype);
          console.log('accountFlag: ' + this.data.accountFlag);
        } else {
          alert('系统错误：' + res.data.errorCode);
        }
      }
    });

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