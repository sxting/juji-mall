import { errDialog, loading, showAlert } from '../../../utils/util'
import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { jugardenService } from '../shared/service.js'
var app = getApp();
var timeVal;

Page({
    data: {
        nvabarData: { showCapsule: 0, title: '桔 园', isIndex: 1 },
        topValue: 0,
        juminNumList: [], //队员人数
        hadNumber: 0,
        storeId: '',
        openId: '', //邀请者id
        role: '', //桔园角色
        isAuthed: false, //是否实名认证
        todaySaleRebate: 0, //今日销售收入
        todaySettlementAmount: 0, //今日提现 
        totalSettlementAmount: 0, //累计提现
        invitedLeaderCount: 0,
        invitedMemberCount: 0,
        wechatId: '', //微信号码
        phone: '',
        applyLeader: '-1', //是否申请桔长
        isClickApply: false,
        switchFun: false,
        minInvitedMemberCount: 0, //邀请几个人就可以成为桔长
        bindPhoneNumber: false, //是否绑定手机号码 是true 不是false
        isDisabled: false, //按钮是否禁用
        age: '', //年龄
        city: '', //城市
        experience: '', //相关经验
        genderArr: [{ value: 1, name: '男' }, { value: 2, name: '女' }],
        gender: '', //性别
        name: '', //姓名
        profession: '', //职业
        selfInviteCode: '', //自己的邀请码 
        genderFlag: false,
        cityFlag: false,
        cityArr: [{ label: '郑州' }, { label: '呼和浩特' }, { label: '其它' }],
        experienceArr: [{ value: '无相关经验' }, { value: '微商' }, { value: '社交电商' }, { value: '其它' }],
        fansCountArr:[{value:'0-100'},{value:'100-500'},{value:'500-2000'},{value:'2000以上'}],
        fansCount:'',
        applyStatus: '-2', //替换allowDistribute的判断条件，申请状态，-1未通过，0审核中，1审核通过
        conHeight: 400,
        isClickApply: false
    },
    onLoad: function(options) {
        wx.getSystemInfo({
            success: (res) => {
                var conHeight = res.windowHeight - app.globalData.barHeight - 45;
                this.setData({ conHeight: conHeight })
            }
        });
        if (options.openid) {
            console.log('分享点进来');
            this.setData({
                openId: options.openid,
                switchFun: true
            });
            this.getUserInfor();
        } else {
            this.getUserInfor(); //用户信息，是否绑定手机号码
        }
    },
    onShow: function() {
        this.setData({
            genderArr: [{ value: 1, name: '男' }, { value: 2, name: '女' }]
        });
        if(wx.getStorageSync('inputData')){
            console.log("录入后保存的数据重新展现");
            var obj = JSON.parse(wx.getStorageSync('inputData'));
            this.setData(obj);
        }
        let self = this;
        if (wx.getStorageSync('token')) { //token存在
            getGardenInfor.call(self); //get首页信息,获取分销角色
        } else { //token不存在 登陆
            return;
        }
    },
    onHide:function(){
        console.log("保存录入的数据");
        this.saveInputData();
    },
    /**申请成为桔长  **/
    clickApply: function(e) {
        this.setData({
            isClickApply: true
        });
    },
    /**   跳转页面  ***/
    toPage: function(e) {
        let role = e.currentTarget.dataset.role ? e.currentTarget.dataset.role : '';
        let page = role ? e.currentTarget.dataset.page + '?role=' + role : e.currentTarget.dataset.page;
        wx.navigateTo({ url: page });
    },
    /*** 用户分享  ***/
    onShareAppMessage: function() {
        return {
            title: '我在桔集免费吃喝玩乐还能赚钱，邀你组队一起赚钱！',
            path: 'pages/login/index?pagetype=2&openid=' + wx.getStorageSync('openid') + '&invitecode=' + wx.getStorageSync('inviteCode'),
            imageUrl: '/images/banner-invent.png'
        }
    },
    // ----保存用户输入的数据----
    saveInputData:function(){
        var dataInfo = {
            name: this.data.name,
            wechatId: this.data.wechatId,
            age: this.data.age,
            city: this.data.city,
            profession: this.data.profession,
            experience: this.data.experience,
            gender: this.data.gender,
            fansCount:this.data.fansCount
        };
        wx.setStorageSync('inputData',JSON.stringify(dataInfo));
    },

    // 绑定微信号及姓名
    submitUserInfor:function() {
        let reg = /[\u4e00-\u9fa5]/;
        if (!this.data.name) {
            showAlert('请填写您的实名认证姓名');return;
        }
        if (!reg.test(this.data.name)) {
            showAlert('请填写中文姓名');return;
        }
        if (!this.data.wechatId) {
            showAlert('请填写您的微信号');return;
        }
        if (!this.data.gender) {
            showAlert('请选择您的性别');return;
        }
        if (!this.data.age) {
            showAlert('请填写您的年龄');return;
        }
        if (!this.data.city) {
            showAlert('请选择您的城市');return;
        }
        if (!this.data.profession) {
            showAlert('请填写您的职业');return;
        }
        if (!this.data.experience) {
            showAlert('请选择您的相关经验');return;
        }
        if (!this.data.fansCount){
            showAlert('请选择粉丝数量');return;
        }
        wx.showToast({ title: '提交中', icon: 'loading', duration: 10000,mask: true});
        jugardenService.joinDistributor({
            name: this.data.name,
            wechatId: this.data.wechatId,
            age: this.data.age,
            city: this.data.city,
            profession: this.data.profession,
            experience: this.data.experience,
            gender: this.data.gender,
            inviteCode: this.data.selfInviteCode,
            fansCount:this.data.fansCount,
            parentId: '',
        }).subscribe({
            next: res => {
                if (res) {
                    wx.hideToast();
                    this.setData({
                        applyStatus: 0,
                        applyLeader: 1
                    });
                }
            },
            error: err => {
                wx.hideToast();
                errDialog(err);
            },
            complete: () => {
                wx.hideToast();
            }
        });
    },

    // 获取用户信息 
    getUserInfor: function() {
        let self = this;
        service.userInfo({ openId: wx.getStorageSync('openid') }).subscribe({
            next: res => {
                this.setData({
                    phone: res.phone,
                    bindPhoneNumber: res.phone ? true : false
                });
                getGardenInfor.call(self); //get用户信息身份
                console.log(this.data.bindPhoneNumber);
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },
    radioChange: function(e) {
        console.log("性别=" + e.detail.value);
        this.setData({ gender: e.detail.value });
    },
    // 授权手机号码
    getUserPhoneNumber: function(e) {
        let self = this;
        let data = { encryptData: e.detail.encryptedData, iv: e.detail.iv }
        service.decodeUserPhone(data).subscribe({
            next: res => {
                this.setData({
                    phone: res.phoneNumber,
                });
                console.log(this.data.phone);
                bindPhone.call(self); //授权以后绑定手机号码
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },
    bindnameinput: function(e) {
        console.log(e.detail.value);
        this.setData({
            name: e.detail.value
        })
    },
    bindwechatIdinput: function(e) {
        console.log(e.detail.value);
        this.setData({
            wechatId: e.detail.value
        })
    },
    bindageinput: function(e) {
        console.log(e.detail.value);
        this.setData({
            age: e.detail.value
        })
    },
    bindcityinput: function(e) {
        console.log(e.detail.value);
        this.setData({
            city: e.detail.value
        })
    },
    bindprofessioninput: function(e) {
        console.log(e.detail.value);
        this.setData({
            profession: e.detail.value
        })
    },
    experiencePickerChange: function(e) {
        this.setData({
            experience: this.data.experienceArr[e.detail.value].value
        });
    },
    bindselfInviteCodeinput: function(e) {
        console.log(e.detail.value);
        this.setData({
            selfInviteCode: e.detail.value
        })
    },
    cityPickerChange: function(e) {
        this.setData({
            city: this.data.cityArr[e.detail.value].label
        });
    },
    fansCountPickerChange:function(e){
        this.setData({
            fansCount: this.data.fansCountArr[e.detail.value].value
        });
    }
});

// 绑定手机号码
function bindPhone() {
    let self = this;
    let data = { phone: this.data.phone }
    service.bindPhone(data).subscribe({
        next: res => {
            wx.showToast({
                title: "绑定成功",
                icon: "success",
            });
            this.setData({
                bindPhoneNumber: true,
                applyLeader: 1
            });
            let data = {
                parentId: this.data.openId,
                applyLeader: this.data.applyLeader
            }
            joinDistributor.call(self, data); //加入桔园
        },
        error: err => console.log(err),
        complete: () => wx.hideToast()
    })
}

// 首页信息获取 
function getGardenInfor() {
    let self = this;
    jugardenService.getGardenHomeInfor().subscribe({
        next: res => {
            if (res) {
                console.log(res);
                console.log('进入查询用户信息拉');
                if (res.role == 'MEMBER') { // 1、邀请进来的是桔民 return 2、邀请进来的是其他的 加入桔园 applyLeader=false;
                    this.data.juminNumList = [];
                    this.data.hadNumber = parseInt(res.invitedLeaderCount) + parseInt(res.invitedMemberCount);
                } else if (res.role == 'UNDEFINED' && this.data.switchFun) {
                    self.setData({ applyLeader: false })
                    let data = {
                        parentId: this.data.openId,
                        applyLeader: this.data.applyLeader
                    }
                    joinDistributor.call(self, data);
                } else if ((res.role == 'LEADER' || res.role == 'MEMBER') && this.data.switchFun) { //邀请者是桔长或者桔民
                    let data = {
                        parentId: this.data.openId,
                        applyLeader: res.applyLeader
                    }
                    joinDistributor.call(self, data);
                }
                if (res.role == 'LEADER' && res.hasReceiver) { //动态设置title背景色 是桔长并已经认证
                    wx.setNavigationBarColor({
                        frontColor: '#000000', // 必写项
                        backgroundColor: '#FFDC00', // 必写项
                    })
                }
                this.setData({
                    age: res.age==0?'':res.age, //年龄
                    city: res.city, //城市
                    experience: res.experience, //相关经验
                    gender: res.gender, //性别
                    name: res.name, //姓名
                    profession: res.profession, //职业
                    selfInviteCode: res.selfInviteCode, //自己的邀请码 
                    wechatId: res.wechatId, //微信号
                    role: res.role,
                    applyStatus: res.applyStatus, // 替换allowDistribute的判断条件，申请状态，-1未通过，0审核中，1审核通过 
                    juminNumList: this.data.juminNumList,
                    hadNumber: this.data.hadNumber,
                    todaySaleRebate: res.todaySaleRebate ? res.todaySaleRebate : 0,
                    todaySettlementAmount: res.todaySettlementAmount ? res.todaySettlementAmount : 0,
                    totalSettlementAmount: res.totalSettlementAmount ? res.totalSettlementAmount : 0,
                    invitedLeaderCount: res.invitedLeaderCount ? res.invitedLeaderCount : 0,
                    invitedMemberCount: res.invitedMemberCount ? res.invitedMemberCount : 0,
                    isAuthed: res.hasReceiver == true ? true : false,
                    applyLeader: res.applyLeader ? 1 : 0,
                    minInvitedMemberCount: res.minInvitedMemberCount
                })
            }
        },
        error: err => console.log(err),
        complete: () => wx.hideToast()
    })
}

// 加入分销 成为桔民
function joinDistributor(data) {
    let self = this;
    jugardenService.joinDistributor(data).subscribe({
        next: res => {
            if (res) {
                if (res.role == 'MEMBER' || res.role == 'UNDEFINED') { //桔民
                    this.data.juminNumList = [];
                    this.data.hadNumber = parseInt(res.invitedLeaderCount) + parseInt(res.invitedMemberCount);
                    if (this.data.hadNumber > 0) {
                        for (let i = 0; i < this.data.hadNumber; i++) {
                            let list = 'yes';
                            this.data.juminNumList.push(list);
                        }
                        for (let j = 0; j < (res.minInvitedMemberCount - parseInt(this.data.hadNumber)); j++) {
                            this.data.juminNumList.push('');
                        }
                    } else {
                        for (let j = 0; j < res.minInvitedMemberCount; j++) {
                            this.data.juminNumList.push('');
                        }
                    }
                }
                this.setData({
                    role: res.role,
                    juminNumList: this.data.juminNumList,
                    hadNumber: this.data.hadNumber,
                    applyLeader: res.applyLeader,
                    isAuthed: res.hasReceiver == true ? true : false,
                    minInvitedMemberCount: res.minInvitedMemberCount
                })
            }
        },
        error: err => console.log(err),
        complete: () => wx.hideToast()
    })
}