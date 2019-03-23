Page({
    data: {
        nickName: '微信名字',
        avatar: '',
        phoneNum: '',
    },
    toPage: function(e) {
        var page = e.currentTarget.dataset.page;
        wx.navigateTo({ url: page });
    },
    onLoad: function() {
        wx.setNavigationBarTitle({ title: '邀新素材' });
    },
    callPhone: function() {
        wx.makePhoneCall({
            phoneNumber: '4000011139',
        });
    }
});