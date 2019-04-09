// shared/component/item-kanjia/index.js
Component({
  properties: {
    productInfo: {
      type: Object,
      value: {}
    },
    btn: {
      type: Boolean,
      value: false
    }
  },

  data: {
    showAlert1: false,
    showAlert2: false,
    status: 'ing', //未开始 init，砍价中 ing，砍价失败 fail，砍价成功 success
    shared: false,
    self: true, //是否活动发起者
    help: false, //是否已帮砍
    hours: 23,
    minites: 20,
    seconds: 58,
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
