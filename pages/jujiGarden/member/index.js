import {
    errDialog,
    loading,
    showAlert
} from '../../../utils/util'
import {
    service
} from '../../../service';
import {
    constant
} from '../../../utils/constant';
import {
    jugardenService
} from '../shared/service.js'
var app = getApp();
var timeVal;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        initialize: false,
        conHeight: 400,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

        console.log('options: ' + JSON.stringify(options))

        const updateManager = wx.getUpdateManager();
        updateManager.onUpdateReady(function() {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success(res) {
                    if (res.confirm) {
                        updateManager.applyUpdate()
                    }
                }
            })
        })

        var _this = this
        wx.getSystemInfo({
            success: (res) => {
                var conHeight = res.windowHeight - app.globalData.barHeight - 45;
                _this.setData({
                    conHeight: conHeight,
                    shareInviteCode: options.sceneid ? options.sceneid : ''
                })
            }
        });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.initialize()
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        this.setData({
            initialize: false
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        wx.stopPullDownRefresh()
        this.initialize()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        var _this = this
        var shareInfo = {
            title: '桔集：聚集优质好店，体验美好生活，加入成为会员吧！',
            imageUrl: '/images/member_share.jpg',
            path: '/pages/login/index?pagetype=7&sceneid=' + _this.data.selfInviteCode
        }
        console.log('shareInfo: ' + JSON.stringify(shareInfo))
        return shareInfo
    },

    /**
     * 绑定微信分账账号 - 输入微信号
     */
    inputWechatId: function(e) {
        var receiver = this.data.receiver
        if (!receiver) {
            receiver = {}
        }
        receiver.wechatId = e.detail.value
        this.setData({
            receiver: receiver
        })
    },

    /**
     * 绑定微信分账账号 - 输入微信实名认证姓名
     */
    inputWechatName: function(e) {
        var receiver = this.data.receiver
        if (!receiver) {
            receiver = {}
        }
        receiver.name = e.detail.value
        this.setData({
            receiver: receiver
        })
    },

    /**
     * 绑定微信分账账号 - 提交数据
     */
    submitWechatReceiver: function() {

        wx.showToast({
            icon: 'loading',
            duration: 100000,
            mask: true
        });

        var receiver = this.data.receiver
        var _this = this
        service.bindWechatId(receiver).subscribe({
            next: res => {
                wx.showToast({
                    title: "绑定成功",
                    duration: 1450,
                    icon: "success",
                });
                setTimeout(function () {
                    wx.hideToast()
                    _this.initialize()
                }, 1500)
            },
            error: err => {
                wx.hideToast()
                showAlert(err)
            }
        })
    },

    /**
     * 跳转页面
     */
    toPage: function (e) {
        let role = e.currentTarget.dataset.role ? e.currentTarget.dataset.role : '';
        let page = role ? e.currentTarget.dataset.page + '?role=' + role : e.currentTarget.dataset.page;
        wx.navigateTo({
            url: page
        });
    },

    /**
     * 跳转到我的用户
     */
    toPage2: function (e) {
        let role = e.currentTarget.dataset.role ? e.currentTarget.dataset.role : '';
        let page = role ? e.currentTarget.dataset.page + '?role=' + role : e.currentTarget.dataset.page;
        // 如果是桔长  跳转到h5页面
        if (this.data.allowDistribute) {
            wx.navigateTo({
                url: '/pages/jujiGarden/myUserH5/index'
            });
        } else {
            wx.navigateTo({
                url: page
            });
        }
    },

    /**
     * 初始化
     */
    initialize: function() {

        wx.showToast({
            icon: 'loading',
            duration: 100000,
            mask: true
        });

        var _this = this
        jugardenService.getGardenHomeInfor().subscribe({
            next: res => {

                var allowDistribute = 1 == res.user.allowDistribute

                var navbar = _this.navbar(res.title)
                
                var invitationText = res.user.invitationText
                if (0 == Object.keys(invitationText).length) {
                    invitationText = null
                }
                
                _this.setData({
                    selfInviteCode: res.selfInviteCode,
                    member: res.user.member,
                    allowDistribute: allowDistribute,
                    hasReceiver: res.hasReceiver,
                    navbar: navbar,
                    initialize: true,
                    totalSettlementAmount: res.totalSettlementAmount,
                    todaySaleRebate: res.todaySaleRebate,
                    todaySettlementAmount: res.todaySettlementAmount,
                    invitedPaidMemberCount: res.invitedPaidMemberCount,
                    invitedUnPaidPersonCount: res.invitedUnPaidPersonCount,
                    invitationText: invitationText
                })
                console.log()
            },
            error: err => {
                wx.hideToast()
                showAlert(err)
            },
            complete: () => wx.hideToast()
        })
    },

    navbar: function(title) {
        return {
            showCapsule: 0,
            title: title,
            isIndex: 1
        }
    }
})