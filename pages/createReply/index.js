import { errDialog, loading, delBlank } from '../../utils/util';
import { constant } from '../../utils/constant';
import { service } from '../../service';
var app = getApp();
Page({
    data: {
        orderId: '',
        content: '',
        imglist: [],
        pics: [],
        lastPage:"",
        isDisbaled: false
    },
    openActionSheet: function(e) {
        if (this.data.imglist.length >= 3) {
            this.showToast('最多只能上传三张图片');
            return;
        }
        wx.showActionSheet({
            itemList: ["从相册中选择", "拍照"],
            itemColor: "#333",
            success: (res) => {
                if (!res.cancel) {
                    if (res.tapIndex == 0) {
                        this.chooseWxImage("album");
                    } else if (res.tapIndex == 1) {
                        this.chooseWxImage("camera");
                    }
                }
            }
        });
    },
    dataChange: function(e) {
        this.data.content = e.detail.value;
    },
    submit: function() {
        if (delBlank(this.data.content) == "") {
            this.showToast("你还没填写任何评论呢~");return;
        }
        this.setData({ "isDisbaled": true });
        service.commentOrder({
            content: this.data.content,
            pics: this.data.pics,
            orderPayId: this.data.orderId
        }).subscribe({
            next: res => {
                this.showToast("评论成功！");
                setTimeout(() => {
                    console.log(this.data.lastPage);
                    if(this.data.lastPage=="trade"){
                        wx.navigateBack({ delta: 1 });
                    }else{
                        wx.navigateBack({ delta: 2 });
                    }
                }, 1800)
            },
            error: err => {
                this.setData({ "isDisbaled": false });
                this.showToast(err);
            },
            complete: () => wx.hideToast()
        })
    },
    chooseWxImage: function(type) {
        var number = 3 - this.data.imglist.length;//最多上传三张图片
        wx.chooseImage({
            count: number,
            sizeType: ["original", "compressed"],
            sourceType: [type],
            success: (res) => {
                var len1 = this.data.imglist.length;
                var len2 = res.tempFilePaths.length;
                for(var i in res.tempFilePaths){
                    this.upLoadImg(res.tempFilePaths[i],len1,len2);
                }
            }
        })
    },
    upLoadImg: function(url,len1,len2) {
        wx.showLoading({ title: '正在上传',mask:true});
        wx.uploadFile({
            url: constant.apiUrl + '/upload/image.json',
            filePath: url,
            name: 'multipartFile',
            header: {
                'Content-Type': 'multipart/form-data',
                'Access-Token': wx.getStorageSync('accessToken')
            },
            formData: {},
            success: (res) => {
                var resData = JSON.parse(res.data);
                if (resData.errorCode == '0') {
                    var thisImglist = this.data.imglist;
                    thisImglist.push(url);
                    var pics = this.data.pics;
                    pics.push(resData.data);
                    this.setData({ pics: pics, imglist: thisImglist });
                    if(this.data.imglist.length==len1+len2){
                        wx.hideLoading();
                    }
                } else {
                    this.showToast("上传图片失败")
                }
            },
            fail: (res) => {
                this.showToast("上传图片失败")
            },
            complete: () => {
                console.log("上传图片ok")
            }
        })
    },
    preReadImg: function(e) {
        var src = e.currentTarget.dataset.src; //获取data-src
        wx.previewImage({
            current: src,
            urls: [src]
        })
    },
    delThisImg: function(e) {
        var thisIndex = e.currentTarget.dataset['index'];
        var thisImglist = this.data.imglist;
        thisImglist.splice(thisIndex, 1);
        var pics = this.data.pics;
        pics.splice(thisIndex, 1);
        this.setData({ imglist: thisImglist, pics: pics });
    },
    onLoad: function(options) {
        new app.ToastPannel();
        wx.setNavigationBarTitle({ title: '发表评价' });
        this.setData({ orderId: options.orderId });
        if(options.page=='trade'){
            this.setData({lastPage:'trade'})
        }
    }
})