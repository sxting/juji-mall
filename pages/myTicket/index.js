import { errDialog, loading } from '../../utils/util'
import { constant } from '../../utils/constant';
import { service } from '../../service';
var app = getApp();
Page({
    data: {
        tablist: ['银票规则', '银票明细'],
        coinInfo: {},
        curTabIndex: 0,
        coinRuleList: [],
        coinRecordList: [],
        isShowNodata: 0,
      isShow: true
  },
  onShow: function () {
    this.getData();
  },
    switchTab: function(event) {
        var thisIndex = event.currentTarget.dataset['index'];
        this.setData({ curTabIndex: thisIndex });
    },
    getData: function() {
        service.coinIndex().subscribe({
            next: res => {
                this.setData({ coinInfo: res });
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
        service.listRecords().subscribe({
            next: res => {
                this.setData({ coinRecordList: res});
                if(this.data.coinRecordList.length==0){
                    this.setData({isShowNodata: 1 });
                }
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    getRule: function() {
        service.listRules().subscribe({
            next: res => {
                this.setData({ coinRuleList: res })
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    sign: function() {
        service.signIn({}).subscribe({
            next: res => {
                this.getData();
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    // onShow:function(){
    //     this.getData();
    // },
    showGetphone: function() {
        this.setData({ isShow: false });
    },
    changeUserStatus: function() {
        console.log('手机号已经获取了～～～');
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '我的银票' });
        this.getRule();
    }
})