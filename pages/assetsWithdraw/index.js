Page({
  data: {
      balance:0.00,
      withdrawBalance: 0.00
  },
  withDraw: function() {

  },
  onLoad: function(options) {
      wx.setNavigationBarTitle({ title: '账户提现', });
  },
});