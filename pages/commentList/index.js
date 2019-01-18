import {
  service
} from '../../service';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userinfo:{},
    merListComments: [],
    isShowFocusModal: true,
    focusBoxMaker: true,
    cardId: '',
    merchantId:'',
    page:1
  },
  //获取商户评价数据
  getComments:function(obj){
    //获取商户评价
    service.merListComments(obj).subscribe({
      next: res => {
        console.log('-------------按页码查询的评价-------------');
        console.log(res);
        res.forEach(function (item, index, arr) {
          item.pics.slice(0, 3).forEach(function (it, i, a) {
            item.pics[i] = 'https://upic.juniuo.com/file/picture/' + it + '/resize_200_0/mode_fill';
          })
        });
        this.setData({
          merListComments: res
        })
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
  //下拉刷新
  onPullDownRefresh() {
    console.log('-------------下拉刷新第一页评价-------------');
    this.setData({
      page: 1
    });
    let obj = {
      merchantId: this.data.merchantId,
      page: 1
    };
    this.getComments(obj);
  },
  //上拉加载
  onReachBottom() {
    console.log('-------------上拉加载接下来的评价-------------');
    let p = ++this.data.page;
    this.setData({
      page:p
    });
    let obj = {
      merchantId: this.data.merchantId,
      page:p
    };
    //获取商户评价
    service.merListComments(obj).subscribe({
      next: res => {
        console.log('-------------按页码查询的评价并连接到之前的评价-------------');
        console.log(res);
        res.forEach(function (item, index, arr) {
          item.pics.slice(0, 3).forEach(function (it, i, a) {
            item.pics[i] = 'https://upic.juniuo.com/file/picture/' + it + '/resize_200_0/mode_fill';
          })
        });
        this.setData({
          merListComments: this.data.merListComments.concat(res)
        })
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      userinfo: app.globalData.userInfo,
      merchantId: options.merchantId,
      cardId: options.cardId
    });
    wx.setNavigationBarTitle({
      title: '全部评价'
    });
    let obj = {
      merchantId: options.merchantId,
      page:1
    };
    this.getComments(obj);
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  toUserCircle: function(event) {
    wx.navigateTo({
      url: '/pages/myCircle/index?id=' + event.currentTarget.dataset.userid
    });
  },
  closeFocusModal: function() {
    this.setData({
      isShowFocusModal: true
    });
  },
  toCommentDetail: function(event) {
    console.log(event);
    let comid = event.currentTarget.dataset.comid;
    console.log(comid);
    wx.navigateTo({
      url: '/pages/commentDetail/index?id=' + comid
    });
  },
  //点赞
  toPraise: function(event) {
    // wx.showLoading({
    //   title: '请稍候',
    // });
    console.log(event);
    console.log(event.currentTarget.dataset.maker);
    let that = this;
    let commentId = event.currentTarget.dataset.comid;
    let status = event.currentTarget.dataset.status;
    status == 1 ? status = 0 : status = 1;
    service.praise({
      commentId: commentId,
      status: status
    }).subscribe({
      next: res => {
        console.log('-----------点赞返回结果---------');
        console.log(res);
        let arr = that.data.merListComments;
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].id == commentId) {
            arr[i].praise = status;
            let praiseCount = arr[i].praiseCount;

            if (status == 1) {
              arr[i].praiseCount = ++praiseCount;
            } else {
              arr[i].praiseCount = --praiseCount;
            }
          }
        }

        that.setData({
          merListComments: arr
        });
        console.log(that.data.merListComments);

        // wx.hideLoading();
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
  toCreateOrder: function(event) {
    console.log(event);
    if (event.currentTarget.dataset.cardtype == 1) {
      wx.navigateTo({
        url: '/pages/createOrder/index?cardid=' + this.data.cardId + '&id=' + this.data.merchantId
      });
    } else {
      wx.navigateTo({
        url: '/pages/setupOrder/index?cardid=' + this.data.cardId + '&id=' + this.data.merchantId
      });
    }
  },
  toAttent: function(event) {
    wx.showLoading({
      title: '关注中',
    });
    console.log(event);
    let id = '',
      attent = 0,
      index = 0,
      that = this,
      ftype;
    id = event.target.dataset.atuserid;
    event.target.dataset.attent != 1 ? attent = 1 : attent = 0;
    // index = event.target.dataset.index;
    ftype = event.target.dataset.ftype;
    console.log('ftype: ' + ftype);


    service.attent({
      attentionUserId: id,
      attent: attent
    }).subscribe({
      next: res => {
        console.log('-----------关注返回结果---------');
        console.log(res);
        let comListCopy = this.data.merListComments;

        for (let i = 0; i < comListCopy.length; i++) {
          if (ftype == 2) { //评论用户使用的卡的用户
            if (comListCopy[i].cardUserDto) {
              if (comListCopy[i].cardUserDto.id == id) {
                comListCopy[i].cardUserDto.attent = attent;
                //如果这个卡的人就是评论的这个人，userDto的关注状态也要改变，显示"已关注"按钮
                if (comListCopy[i].userDto.id == id) {
                  comListCopy[i].userDto.attent = attent;
                }
              }
            }
          } else { //关注评论者 
            if (comListCopy[i].userDto) {
              if (comListCopy[i].userDto.id == id) {
                comListCopy[i].userDto.attent = attent;
                //如果这个评论的人用的是自己的卡，cardUserDto的关注状态也要改变，显示“立即下单”按钮
                if (comListCopy[i].cardUserDto.id==id){
                  comListCopy[i].cardUserDto.attent = attent;
                }
              }
            }
          }
        }

        this.setData({
          merListComments: comListCopy
        });

        console.log(this.data.merListComments);
        if (attent === 1) {
          this.setData({
            isShowFocusModal: false,
            focusBoxMaker: true
          });
        } else {
          this.setData({
            isShowFocusModal: false,
            focusBoxMaker: false
          });
        }

        wx.hideLoading();

      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  }
})