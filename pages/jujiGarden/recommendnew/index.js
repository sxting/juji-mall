import { jugardenService } from '../shared/service';
import { service } from '../../../service.js';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
var app = getApp();
Page({
    data: {
        constant: constant,
        isShowModal: true,
        isTransparnet:false,
        info: {
            imageIds: ['26UbNB-58M47', '26UbOygiqt94','26UbP7AD8Iga']
        },
        descrtion:"寻找有想法的你，只要一部手机，随时随地即可赚钱，无忧零风险，赚钱又顾家的全新体验。反正都要玩手机，不如趁机赚点钱。加入桔集，带你燃烧心中的激情。",
        avatar: '',
        phoneNum: '',
        canvasBg: ['26UhHNQWSyCK','26UhIrTC2bmA','26UhIM5seDjR'],
        shareBg: "../../../images/sharenew.png"
    },
    toPage: function(e) {
        var page = e.currentTarget.dataset.page;
        wx.navigateTo({ url: page });
    },
    onLoad: function() {
        new app.ToastPannel();
        wx.hideShareMenu();
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
        this.setData({ isShowModal: true,isTransparnet:false });
    },
    onShareAppMessage: function(res) {
        if (res.from === 'button') {
            this.closeModal();
            return {
                title: JSON.parse(wx.getStorageSync('userinfo')).nickName + '邀请您桔园结义成为桔长，购物返利最高可享40%商品返利',
                path: '/pages/login/index?pagetype=2&openid=' + wx.getStorageSync('openid') + '&invitecode='+wx.getStorageSync('inviteCode'),
                imageUrl: '/images/banner-invent.png',
            }
        }
    },
    createShare: function() {
        wx.showLoading({title: '生成分享图片'});
        service.getQrCode({ productId: 'invitenew', path: 'pages/login/index' }).subscribe({
            next: res => {
                var picId = res;
                wx.downloadFile({
                    url: constant.basePicUrl + picId + '/resize_200_200/mode_fill',
                    success: (obj) => {
                        if (obj.statusCode === 200) {
                            this.setData({ erwmImg: obj.tempFilePath });
                            this.drawImage(this.data.shareBg);
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
    drawImage: function(imgBg) {
        var size = { w: 250, h: 445 };
        var context = wx.createCanvasContext('myCanvas');
        context.drawImage(imgBg, 0, 0, size.w, size.h);
        context.drawImage(this.data.erwmImg, 96, 255, 60, 60);
        this.setData({ isShowModal: false });
        context.draw(false,()=>{
            wx.hideLoading();
        });
    },
    /**保存素材**/
    saveMatrial:function(e){
        var that = this;
        wx.getSetting({
            success(rep) {
                if (!rep.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            that.saveImages(e);
                        }
                    })
                } else {
                    that.saveImages(e);
                }
            },
            fail() {
                console.log("getSetting: fail");
            }
        });
        var desc = e.currentTarget.dataset.desc;
        wx.setClipboardData({
            data: desc,
            success: (res) => {
            }
        });
    },
    saveImages: function(e) {
        wx.showLoading({title: '正在保存图片'});
        service.getQrCode({ productId: 'invitenew', path: 'pages/login/index' }).subscribe({
            next: res => {
                var picId = res;
                wx.downloadFile({
                    url: constant.basePicUrl + picId + '/resize_200_200/mode_fill',
                    success: (obj) => {
                        if (obj.statusCode === 200) {
                            this.setData({ erwmImg: obj.tempFilePath });
                            this.downloadFile(0);
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

    downloadFile:function(index){
        wx.downloadFile({
            url: constant.basePicUrl + this.data.canvasBg[index]+'/resize_750_1334/mode_fill',
            success: (res) => {
                if (res.statusCode === 200) {
                    console.log("下载完第"+(index+1)+"个背景");
                    var size = { w: 250, h: 445 };
                    var context = wx.createCanvasContext('myCanvas');
                    context.drawImage(res.tempFilePath, 0, 0, size.w, size.h);
                    if(index==0){
                        context.drawImage(this.data.erwmImg, 96, 300, 60, 60);
                    }
                    if(index==1){
                        context.drawImage(this.data.erwmImg, 96, 295, 60, 60);
                    }
                    if(index==2){
                        context.drawImage(this.data.erwmImg, 96, 255, 60, 60);
                    }
                    this.setData({ isTransparnet: true });
                    context.draw(false,()=>{
                        wx.canvasToTempFilePath({
                            canvasId: 'myCanvas',
                            success: (res)=> {
                                wx.saveImageToPhotosAlbum({
                                    filePath: res.tempFilePath,
                                    success: (res) => {
                                        this.closeModal();
                                        if(index==2){
                                            wx.hideLoading();
                                            this.showToast("图片已下载到微信相册，文案已复制到剪贴板");
                                            return;
                                        }
                                        var next = index+1;
                                        this.downloadFile(next);
                                    },
                                    fail: function(res) {
                                        console.log(res);
                                    }
                                })
                            },
                            fail: function(res) {
                                console.log(res);
                            }
                        });
                    });
                } else {
                    wx.hideLoading();
                }
            }
        });
    },
    saveCanvasImg:function(e){
        var that = this;
        wx.getSetting({
            success(rep) {
                if (!rep.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            that.savePic();
                        }
                    })
                } else {
                    that.savePic();
                }
            },
            fail() {
                console.log("getSetting: fail");
            }
        })
    },
    savePic: function() {
        wx.canvasToTempFilePath({
            canvasId: 'myCanvas',
            success: (res) => {
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
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
            },
            fail: function(res) {
                console.log(res);
            }
        });
    }
});


