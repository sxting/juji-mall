// shared/component/item-collage/index.js
import { componentService } from '../shared/service';


Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pintuanListInfor: {
      type: Array,
      value: ['','']
    },
    headPortraitList: {
      type: Array,
      value: ['', '']
    },
    fleg: {
      type: String,
      value: ''
    },
    collageInforData: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    collageInforData: [],//获取过来的数据
    headPortraitList: [],//拼团中 参团的头像
    pintuanListInfor: [],//正在参团的小伙伴
    portraitUrl: '/images/unkonw-icon.png',
  },

  ready: function () {
    let data = {
      activityId: "1554371555498621815687",
      activityName: "测试",
      product: {
        productId: "2c9172e2643c03180164403714cd0033",
        productName: "亲子游（夏令营）",
        inventory: 92,
        originalPrice: 100,
        activityPrice: 1,
        picIds: [

        ]
      },
      picUrls: [
        "l4cZ132RtVjY"
      ],
      peopleCount: 2,
      openedGroupCount: 7,
      applyStores: [
        {
          "storeId": "1530079118713392207393",
          "storeName": "亲子活动体验店-标准版",
          "storeAddress": "北京市昌平区龙泽园街道黄平路龙跃苑东5区",
          "storePhones": [
            "17600332672"
          ],
          "current": true
        }
      ],
      "activityNotes": [

      ],
      openedGroups: [
        {
          "groupId": "1554790810085206690976",
          "captain": "小M",
          "picUrl": "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83eqqX9BNBN7U1oYINk6ia7Q5qmLIl4aUCCiaWDiae53rAfAPJToeQEZb8xickiaJiau9KeuKyyOU4NQIVH5g/132",
          "totalPeopleCount": 2,
          "groupPeopleCount": 1,
          "expireTime": "2019-04-10 14:20:10"
        }
      ],
      "currentGroup": null
    };
    data.openedGroups.forEach(function(item){
      let picArr = [];
      item.resNum = (item.totalPeopleCount - item.groupPeopleCount) ? (item.totalPeopleCount - item.groupPeopleCount) : 0;
      picArr.push(item.picUrl);
      for (let i = 0; i < item.resNum; i++){
        picArr.push('');
      }
      item.picArr = picArr;
    })
    console.log(data.openedGroups);
    this.setData({
      pintuanListInfor: data.openedGroups
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /****  到我的订单 ****/ 
    switchToMineOrderList(){

    },

    /****  去参团 ****/
    onGoJoinCollageClick(e){

    }

  }
})

