import {
  service
} from '../../service';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userinfo: {},
    commentInfo: {},
    commentId: '',
    replyvalue: '',
    isShowConfirmModal: true,
    confirmTitle: '',
    confirmContent: '',
    isShowFocusModal: true,
    focusBoxMaker: true,
    //所有图片的高度
    imgheights: [400, 400, 400],
    //默认
    current: 0,
    focusInputMaker: false //输入框获取焦点标记
  },
  toUserCircle:function(event){
    console.log(event.currentTarget.dataset.userid);
    wx.navigateTo({
      url: '/pages/myCircle/index?id=' + event.currentTarget.dataset.userid
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      userinfo: app.globalData.userInfo
    })
    wx.setNavigationBarTitle({
      title: '评价详情'
    });
    console.log(options);
    let that = this;
    this.setData({
      commentId: options.id
    });
    service.getComment({
      id: options.id
    }).subscribe({
      next: res => {
        console.log('--------评价详情obj---------');
        console.log(res);
        if (res.pics && res.pics.length > 0) {
          res.pics.forEach(function(it, i, a) {
            res.pics[i] = 'https://upic.juniuo.com/file/picture/' + it + '/resize_375_0/mode_fill';
          })
        }
        for (let j = 0; j < res.replys.length; j++) {
          res.replys[j].dateCreated = res.replys[j].dateCreated.substring(0, 10);
        }
        res.merchantDto.showPic = 'https://upic.juniuo.com/file/picture/' + res.merchantDto.showPic + '/resize_100_0/mode_fill';
        that.setData({
          commentInfo: res
        })

      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
  toBusinessDetails: function(event) {
    wx.navigateTo({
      url: '../businessDetails/index?cardType=' + event.currentTarget.dataset.cardtype + '&id=' + event.currentTarget.dataset.busid
    });
  },
  focusInput: function() {
    this.setData({
      focusInputMaker: true
    });
    console.log(this.data.focusInputMaker);
  },
  blurInput: function() {
    this.setData({
      focusInputMaker: false
    });
    console.log(this.data.focusInputMaker);
  },
  bindchange: function(e) {
    console.log(e.detail.current)
    this.setData({
      current: e.detail.current
    })
  },
  imageLoad: function(e) {
    console.log(e);
    let loadindex = e.target.dataset.loadindex;
    //获取图片真实宽度
    var imgwidth = e.detail.width,
      imgheight = e.detail.height,
      //宽高比
      ratio = imgwidth / imgheight;
    console.log(imgwidth, imgheight)
    //计算的高度值
    var viewHeight = 750 / ratio;
    var imgheight = viewHeight
    var imgheights = this.data.imgheights
    //把每一张图片的高度记录到数组里
    imgheights[loadindex] = imgheight;
    this.setData({
      imgheights: imgheights,
    })
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
    return {
      title: '[' + this.data.commentInfo.merchantDto.name + ']' + '正在享拼拼上特价优惠，快来参加吧！',
      path: '/pages/index/index?page=commentDetail&id=' + this.data.commentId + '&userId=' + app.globalData.userInfo.id
    }
  },
  tapWin: function() {
    console.log('点击了边框部分');
  },
  closeFocusModal: function() {
    this.setData({
      isShowFocusModal: true
    });
  },
  bindinput: function(event) {
    console.log(event.detail);
    this.setData({
      replyvalue: event.detail.value
    })
  },
  sendRespons: function() {
    wx.showLoading({
      title: '请稍候',
    });
    this.setData({
      focusInputMaker: false
    });
    let commentId = this.data.commentId;
    let content = this.data.replyvalue;
    let confirmTitle = '回复失败',
      confirmContent = '';
    //校验输入文本
    if (content.length < 1 || content.split(" ").join("").length === 0) {
      confirmContent = '回复评论字数不能为空';
      this.setData({
        confirmTitle: confirmTitle,
        confirmContent: confirmContent,
        isShowConfirmModal: false
      });
      return;
    } else if (content.length > 100) {
      confirmContent = '回复评论字数不能多于100个';
      this.setData({
        confirmTitle: confirmTitle,
        confirmContent: confirmContent,
        isShowConfirmModal: false
      });
      return;
    } else {
      let that = this;
      service.reply({
        commentId: commentId,
        content: content
      }).subscribe({
        next: res => {
          console.log(res);
          this.setData({
            replyvalue: ''
          });
          // that.setData({
          //   commentInfo: res
          // });
          that.refreshPage();
          wx.hideLoading();

        },
        error: err => {
          wx.showToast({
            title: err,
          })
        },
        complete: () => wx.hideToast()
      });
    }
  },
  //提交回复
  postreply: function(event) {
    wx.showLoading({
      title: '请稍候',
    });
    this.setData({
      focusInputMaker: false
    });
    console.log(event);
    let commentId = this.data.commentId;
    let content = event.detail.value;
    let confirmTitle = '回复失败',
      confirmContent = '';
    //校验输入文本
    if (content.length < 1 || content.split(" ").join("").length === 0) {
      confirmContent = '回复评论字数不能为空';
      this.setData({
        confirmTitle: confirmTitle,
        confirmContent: confirmContent,
        isShowConfirmModal: false
      });
      return;
    } else if (content.length > 100) {
      confirmContent = '回复评论字数不能多于100个';
      this.setData({
        confirmTitle: confirmTitle,
        confirmContent: confirmContent,
        isShowConfirmModal: false
      });
      return;
    } else {
      let that = this;
      service.reply({
        commentId: commentId,
        content: content
      }).subscribe({
        next: res => {
          console.log(res);
          this.setData({
            replyvalue: ''
          });
          that.refreshPage();

          wx.hideLoading();

        },
        error: err => {
          wx.showToast({
            title: err,
          })
        },
        complete: () => wx.hideToast()
      });
    }

  },
  //刷新页面数据
  refreshPage: function() {
    service.getComment({
      id: this.data.commentId
    }).subscribe({
      next: res => {
        console.log(res);
        if (res.pics && res.pics.length > 0) {
          res.pics.forEach(function(it, i, a) {
            res.pics[i] = 'https://upic.juniuo.com/file/picture/' + it + '/resize_375_0/mode_fill';
          })
        }
        for (let j = 0; j < res.replys.length; j++) {
          res.replys[j].dateCreated = res.replys[j].dateCreated.substring(0, 10);
        }
        res.merchantDto.showPic = 'https://upic.juniuo.com/file/picture/' + res.merchantDto.showPic + '/resize_100_0/mode_fill';
        this.setData({
          commentInfo: res
        })

      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
  //点赞
  toPraise: function(event) {
    // wx.showLoading({
    //   title: '请稍候',
    // });
    console.log(event);
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
        let obj = that.data.commentInfo;
        if (obj.id == commentId) {
          obj.praise = status;
          let praiseCount = obj.praiseCount;

          if (status == 1) {
            obj.praiseCount = ++praiseCount;
          } else {
            obj.praiseCount = --praiseCount;
          }
        }

        that.setData({
          commentInfo: obj
        });
        console.log(that.data.commentInfo);

        // wx.hideLoading();
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    });
  },
  //去关注
  toAttent: function(event) {
    wx.showLoading({
      title: '关注中',
    });
    console.log(event);
    let id = '',
      attent = 0,
      index = 0,
      that = this;
    id = event.target.dataset.atuserid;
    event.target.dataset.attent != 1 ? attent = 1 : attent = 0;

    service.attent({
      attentionUserId: id,
      attent: attent
    }).subscribe({
      next: res => {
        console.log('-----------关注返回结果---------');
        console.log(res);
        let obj = this.data.commentInfo;

        if (obj.userDto.id == id) {
          //也同时会关注他使用卡的人
          obj.userDto.attent = attent;
          // comListCopy[i].cardUserDto.attent = attent;
        }

        this.setData({
          commentInfo: obj
        });

        console.log(this.data.commentInfo);
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