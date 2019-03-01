// pages/jujipay/index.js
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
    maxAmount: 20000
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