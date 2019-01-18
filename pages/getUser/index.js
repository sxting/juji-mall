import { errDialog, loading } from '../../utils/util'
import { constant } from '../../utils/constant';
import { service } from '../../service';
var app = getApp();
Page({
    data: {},
    getMyInfo: function(e) {
        var userInfo = e.detail.userInfo;
        console.log(userInfo)
        service.userUpdate({
        	mobile:"",
        	name:userInfo.nickName,
        	img:userInfo.avatarUrl,
        	sex:userInfo.gender,
        	city:userInfo.city
        }).subscribe({
            next: res => {
  	          wx.navigateBack({ delta: 1 });
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    }
});