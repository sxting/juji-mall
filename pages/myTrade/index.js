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
      pageNo:1,
      pageSize:10,
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
        this.getData();
    },
    getData: function() {
        service.pointDetails({
          inOrOut: this.data.curTabIndex==0?'IN':'OUT',
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize
        }).subscribe({
            next: res => {
              console.log('----------交易记录数据--------');
              console.log(res);
              if (this.data.curTabIndex == 0){
                if(res.length==0){
                  this.setData({ isShowNodata1: true });
                }
              }else{
                if (res.length == 0) {
                  this.setData({ isShowNodata2: true });
                }
              }
              this.setData({ inputlist: res});
            },
            error: err => errDialog(err),
            complete: () => wx.hideLoading()
        });
    },
    onShow: function() {
        this.getData();
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '桔子明细' });

    }
})