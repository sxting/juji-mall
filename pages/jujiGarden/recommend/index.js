import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';


Page({
  data: {
    recommendlist: [{imgIds:['','','','','','']}],
    picId: '25R9F7zL2Dhr',
    constant: constant,
    isShowNodata: false,
    curTabIndex:1
  },
  onLoad: function(options) {
      wx.setNavigationBarTitle({
          title: '推广素材',
      });
  },

  switchTab: function (e) {
    this.setData({ curTabIndex: e.currentTarget.dataset.index });
  },

  /**
   * 生成图文
   */
  showImageTextToShare(){
    wx.showLoading({ title: '生成图片...' });
    wx.downloadFile({
      url: constant.basePicUrl + this.data.picId + '/resize_240_240/mode_fill',
      success: (res) => {
        if (res.statusCode === 200) {
         
        } else {
          wx.hideLoading();
        }
      }
    });
  },

  /**
   * 分享给朋友
   **/ 
  shareToFriend(){

   },

  /**
  * 分享到朋友圈
  **/
  shareToWechatCircles() {

  },

  /**
   * 保存素材
   **/
  saveImagesToPhone() {

  },

})


// get推广素材list信息
function getProductListInfor(){
  let self = this;
  let data = {

  }
}
