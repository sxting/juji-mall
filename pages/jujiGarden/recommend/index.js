import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';

Page({
    data: {
        recommendlist: [{ imgIds: ['25R9F7zL2Dhr', '260HcKCwl672', '25SGzGlgKSrG', '25SGzGlgKSrG', '25Xi1X38wUK8', '25R9F7zL2Dhr'] }],
        picId: '25R9F7zL2Dhr',
        constant: constant,
        isShowNodata: false,
        curTabIndex: 1
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({
            title: '推广素材',
        });
    },

    switchTab: function(e) {
        this.setData({ curTabIndex: e.currentTarget.dataset.index });
    },

    /**生成图文**/
    showImageTextToShare: function() {
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
    /**分享给朋友**/
    shareToFriend: function() {

    },
    /**分享到朋友圈**/
    shareToWechatCircles: function() {

    },
    /**保存素材**/
    saveImagesToPhone: function(e) {
        var imgIds = e.currentTarget.dataset.imgs;
        var that = this;
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            that.saveFile(imgIds);
                        }
                    })
                } else {
                    that.saveFile(imgIds);
                }
            },
            fail() {
                console.log("getSetting: fail");
            }
        })
    },
    saveFile: function(imgIds) {
        var imgIndex = 0;
        for (var i = 0; i < imgIds.length; i++) {
            var imgId = imgIds[i];
            wx.downloadFile({
                url: constant.basePicUrl + imgIds[i] + '/resize_240_240/mode_fill',
                success: function(res) {
                    wx.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success: (res) => {
                            imgIndex++;
                            if (imgIndex == imgIds.length) {
                                wx.showToast({
                                    title: "已保存至相册",
                                    icon: "success"
                                });
                            }
                        },
                        fail: (res) => {
                            console.log(res);
                        }
                    });
                }
            });
        }
    }
})


// get推广素材list信息
function getProductListInfor() {
    let self = this;
    let data = {

    }
}