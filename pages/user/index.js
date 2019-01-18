import { errDialog, loading } from '../../utils/util';
import { constant } from '../../utils/constant';
import { service } from '../../service';
var app = getApp();
Page({
    data: {
        hasUserInfo: false,
        balance: 0.00,
        isShowNodata:false,
        userInfo: {},
        cardList: [],
        isShowModal: true
  },
    toCircle: function() {
        wx.navigateTo({url: '/pages/myCircle/index?id=' + this.data.userInfo.id})
    },
    toPath: function(e) {
        var targetUrl = e.currentTarget.dataset['page'];
        wx.navigateTo({ url: targetUrl })
    },
    useCard: function(e) {
        var id=e.currentTarget.dataset.id;
        var cardid=e.currentTarget.dataset.cardid;
        if(e.currentTarget.dataset.type==1){
          wx.navigateTo({url: '/pages/createOrder/index?id='+id+'&cardid='+cardid});
        }else{
          wx.navigateTo({url: '/pages/setupOrder/index?id='+id+'&cardid='+cardid});
        }
    },
    showModal: function() {
        this.setData({ isShowModal: false })
    },
    closeModal: function() {
        this.setData({ isShowModal: true })
    },
    toTicket: function() {
        wx.switchTab({ url: '../myTicket/index' });
    },
    getCardList: function() {
        service.listCardPackage().subscribe({
            next: res => {
                this.setData({cardList: res});
                this.setData({isShowNodata:this.data.cardList.length==0});
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    onShow: function() {
      console.log(app.globalData.userInfo);
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
        }else{
            this.setData({isShowNodata:true});
        }
        this.getMyInfo();
    },
    getMyInfo:function(){
        service.getMyInfo().subscribe({
            next: res => {
                if (res.name) {
                    app.globalData.userInfo = res;
                    this.setData({hasUserInfo: true});
                    this.getCardList();
                }
                this.setData({userInfo: res})
            }
        })
    },
    onLoad: function(options) {
        new app.ToastPannel();
        wx.setNavigationBarTitle({ title: '我的' });
    }
})