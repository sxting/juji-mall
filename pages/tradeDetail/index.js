import { errDialog, loading } from '../../utils/util'
import { constant } from '../../utils/constant';
import { service } from '../../service';
Page({
    data: {
        tradeInfo:{}
    },
    getData: function() {
      service.listMerchants({}).subscribe({
          next: res => {
              this.setData({ tradeInfo: res });
          },
          error: err => errDialog(err),
          complete: () => wx.hideToast()
      });
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({title: '消费详情'});
        this.getData();
    }
})