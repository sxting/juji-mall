import { errDialog, loading } from '../../../utils/util'
import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { jugardenService } from '../shared/service.js'

Page({
  data: {
    settlementDetailData: {},//提现详情信息
    transferId: '',
    status: '',
    phone: '400-001-1139',
  },

  onLoad: function (options) {
    let self = this;
    this.setData({
      transferId: options.transferId ? options.transferId : ''
    })
    console.log(this.data.transferId);
    wx.setNavigationBarTitle({ title: '提现详情' });
    getSettlementDetail.call(self);//get提现详情信息
  },

  /**  拨打电话  **/
  onTelClick() {
    let self = this;
    wx.makePhoneCall({
      phoneNumber: self.data.phone
    })
  },

});

// 查看提现记录详情
function getSettlementDetail(){
  let self = this;
  let data = {
    transferId: this.data.transferId
  }
  jugardenService.getSettlementDetail(data).subscribe({
    next: res => {
      if (res) {
        self.setData({
          settlementDetailData: res
        })
      }
    },
    error: err => errDialog(err),
    complete: () => wx.hideToast()
  })
}

