const app = getApp()
Component({

    properties: {
        navbarData: { //navbarData   由父页面传递的数据，变量名字自命名
            type: Object,
            value: {},
            observer: function(newVal, oldVal) {}
        }
    },

    data: {
        height: 20,
        //默认值  默认显示左上角
        navbarData: {
            showCapsule: 1,
            isIndex: 0
        },
        bgc: ''
    },

    ready: function() {
        let pages = getCurrentPages(); //当前页面栈
        if (pages.length == 1) {
            var title = this.data.navbarData.title;
            var isIndex = this.data.navbarData.isIndex;
            this.setData({
                navbarData: {
                    showCapsule: 0,
                    isIndex: isIndex,
                    title: title
                }
            });
        }

        if (this.data.navbarData.isIndex == 1) {
            this.setData({
                bgc: '#ffdc00'
            })
        } else if (this.data.navbarData.isIndex == 2) {
            this.setData({
                bgc: '#2F2D2E'
            })
            wx.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: '#2F2D2E',
            })
        }
    },

    attached: function() {
        // 获取是否是通过分享进入的小程序
        this.setData({
            share: app.globalData.share
        })
        // 定义导航栏的高度   方便对齐
        this.setData({
            height: app.globalData.barHeight
        })
    },

    methods: {
        goback() {
            wx.navigateBack()
        }
    }
})