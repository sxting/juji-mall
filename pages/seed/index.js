var util = require('../../utils/util.js');
import { constant } from '../../utils/constant';
import { errDialog, loading } from '../../utils/util';
import { service } from '../../service.js';

Page({
    data: {
        nvabarData: { showCapsule: 1, title: '种草'},
        tablist: [{ name: '攻略',index:0 }, { name: '附近',index:2 }],
        curTabIndex:0,
        providerId:'',
        productList1: [],
        productList2: [],
        productList3: [],
        isShowNodata: false,
        pageNo:1,
        ifBottom: false
    },
    switchTab: function(e) {
        var index = e.currentTarget.dataset.index;
        console.log(index);
        this.setData({curTabIndex:index});

        if(index==0){
            this.setData({
                isShowNodata:this.data.productList1.length==0
            });
        }
        if(index==1){
            this.setData({
                isShowNodata:this.data.productList2.length==0
            });
        }
    },
    onShow: function() {
        if(wx.getStorageSync('isEnterSeedDetail')==1){
            wx.setStorageSync('isEnterSeedDetail',0);
        }else{
            this.setData({productList1:[],productList2:[],productList3:[]});
            this.setData({providerId: wx.getStorageSync('providerId')});
            this.getData(); //获取列表
            this.getNearList();
        }
    },
    onReachBottom: function() {
        if(this.curTabIndex==3){
            if (!this.data.ifBottom) {
                this.setData({pageNo: this.data.pageNo + 1})
                this.getData();
            }
        }
    },
    getData: function() {
        var obj = {
            show:1,
            providerId: this.data.providerId,
            pageNo: this.data.pageNo,
            pageSize: 1000
        };
        service.tweets(obj).subscribe({
            next: res => {
                console.log("获取数据成功")
                console.log(res);
                if(res.length==1){
                    this.setData({productList1: this.data.productList1.concat(res[0].list)});
                    var tablist = [{ name: res[0].name,index:0 }, { name: '附近',index:2 }]
                    this.setData({tablist:tablist});
                }
                if(res.length==2){
                    this.setData({productList1: this.data.productList1.concat(res[0].list)});
                    this.setData({productList2: this.data.productList2.concat(res[1].list)})
                    var tablist = [{ name: res[0].name,index:0 },{ name: res[1].name,index:1 }, { name: '附近',index:2 }]
                    this.setData({tablist:tablist});
                }
                this.setData({
                    isShowNodata:this.data.productList1.length==0,
                });
            },
            error: err => {
                console.log("获取数据失败")
                this.setData({isShowNodata:true})
            },
            complete: () => wx.hideToast()
        });
    },
    getNearList: function() {
        console.log("附近的商品")
        var obj = {
            providerId: this.data.providerId,
            sortField: 'DISTANCE',
            sortOrder: 'ASC',
            pageNo: this.data.pageNo,
            pageSize: 10,
            longitude: wx.getStorageSync('curLongitude'),
            latitude: wx.getStorageSync('curLatitude')
        };
        service.getRecommendPage(obj).subscribe({
            next: res => {
                this.setData({
                    productList3: this.data.productList3.concat(res.list),
                    ifBottom:res.list.length==0
                });
            },
            error: err => {
                console.log(err);
            },
            complete: () => wx.hideToast()
        });
    },
    //跳转到详情
    toDetail: function(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/seedDetail/index?id=' + id
        });
    },
    toComDetail:function(e){
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/comDetail/index?source=seed&id=' + id
        });
    }
});