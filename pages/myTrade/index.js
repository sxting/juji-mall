import { errDialog, loading } from '../../utils/util'
import { constant } from '../../utils/constant';
import { service } from '../../service';
Page({
    data: {
        constant: {},
        tablist: ['收入', '支出'],
        curTabIndex: 0,
        isShowNodata1:false,
        isShowNodata2:false,
        inputlist:[{
            name:"收入名字",
            time:"2018-02-01",
            amount:"100"
        },{
            name:"收入名字",
            time:"2018-02-01",
            amount:"100"
        }],
        outputlist:[{
            name:"支出名字",
            time:"2018-02-01",
            amount:"100"
        },{
            name:"支出名字",
            time:"2018-02-01",
            amount:"100"
        }]
    },
    switchTab: function(e) {
        var thisIndex = e.currentTarget.dataset.index;
        this.setData({ curTabIndex: thisIndex });
    },
    getData: function() {
        // wx.showLoading({title:'加载中'});
        // service.payRecord().subscribe({
        //     next: res => {
        //       console.log('----------交易记录数据--------');
        //       console.log(res);
        //         this.setData({isShowNodata1:res.length==0})
        //         for (let i = 0; i < res.length; i++) {
        //             res[i].totalFee ? res[i].totalFee = res[i].totalFee.toFixed(2) : res[i].totalFee = '0.00';
        //         }
        //         this.setData({ consumeRecord: res });
        //     },
        //     error: err => errDialog(err),
        //     complete: () => wx.hideLoading()
        // });
    },
    onShow: function() {
        this.getData();
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '桔子明细' });

    }
})