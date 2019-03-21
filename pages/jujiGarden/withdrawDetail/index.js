import { errDialog, loading } from '../../../utils/util'
import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { jugardenService } from '../shared/service.js'

Page({
  data: {
    settlementDetailData: {},//提现详情信息
    digestId: '',
    status: '',
    phone: '15210921650',
  },

  onLoad: function (options) {
    let self = this;
    this.setData({
      digestId: options.digestId ? options.digestId : ''
    })
    console.log(this.data.digestId);
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
    digestId: this.data.digestId
  }
  jugardenService.getSettlementDetail(data).subscribe({
    next: res => {
      if (res) {
        self.setData({
          settlementDetailData: res,
        })
      }
    },
    error: err => errDialog(err),
    complete: () => wx.hideToast()
  })
}

