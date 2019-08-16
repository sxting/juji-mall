import {service} from '../../service';
import {errDialog,loading,showAlert} from '../../utils/util'
import {constant} from '../../utils/constant';
Component({
    properties: {
        inviteCode: {
            type: String,
            value: ''
        }
    },
    data: {
        providerId:'',
        pageNo:1,
        productList: [],
        isShowNodata:false,

    },
    ready: function() {
        this.setData({providerId: wx.getStorageSync('providerId')});
        this.getData();
    },
    methods: {
        getData: function(status) {
            var obj = {
                providerId: this.data.providerId,
                sortField: 'IDX',
                sortOrder: 'ASC',
                pageNo: this.data.pageNo,
                pageSize: 50,
                longitude: wx.getStorageSync('curLongitude'),
                latitude: wx.getStorageSync('curLatitude'),
                isMember:0,
                openMember:1
            };
            service.getRecommendPage(obj).subscribe({
                next: res => {
                    this.setData({
                        productList: this.data.productList.concat(res.list),
                        isShowNodata: this.data.pageNo == 1 && res.list.length == 0
                    });
                },
                error: err => {
                    this.setData({isShowNodata:true});
                },
                complete: () => wx.hideToast()
            });
        },
        toComDetail: function(e) {
            var id = e.currentTarget.dataset.id;
            var storeid = e.currentTarget.dataset.storeid;
            wx.navigateTo({
                url: '/pages/comDetail/index?buyMember=1&id=' + id + '&storeid=' + storeid+'&inviteCode='+this.data.inviteCode
            });
        }
    }
});