import {
    errDialog,
    loading
} from '../../utils/util';
import {
    service
} from '../../service';
import {
    constant
} from '../../utils/constant';
var app = getApp();
Page({
    data: {
        nvabarData: {
            showCapsule: 0,
            title: '我 的',
            isIndex: 1
        },
        nickName: '***',
        avatar: '',
        phoneNum: '',
        bindPhone: "",
        conHeight: 400,
        topValue: 0,
        showJcModal: false,
        joinInfo: {
            phone: '17316191089',
            wechat: 'juji1031'
        },
        distributorRole: wx.getStorageSync('distributorRole'),
        member: wx.getStorageSync('member'),
        memberDays: wx.getStorageSync('memberDays'),
        memberExpireTime: wx.getStorageSync('memberExpireTime'),
        level: '白银',
        sceneId: '',
        inviteMemberCount: 0,
    },
    toJuzi: function() {
        wx.switchTab({
            url: '../juzi/index'
        });
    },
    toPage: function(e) {
        var page = e.currentTarget.dataset.page;
        console.log(page);
        wx.navigateTo({
            url: page
        });

    },
    toMemberTabBar() {
        if (this.data.member) {
            return;
        }
        wx.switchTab({
            url: '/pages/jujiGarden/gardenIndex/index',
        })
    },

    onLoad: function() {
        let levelStr = wx.getStorageSync('level'),
            level = '白银';
        if (levelStr === 'LOW') {
            level = '白银'
        } else if (levelStr = 'MID') {
            level = '黄金'
        } else if (levelStr = 'HIGH') {
            level = '钻石'
        }
        this.setData({
            level: level
        })
        wx.getSystemInfo({
            success: (res) => {
                var conHeight = res.windowHeight - app.globalData.barHeight - 45;
                this.setData({
                    conHeight: conHeight
                })
            }
        });
        this.getJoinInfo();
        this.getQrCode();
    },
    onShow: function() {
        this.getInfo();
    },
    onShareAppMessage: function(res) {
        console.log(this.data.sceneId);
        return {
            title: '桔集：聚集优质好店，体验美好生活，加入成为会员吧！',
            imageUrl: '/images/member_share.jpg',
            path: '/pages/login/index?pagetype=7&sceneid=' + this.data.sceneId + '&invitecode=' + wx.getStorageSync('inviteCode')
        }
    },
    showJoinModal: function() {
        this.setData({
            showJcModal: !this.data.showJcModal
        });
    },
    dialtoUs: function() {
        wx.makePhoneCall({
            phoneNumber: this.data.joinInfo.phone
        });
    },
    copyUs: function() {
        wx.setClipboardData({
            data: this.data.joinInfo.wechat,
            success: (res) => {
                wx.showToast({
                    title: '复制成功'
                });
            }
        });
    },
    getInfo: function() {
        service.userInfo({
            openId: wx.getStorageSync('openid')
        }).subscribe({
            next: res => {
                console.log(res)
                this.setData({
                    nickName: res.nickName,
                    phoneNum: res.phone,
                    avatar: res.avatar,
                    inviteMemberCount: res.inviteMemberCount,
                    member: res.member,
                    allowDistribute: res.allowDistribute == 1
                });
            },
            complete: () => wx.hideToast()
        })
    },
    bindPhone: function() {
        var bindPhone = this.data.bindPhone;
        service.bindPhone({
            phone: bindPhone
        }).subscribe({
            next: res => {
                wx.showToast({
                    title: "绑定成功",
                    icon: "success"
                });
                this.setData({
                    phoneNum: this.data.bindPhone
                });
            },
            error: err => {
                console.log(err)
            },
            complete: () => wx.hideToast()
        })
    },
    getUserPhoneNumber: function(e) {
        var errMsg = e.detail.errMsg;
        if (errMsg = 'getPhoneNumber:ok') {
            let data = {
                encryptData: e.detail.encryptedData,
                iv: e.detail.iv
            }
            service.decodeUserPhone(data).subscribe({
                next: res => {
                    this.setData({
                        bindPhone: res.phoneNumber
                    });
                    this.bindPhone();
                },
                error: err => {
                    console.log(err)
                },
                complete: () => wx.hideToast()
            })
        }
    },
    callPhone: function() {
        wx.makePhoneCall({
            phoneNumber: '4000011139',
        });
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.getInfo();
    },
    getJoinInfo: function(scene, type) {
        wx.request({
            url: 'https://juji.juniuo.com/data/wxappData.php',
            method: 'GET',
            header: {
                'content-type': 'application/json'
            },
            success: (res) => {
                this.setData({
                    joinInfo: res.data.data.contact,
                });
                wx.setStorageSync('shareType', res.data.data.shareType);
                if (type == 1) {
                    this.nextPage();
                }
            }
        });
    },

    getQrCode: function() {
        service.getProQrCode({
            productId: 'MEMBER_CARD',
            path: ''
        }).subscribe({
            next: res => {
                console.log(res);
                this.setData({
                    sceneId: res.senceId
                })
            },
            error: err => {
                errDialog(err);
                wx.hideLoading();
            },
            complete: () => wx.hideToast()
        });
    },
});