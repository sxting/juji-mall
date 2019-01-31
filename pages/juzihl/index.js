import {
  service
} from '../../service';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recommendPage: [],
    sortIndex: 1,
    pageNo: 1,
    pageSize: 10,
    sortArray: ['', '', '', 'ASC', 'ASC', '']
  },
  toggleLabel: function(event) {
    let sortIndex = event.currentTarget.dataset['label'];
    console.log(sortIndex);
    if (sortIndex != 1 && sortIndex != 2 && sortIndex != 3 && sortIndex != 6) {
      if (this.data.sortIndex == sortIndex) { //两次相同 切换排序规则
        let arr = this.data.sortArray;
        console.log(arr);
        if (arr[Number(sortIndex) - 1] == 'ASC') {
          arr[Number(sortIndex) - 1] = 'DESC';
        } else {
          arr[Number(sortIndex) - 1] = 'ASC';
        }
        console.log(arr);
        this.setData({
          sortArray: arr
        });
      }
    }
    this.setData({
      sortIndex: sortIndex
    });
    console.log(this.data.sortIndex);
    let obj = {};
    switch (sortIndex) {
      case '1':
        obj = {
          providerId: '1215422531428605',
          type: 'PRODUCT',
          sortField: 'IDX',
          sortOrder: 'ASC',
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize,
          longitude: '116.470959',
          latitude: '39.992368'
        };
        break;
      case '2':
        obj = {
          providerId: '1215422531428605',
          type: 'PRODUCT',
          sortField: 'IDX',
          sortOrder: 'ASC',
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize,
          longitude: '116.470959',
          latitude: '39.992368'
        };
        break;
      case '3':
        obj = {
          providerId: '1215422531428605',
          type: 'PRODUCT',
          sortField: 'IDX',
          sortOrder: 'ASC',
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize,
          longitude: '116.470959',
          latitude: '39.992368'
        };
        break;
      case '4':
        obj = {
          providerId: '1215422531428605',
          type: 'PRODUCT',
          sortField: 'PRICE',
          sortOrder: this.data.sortArray[Number(sortIndex) - 1],
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize,
          longitude: '116.470959',
          latitude: '39.992368'
        };
        break;
      case '5':
        obj = {
          providerId: '1215422531428605',
          type: 'PRODUCT',
          sortField: 'DISTANCE',
          sortOrder: this.data.sortArray[Number(sortIndex) - 1],
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize,
          longitude: '116.470959',
          latitude: '39.992368'
        };
        break;
      case '6':
        obj = {
          providerId: '1215422531428605',
          type: 'PRODUCT',
          sortField: 'SOLDNUM',
          sortOrder: 'ASC',
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize,
          longitude: '116.470959',
          latitude: '39.992368'
        };
        break;
    }
    console.log(obj);
    this.getRecommendPage(obj);
  },
  getRecommendPage: function(obj) {
    console.log(obj);
    service.getRecommendPage(obj).subscribe({
      next: res => {
        console.log(res);
        this.setData({
          recommendPage: res.list
        });
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: ''
    });
    let obj = {
      providerId: '1215422531428605',
      type: 'PRODUCT',
      sortField: 'IDX',
      sortOrder: 'ASC',
      pageNo: this.pageNo,
      pageSize: this.pageSize,
      longitude: '116.470959',
      latitude: '39.992368'
    };
    this.getRecommendPage(obj);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})