Page({
    data: {
        tel: "",
        timer: null,
        showTime:false,
        count:60,
        pwd: ""
    },
    submit: function() {
        wx.navigateTo({ url: '../setting/index' });
    },
    dataChange1: function(e) {
        this.data.tel = e.detail.value;
    },
    dataChange2: function(e) {
        this.data.pwd = e.detail.value;
    },
    getCode: function() {
        var tel = this.data.tel;
        var reg = /^1[3456789]\d{9}$/;
        if (tel == "") {
            this.showAlert("手机号不能为空！");
            return;
        }
        if (!reg.test(tel)) {
            this.showAlert("手机格式不正确！");
            return;
        }
        this.showRestTime();
    },
    showRestTime: function() {
      var restTime = 60;
      if (!this.data.timer) {
          this.data.count = restTime;
          this.setData({showTime:true});
          this.data.timer = setInterval(() => {
            if (this.data.count > 1 && this.data.count <= restTime) {
                var curCount = this.data.count - 1;
                this.setData({count:curCount});
            } else {
                this.setData({showTime:false});
                clearInterval(this.data.timer);
                this.setData({timer:null});
            }
          }, 1000);
      }
    },
    showAlert: function(str) {
        wx.showModal({
            title: '提示',
            content: str,
            showCancel: false,
            confirmText: '确定',
            confirmColor: '#333'
        });
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '修改手机号' });
    }
});