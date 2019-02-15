import { errDialog, loading} from '../../utils/util'
import { service } from '../../service';
import { constant } from '../../utils/constant';
var app = getApp();
Page({
    data: {
        phone: "",
        timer: null,
        showTime: false,
        isHavePhone:false,
        count: 60,
        authCode: "",
        indexReady:false
    },
    dataChange1: function(e) {
        this.data.phone = e.detail.value;
        this.setData({isHavePhone:this.data.phone!=""&&this.data.phone.length==11});
        if(this.data.phone!=""&&this.data.authCode!=""){
            this.setData({indexReady:true});
        }else{
            this.setData({indexReady:false});
        }
    },
    dataChange2: function(e) {
        this.data.authCode = e.detail.value;
        if(this.data.phone!=""&&this.data.authCode!=""){
            this.setData({indexReady:true});
        }else{
            this.setData({indexReady:false});
        }
    },
    getCode: function() {
        var phone = this.data.phone;
        var reg = /^1[3456789]\d{9}$/;
        if (phone == "") {
            this.showAlert("手机号不能为空！");
            return;
        }
        if (!reg.test(phone)) {
            this.showAlert("手机格式不正确！");
            return;
        }
        service.getAuthCode({phone:this.data.phone}).subscribe({ 
            next: res => {
                this.showRestTime();
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    bindPhone:function(){
        var phone = this.data.phone;
        var authCode = this.data.authCode;
        var reg = /^1[3456789]\d{9}$/;
        if (phone == "") {
            this.showAlert("手机号不能为空！");
            return;
        }
        if (!reg.test(phone)) {
            this.showAlert("手机格式不正确！");
            return;
        }
        if (authCode == "") {
            this.showAlert("验证码不能为空！");
            return;
        }
        var obj = {phone:phone,authCode:authCode}
        service.bindPhone(obj).subscribe({ 
            next: res => {
                wx.showToast({
                    title:"绑定成功",
                    icon:"success"
                });
                wx.navigateBack({ delta: 1 });
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    getUserPhoneNumber: function(e) {
        let data = {encryptData: e.detail.encryptedData,iv: e.detail.iv}
        service.decodeUserPhone(data).subscribe({
            next: res => {
                this.setData({phone: res.phoneNumber});
                this.setData({isHavePhone:this.data.phone!=""&&this.data.phone.length==11});
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    showRestTime: function() {
        var restTime = 60;
        if (!this.data.timer) {
            this.data.count = restTime;
            this.setData({ showTime: true });
            this.data.timer = setInterval(() => {
                if (this.data.count > 1 && this.data.count <= restTime) {
                    var curCount = this.data.count - 1;
                    this.setData({ count: curCount });
                } else {
                    this.setData({ showTime: false });
                    clearInterval(this.data.timer);
                    this.setData({ timer: null });
                }
            }, 1000);
        }
    },
    showAlert: function(str) {
        wx.showModal({
            title: '温馨提示',
            content: str,
            showCancel: false,
            confirmText: '确定',
            confirmColor: '#333'
        });
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '绑定手机号' });
        console.log(this.data.intextReady);
    }
});