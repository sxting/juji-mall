import { errDialog, loading } from '../../../utils/util'
import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { jugardenService } from '../shared/service.js'
var app = getApp();

Page({
  data: {
    recordlist: [],
    totalSettlementAmount: 0,
    pageNo: 1,
    pageSize: 10,
    isShowNodata: false,
    failSettlementAmount: 0,
    processingSettlementAmount: 0,
    successSettlementAmount: 0,
  },

  onLoad: function() {
    let self = this;
    wx.setNavigationBarTitle({ title: '提现明细' });
    getSettlementList.call(self);//get提现摘要列表
    getCardData.call(self);
  },

  // 到详情页面
  toPage: function (e) {
    wx.navigateTo({
      url: `/pages/jujiGarden/withdrawDetail/index?transferId=` + e.currentTarget.dataset.transferid 
    });
  },

});

// 提现摘要列表
function getSettlementList(){
  let self = this;
  let data = {
    pageNo: this.data.pageNo,
    pageSize: this.data.pageSize
  }
  jugardenService.getSettlementList(data).subscribe({
    next: res => {
      if (res) {
        console.log(res);
        res.forEach(function(item){
          switch (item.status) {
            case 'PENDING':
              item.statusText = '待分账'; break;
            case 'REFUNDING':
              item.statusText = '退款中'; break;
            case 'REFUNDED':
              item.statusText = '已退款'; break;
            case 'ACCEPTED':
              item.statusText = '受理成功'; break;
            case 'PROCESSING':
              item.statusText = '处理中'; break;
            case 'FINISHED':
              item.statusText = '处理完成'; break;
            case 'CLOSED':
              item.statusText = '已关闭'; break;
            case 'SUCCESS':
              item.statusText = '分账成功'; break;
            case 'UNFREEZE':
              item.statusText = '释放冻结资金'; break;
            case 'ADJUST':
              item.statusText = '分账失败'; break;
            case 'RETURNED':
              item.statusText = '已转回分账方';  
          }
        })
        self.setData({
          recordlist: res? res : []
        });
        self.setData({isShowNodata:this.data.recordlist.length==0});
      }
    },
    error: err => errDialog(err),
    complete: () => wx.hideToast()
  })
}


// 卡面数据
function getCardData(){
  let self = this;
  jugardenService.transferIndex().subscribe({
    next: res => {
      if (res) {
        console.log(res);
        let totalSettlementAmount = 0;
        totalSettlementAmount = (res.failSettlementAmount + res.processingSettlementAmount + res.successSettlementAmount)/100;
        self.setData({
          failSettlementAmount: res.failSettlementAmount/100,
          processingSettlementAmount: res.processingSettlementAmount/100,
          successSettlementAmount: res.successSettlementAmount/100,
          totalSettlementAmount: totalSettlementAmount
        })
      }
    },
    error: err => errDialog(err),
    complete: () => wx.hideToast()
  })
}


