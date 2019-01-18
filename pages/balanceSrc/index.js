Page({
    data: {
        cardType: 0,
        balanceSrcArr: []
    },
    toHisCircle: function(e) {
        wx.navigateTo({
            url: '/pages/myCircle/index?id=' + e.currentTarget.dataset.id
        });
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '余额来源' });
        var balanceSrcArr = JSON.parse(wx.getStorageSync('balanceSrcArr'));
        this.setData({ balanceSrcArr: balanceSrcArr });
        this.setData({ cardType: options.type });
    }
});