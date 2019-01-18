import { errDialog, loading } from '../../utils/util'
import { constant } from '../../utils/constant';
import { service } from '../../service';
Page({
    data: {
      recordList: [],
      isShowNodata: false
    },
    gerRecord: function() {
      service.walletRecord().subscribe({
          next: res => {
            if (res.length > 0) {
                this.setData({ recordList: res });
            } else {
                this.setData({ isShowNodata: true });
            }
          },
          error: err => errDialog(err),
          complete: () => wx.hideToast()
      })
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '账户记录' });
        this.gerRecord();
    }
})