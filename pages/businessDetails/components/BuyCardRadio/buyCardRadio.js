// pages/businessDetails/components/buyCardRadio/buyCardRadio.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    itemData: {
      type: Object,
      value: {}
    },
    num: {
      type: Number,
      value: 1
    },
    itemFlag: {
      type: Number,
      value: 0
    },
    itemid: {
      type: String,
      value: ''
    },
    checkedId: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    _buyCardsNumReduce: function() {
      let cnum = this.data.num;
      // console.log(cnum);
      if (cnum > 1) {
        this.setData({
          num: --cnum
        });
        let obj = {
          itemid: this.data.itemid,
          num: this.data.num
        }
        this.triggerEvent('changeBuyCardsNum', obj);
      }

    },
    _buyCardsNumPlus: function() {
      let cnum = this.data.num;
      // console.log(cnum);
      if (cnum < 999) {
        this.setData({
          num: ++cnum
        });
        let obj = {
          itemid: this.data.itemid,
          num: this.data.num
        }
        this.triggerEvent('changeBuyCardsNum', obj);
      }
    }
  }
})