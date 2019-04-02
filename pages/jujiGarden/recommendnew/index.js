import { jugardenService } from '../shared/service';
import { service } from '../../../service.js';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
var app = getApp();
Page({
    data: {
        constant: constant,
        isShowModal: true,
        info: {
            imageIds: ['26PwRewDdJlf', '26PwRIQO2lz-']
        },
        descrtion:"寻找有想法的你，只要一部手机，随时随地即可赚钱，无忧零风险，赚钱又顾家的全新体验。反正都要玩手机，不如趁机赚点钱。加入桔集，带你燃烧心中的激情。",
        avatar: '',
        phoneNum: '',
        shareBg: "../../../images/sharenew.jpg"
    },
    toPage: function(e) {
        var page = e.currentTarget.dataset.page;
        wx.navigateTo({ url: page });
    },
    onLoad: function() {
        new app.ToastPannel();
        wx.setNavigationBarTitle({ title: '邀新素材' });
    },
    previewImage: function(event) {
        var src = event.currentTarget.dataset.src;
        wx.previewImage({
            current: src,
            urls: [src]
        })
    },
    closeModal: function() {
        this.setData({ isShowModal: true });
    },
    onShareAppMessage: function(res) {
        if (res.from === 'button') {
            this.closeModal();
            return {
                title: JSON.parse(wx.getStorageSync('userinfo')).nickName + '邀请您桔园结义成为桔长，购物返利最高可享40%商品返利',
                path: '/pages/jujiGarden/gardenIndex/index?openId=' + wx.getStorageSync('openid'),
                imageUrl: '/images/banner-invent.png',
            }
        }
    },
    createShare: function() {
        service.getQrCode({ productId: '', path: 'pages/jujiGarden/gardenIndex/index' }).subscribe({
            next: res => {
                var picId = res;
                wx.downloadFile({
                    url: constant.basePicUrl + picId + '/resize_200_200/mode_fill',
                    success: (obj) => {
                        if (obj.statusCode === 200) {
                            this.setData({ erwmImg: obj.tempFilePath });
                            this.drawImage();
                            this.setData({ isShowModal: false });
                        } else {
                            wx.hideLoading();
                        }
                    }
                });
            },
            error: err => {
                errDialog(err);
                wx.hideLoading();
            },
            complete: () => wx.hideToast()
        });
    },
    drawImage: function() {
        var size = { w: 250, h: 445 };
        var context = wx.createCanvasContext('myCanvas');
        context.drawImage(this.data.shareBg, 0, 0, size.w, size.h);
        context.drawImage(this.data.erwmImg, 82, 239, 85, 85);
        context.draw();
    },
    /**保存素材**/
    saveImagesToPhone: function(e) {
        var imageIds = e.currentTarget.dataset.imgs;
        var desc = e.currentTarget.dataset.desc;
        var that = this;
        wx.setClipboardData({
            data: desc,
            success: (res) => {
                wx.getSetting({
                    success(res) {
                        if (!res.authSetting['scope.writePhotosAlbum']) {
                            wx.authorize({
                                scope: 'scope.writePhotosAlbum',
                                success: (res) => {
                                    that.saveFile(imageIds);
                                }
                            })
                        } else {
                            that.saveFile(imageIds);
                        }
                    },
                    fail() {
                        console.log("getSetting: fail");
                    }
                });
            }
        });
    },
    saveFile: function(imageIds) {
        var imgIndex = 0;
        for (var i = 0; i < imageIds.length; i++) {
            var imgId = imageIds[i];
            wx.downloadFile({
                url: constant.basePicUrl + imageIds[i] + '/resize_0_0/mode_fill',
                success: (res)=> {
                    wx.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success: (res) => {
                            imgIndex++;
                            if (imgIndex == imageIds.length) {
                                this.showToast("图片已下载到微信相册，文案已复制到剪贴板")
                            }
                        },
                        fail: (res) => {
                            console.log(res);
                        }
                    });
                }
            });
        }
    },
    savePic: function(e) {
        var that = this;
        wx.canvasToTempFilePath({
            canvasId: 'myCanvas',
            success: function(res) {
                wx.getSetting({
                    success(rep) {
                        if (!rep.authSetting['scope.writePhotosAlbum']) {
                            wx.authorize({
                                scope: 'scope.writePhotosAlbum',
                                success() {
                                    that.saveAsPhoto(res.tempFilePath);
                                },
                                fail() {
                                    wx.openSetting({
                                        success: function() {
                                            console.log("openSetting: success");
                                        },
                                        fail: function() {
                                            console.log("openSetting: fail");
                                        }
                                    });
                                }
                            })
                        } else {
                            that.saveAsPhoto(res.tempFilePath);
                        }
                    },
                    fail() {
                        console.log("getSetting: fail");
                    }
                })
            },
            fail: function(res) {
                console.log(res);
            }
        });
    },
    saveAsPhoto: function(imgUrl, type) {
        wx.saveImageToPhotosAlbum({
            filePath: imgUrl,
            success: (res) => {
                this.closeModal();
                wx.showToast({
                    title: "已保存至相册",
                    icon: "success"
                });
            },
            fail: function(res) {
                console.log(res);
            }
        })
    }
});