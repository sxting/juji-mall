// shared/component/item-collage/index.js
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
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /****  到我的订单 ****/ 
    switchToMineOrderList(){

    }
  }
})
