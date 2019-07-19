import { errDialog, loading, showAlert } from '../../../utils/util'
import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { jugardenService } from '../shared/service.js'
var app = getApp();
var timeVal;

Page({
    data: {
        nvabarData: { showCapsule: 0, title: '会员', isIndex: 1 },
        topValue: 0,
        juminNumList: [], //队员人数
        hadNumber: 0,
        storeId: '',
        openId: '', //邀请者id
        role: '', //桔园角色
        isAuthed: false, //是否实名认证
        todaySaleRebate: 0, //今日销售收入
        todaySettlementAmount: 0, //今日提现 
        totalSettlementAmount: 0, //累计提现
        invitedLeaderCount: 0,
        invitedMemberCount: 0,
        wechatId: '', //微信号码
        phone: '',
        applyLeader: '-1', //是否申请桔长
        isClickApply: false,
        switchFun: false,
        minInvitedMemberCount: 0, //邀请几个人就可以成为桔长
        bindPhoneNumber: false, //是否绑定手机号码 是true 不是false
        isDisabled: false, //按钮是否禁用
        age: '', //年龄
        city: '', //城市
        experience: '', //相关经验
        genderArr: [{ value: 1, name: '男' }, { value: 2, name: '女' }],
        gender: '', //性别
        name: '', //姓名
        profession: '', //职业
        selfInviteCode: '', //自己的邀请码 
        genderFlag: false,
        cityFlag: false,
        cityArr: [{ label: '郑州' }, { label: '呼和浩特' }, { label: '其它' }],
        experienceArr: [{ value: '无相关经验' }, { value: '微商' }, { value: '社交电商' }, { value: '其它' }],
        fansCountArr:[{value:'0-100'},{value:'100-500'},{value:'500-2000'},{value:'2000以上'}],
        fansCount:'',
        applyStatus: '-2', //替换allowDistribute的判断条件，申请状态，-1未通过，0审核中，1审核通过
        conHeight: 400,
        isClickApply: false,
      isLoadDataInfo: false,

      dataList: [],
      selectedCard: {},
      productInfo: {},
      count: 1,
      sceneId: "",
      inviteCode: '',
      orderBizType: 'NORMAL',
      paying: false,
      resData: {}
    },
    onLoad: function(options) {
        const updateManager = wx.getUpdateManager();
        updateManager.onUpdateReady(function() {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success(res) {
                    if (res.confirm) {
                        updateManager.applyUpdate()
                    }
                }
            })
        })
        
        wx.getSystemInfo({
            success: (res) => {
                var conHeight = res.windowHeight - app.globalData.barHeight - 45;
                this.setData({ conHeight: conHeight })
            }
        });
        if (options.openid) {
            console.log('分享点进来');
            this.setData({
                openId: options.openid,
                switchFun: true
            });
            this.getUserInfor();
        } else {
            this.getUserInfor(); //用户信息，是否绑定手机号码
        }

      this.setData({
        sceneId: options.sceneId ? options.sceneId : ''
      })
      getData.call(this);
    },
    onShow: function() {
        this.setData({
          genderArr: [{ value: 1, name: '男' }, { value: 2, name: '女' }],
          member: wx.getStorageSync('distributorRole') == 'LEADER' || wx.getStorageSync('member')
        });
        if(wx.getStorageSync('inputData')){
            console.log("录入后保存的数据重新展现");
            var obj = JSON.parse(wx.getStorageSync('inputData'));
            this.setData(obj);
        }
        let self = this;
        if (wx.getStorageSync('token')) { //token存在
            getGardenInfor.call(self); //get首页信息,获取分销角色
        } else { //token不存在 登陆
            return;
        }
    },
    onHide:function(){
        console.log("保存录入的数据");
        this.saveInputData();
    },
    /**申请成为桔长  **/
    clickApply: function(e) {
        this.setData({
            isClickApply: true
        });
    },
    /**   跳转页面  ***/
    toPage: function(e) {
        let role = e.currentTarget.dataset.role ? e.currentTarget.dataset.role : '';
        let page = role ? e.currentTarget.dataset.page + '?role=' + role : e.currentTarget.dataset.page;
        wx.navigateTo({ url: page });
    },
  share: function (obj) {
    service.share(obj).subscribe({
      next: res => {
        console.log('---------分享接口返回--------');
        console.log(res);
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
    /*** 用户分享  ***/
    onShareAppMessage: function() {
      if ((this.data.applyLeader == 0 || (this.data.applyLeader == 1 && this.data.applyStatus == -1)) && !this.data.isClickApply && !this.data.member) {
        var obj = {
          type: 'SHARE_PROGRAM',
          sharePath: '/pages/member/index'
        };
        this.share(obj);
        return {
          title: '桔集：聚集优质好店，体验美好生活，加入成为会员吧！',
          imageUrl: '/images/shareImg.png',
          path: '/pages/login/index?pagetype=7&sceneId=' + this.data.resData.sceneId
        }
      } else {
        return {
          title: '我在桔集免费吃喝玩乐还能赚钱，邀你组队一起赚钱！',
          path: 'pages/login/index?pagetype=2&openid=' + wx.getStorageSync('openid') + '&invitecode=' + wx.getStorageSync('inviteCode'),
          imageUrl: '/images/banner-invent.png'
        }
      }
    },
    // ----保存用户输入的数据----
    saveInputData:function(){
        var dataInfo = {
            name: this.data.name,
            wechatId: this.data.wechatId,
            age: this.data.age,
            city: this.data.city,
            profession: this.data.profession,
            experience: this.data.experience,
            gender: this.data.gender,
            fansCount:this.data.fansCount
        };
        wx.setStorageSync('inputData',JSON.stringify(dataInfo));
    },

    // 提交信息，申请加入桔园
    submitUserInfor:function() {
        let reg = /[\u4e00-\u9fa5]/;
        if (!this.data.name) {
            showAlert('请填写您的实名认证姓名');return;
        }
        if (!this.data.bindPhoneNumber) {
          showAlert('请绑定手机号'); return;
        }
        if (!reg.test(this.data.name)) {
            showAlert('请填写中文姓名');return;
        }
        if (!this.data.wechatId) {
            showAlert('请填写您的微信号');return;
        }
        if (!this.data.gender) {
            showAlert('请选择您的性别');return;
        }
        if (!this.data.age) {
            showAlert('请填写您的年龄');return;
        }
        if (!this.data.city) {
            showAlert('请选择您的城市');return;
        }
        if (!this.data.profession) {
            showAlert('请填写您的职业');return;
        }
        if (!this.data.experience) {
            showAlert('请选择您的相关经验');return;
        }
        if (!this.data.fansCount){
            showAlert('请选择粉丝数量');return;
        }
        wx.showToast({ title: '提交中', icon: 'loading', duration: 10000,mask: true});
        jugardenService.joinDistributor({
            name: this.data.name,
            wechatId: this.data.wechatId,
            age: this.data.age,
            city: this.data.city,
            profession: this.data.profession,
            experience: this.data.experience,
            gender: this.data.gender,
            inviteCode: this.data.selfInviteCode,
            fansCount:this.data.fansCount,
            parentId: '',
        }).subscribe({
            next: res => {
                if (res) {
                    wx.hideToast();
                    this.setData({
                        applyStatus: 0,
                        applyLeader: 1
                    });
                }
            },
            error: err => {
                wx.hideToast();
                errDialog(err);
            },
            complete: () => {
                wx.hideToast();
            }
        });
    },

    // 获取用户信息 是否绑定手机号
    getUserInfor: function() {
        let self = this;
        service.userInfo({ openId: wx.getStorageSync('openid') }).subscribe({
            next: res => {
                this.setData({
                    phone: res.phone,
                    bindPhoneNumber: res.phone ? true : false
                });
                getGardenInfor.call(self); //get用户信息身份
                console.log(this.data.bindPhoneNumber);
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },
    radioChange: function(e) {
        console.log("性别=" + e.detail.value);
        this.setData({ gender: e.detail.value });
    },
    // 授权手机号码
    getUserPhoneNumber: function(e) {
      let self = this;var errMsg = e.detail.errMsg;
      if (errMsg == 'getPhoneNumber:ok') {
        let data = { encryptData: e.detail.encryptedData, iv: e.detail.iv }
        service.decodeUserPhone(data).subscribe({
          next: res => {
            this.setData({
              phone: res ? res.phoneNumber : '',
            });
            console.log(this.data.phone);
            bindPhone.call(self); //授权以后绑定手机号码
          },
          error: err => { console.log(err) },
          complete: () => wx.hideToast()
        })
      }
    },
    bindnameinput: function(e) {
        console.log(e.detail.value);
        this.setData({
            name: e.detail.value
        })
    },
    bindwechatIdinput: function(e) {
        console.log(e.detail.value);
        this.setData({
            wechatId: e.detail.value
        })
    },
    bindageinput: function(e) {
        console.log(e.detail.value);
        this.setData({
            age: e.detail.value
        })
    },
    bindcityinput: function(e) {
        console.log(e.detail.value);
        this.setData({
            city: e.detail.value
        })
    },
    bindprofessioninput: function(e) {
        console.log(e.detail.value);
        this.setData({
            profession: e.detail.value
        })
    },
    experiencePickerChange: function(e) {
        this.setData({
            experience: this.data.experienceArr[e.detail.value].value
        });
    },
    bindselfInviteCodeinput: function(e) {
        console.log(e.detail.value);
        this.setData({
            selfInviteCode: e.detail.value
        })
    },
    cityPickerChange: function(e) {
        this.setData({
            city: this.data.cityArr[e.detail.value].label
        });
    },
    fansCountPickerChange:function(e){
        this.setData({
            fansCount: this.data.fansCountArr[e.detail.value].value
        });
    },
  bandAuth() {
    let data = {
      wechatId: this.data.wechatId,
      name: this.data.name
    }
    service.bindWechatId(data).subscribe({
      next: res => {
        wx.showToast({
          title: "绑定成功",
          icon: "success",
        });
        this.setData({
          isAuthed: true,
        });
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },

  /*开通会员 start*/ 

  //收集formid做推送
  collectFormIds: function (e) {
    console.log(e.detail);
    service.collectFormIds({
      formId: e.detail.formId
    }).subscribe({
      next: res => {
        console.log(res)
      }
    });
  },

  cardClick(e) {
    this.setData({
      selectedCard: e.currentTarget.dataset.card
    });
    this.getItemInfo()
  },

  buy() {
    if (this.data.paying) {
      return
    }
    this.toProductPay();
  },

  getItemInfo: function () {
    console.log("普通商品详情");
    service.getItemInfo({
      productId: this.data.productId,
      // storeId: this.data.storeId
    }).subscribe({
      next: res => {
        this.setData({
          productInfo: res.product,
          store: res.store,
          price: res.product.price,
          point: res.product.point,
          showProduct: true
        });
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },

  showAlert: function (msg) {
    wx.showModal({
      title: '提示',
      content: msg
    });
    this.setData({
      paying: false
    });
  },
  errorAlert: function (msg) {
    wx.showModal({
      title: '支付失败',
      content: msg
    });
    this.setData({
      paying: false
    });
  },
  cancelPay: function () {
    wx.showToast({
      title: '用户取消支付',
      icon: 'none'
    });
    this.setData({
      paying: false
    });
  },

  // 普通商品支付
  toProductPay: function () {
    this.setData({
      paying: true
    })
    service.getPre({
      productId: this.data.productId
    }).subscribe({
      next: res => {
        console.log('--------下单前数据校验-------');
        if (res.pointBalance < this.data.productInfo.point * this.data.count) {
          this.showAlert('当前桔子余额不足，请多赚些桔子吧');
        }
        //判断条件 如果：过往已经购买的数量 + 要买的数量 > 限制购买的最大数量 处理：禁止下单
        if (res.totalAll + this.data.count <= this.data.productInfo.limitMaxNum) {
          //判断条件 如果：今日已经购买的数量 + 要买的数量 > 今日限制购买的最大数量 处理：禁止下单
          if (res.totalToday + this.data.count <= this.data.productInfo.limitPerDayNum) {
            //判断条件 如果：要买的数量 > 每个订单限制购买的最大数量 处理：禁止下单
            if (this.data.count <= this.data.productInfo.limitPerOrderNum) {
              //创建订单
              var info = this.data.selectedCard;
              // var point = info.point == null || info.point == 0 ? '0' : info.point;
              var point = 0;
              var price = info.price == null || info.price == 0 ? '0' : info.price;
              if (point == 0 && price > 0) {
                var payTypeValue = 'WECHAT';
              } else if (point > 0 && price == 0) {
                var payTypeValue = 'POINT';
              } else {
                var payTypeValue = 'MIX';
              }
              var orderObj = {
                itemRequests: [{
                  sceneId: this.data.sceneId,
                  inviteCode: this.data.inviteCode,
                  merchantId: this.data.productInfo.merchantId,
                  merchantName: this.data.productInfo.merchantName,
                  num: this.data.count,
                  originalPrice: this.data.productInfo.originalPrice,
                  payAmount: price * this.data.count,
                  payPoint: point * this.data.count,
                  picId: this.data.productInfo.picId,
                  point: point,
                  price: price,
                  productId: this.data.productInfo.productId,
                  productName: this.data.productInfo.productName,
                  skuId: this.data.skuId,
                  skuMajorId: this.data.skuMajorId,
                  type: this.data.productInfo.type
                }],
                openId: wx.getStorageSync('openid'),
                originAmount: this.data.productInfo.originalPrice * this.data.count,
                payAmount: price * this.data.count,
                payPoint: point * this.data.count,
                payType: payTypeValue,
                providerId: this.data.productInfo.providerId,
                providerName: this.data.productInfo.providerName,
                orderBizType: this.data.orderBizType
              };
              service.saveOrder(orderObj).subscribe({
                next: res1 => {
                  console.log('--------创建订单返回1混合支付-------');
                  console.log(res1);
                  var payInfo = JSON.parse(res1.payInfo);
                  wx.requestPayment({
                    timeStamp: payInfo.timeStamp,
                    nonceStr: payInfo.nonceStr,
                    package: payInfo.package,
                    signType: payInfo.signType,
                    paySign: payInfo.paySign,
                    success: (res2) => {
                      this.setData({
                        paying: false
                      });
                      var obj = {
                        rawData: '',
                        inviteCode: '',
                        scene: ''
                      };
                      this.login(obj).then(() => {
                        wx.reLaunch({
                          url: '/pages/jujiGarden/gardenIndex/index',
                        })
                      });
                    },
                    fail: (res2) => {
                      if (res2.errMsg == 'requestPayment:fail cancel') {
                        this.cancelPay();
                      }
                    }
                  });
                },
                error: err => {
                  this.errorAlert(err);
                }
              });
            } else {
              var number = this.data.productInfo.limitPerOrderNum;
              var errMsg = '该商品每单最多可以购买' + number + '件';
              this.showAlert(errMsg);
            }
          } else {
            var number = this.data.productInfo.limitPerDayNum - res.totalToday;
            var errMsg = number == 0 ? '超出购买限制' : '该商品今日还可以购买' + number + '件';
            this.showAlert(errMsg);
          }
        } else {
          var number = this.data.productInfo.limitMaxNum - res.totalAll;
          var errMsg = number == 0 ? '超出购买限制' : '该商品您最多还可以购买' + number + '件';
          this.showAlert(errMsg);
        }
      },
      error: err => {
        this.showAlert(err);
      }
    })
  },

  login: function (obj) {
    return new Promise(function (resolve1, reject1) {
      wx.login({
        success: res => {
          resolve1(res.code);
        }
      });
    }).then(function (code) {
      return new Promise(function (resolve2, reject2) {
        wx.request({
          url: constant.apiUrl + '/user/login.json',
          method: 'GET',
          data: {
            code: code,
            appId: constant.APPID,
            isMock: false, //测试标记
            inviteCode: obj.inviteCode,
            rawData: obj.rawData,
            sceneId: obj.scene
          },
          header: {
            'content-type': 'application/json',
          },
          success: (res1) => {
            console.log(res1);
            if (res1.data.errorCode == '200') {
              wx.setStorageSync('token', res1.data.data.token);
              wx.setStorageSync('openid', res1.data.data.openId);
              wx.setStorageSync('inviteCode', res1.data.data.inviteCode);
              wx.setStorageSync('userinfo', JSON.stringify(res1.data.data));
              wx.setStorageSync('distributorRole', res1.data.data.distributorRole);
              wx.setStorageSync('member', res1.data.data.member);
              wx.setStorageSync('level', res1.data.data.level);
              wx.setStorageSync('memberDays', res1.data.data.memberDays);
              wx.setStorageSync('memberExpireTime', res1.data.data.memberExpireTime);
              wx.setStorageSync('inviteMemberCount', res1.data.data.inviteMemberCount);
              resolve2();
            } else {
              reject2('登录失败，错误码:' + res1.data.errorCode + ' 返回错误: ' + res1.data.errorInfo);
            }
          },
          fail: (err) => {
            reject2(err.errMsg);
          }
        });
      });
    }).catch(function (err) {
      wx.showModal({
        title: '错误',
        content: err
      });
    });
  }
  /*开通会员 end*/
});

// 绑定手机号码
function bindPhone() {
    let self = this;
    let data = { phone: this.data.phone }
    service.bindPhone(data).subscribe({
        next: res => {
            wx.showToast({
                title: "绑定成功",
                icon: "success",
            });
            this.setData({
                bindPhoneNumber: true,
                applyLeader: 1
            });
            let data = {
                parentId: this.data.openId,
                applyLeader: this.data.applyLeader
            }
            // joinDistributor.call(self, data); //加入桔园
        },
        error: err => console.log(err),
        complete: () => wx.hideToast()
    })
}

// 首页信息获取 
function getGardenInfor() {
    let self = this;
    jugardenService.getGardenHomeInfor().subscribe({
        next: res => {
            if (res) {
                console.log(res);
                console.log('进入查询用户信息拉');
                if (res.role == 'MEMBER') { // 1、邀请进来的是桔民 return 2、邀请进来的是其他的 加入桔园 applyLeader=false;
                    this.data.juminNumList = [];
                    this.data.hadNumber = parseInt(res.invitedLeaderCount) + parseInt(res.invitedMemberCount);
                } else if (res.role == 'UNDEFINED' && this.data.switchFun) {
                    self.setData({ applyLeader: false })
                    let data = {
                        parentId: this.data.openId,
                        applyLeader: this.data.applyLeader
                    }
                    joinDistributor.call(self, data);
                } else if ((res.role == 'LEADER' || res.role == 'MEMBER') && this.data.switchFun) { //邀请者是桔长或者桔民
                    let data = {
                        parentId: this.data.openId,
                        applyLeader: res.applyLeader
                    }
                    joinDistributor.call(self, data);
                }
                if (res.role == 'LEADER' && res.hasReceiver) { //动态设置title背景色 是桔长并已经认证
                    wx.setNavigationBarColor({
                        frontColor: '#000000', // 必写项
                        backgroundColor: '#FFDC00', // 必写项
                    })
                }
                this.setData({
                    age: res.age==0?'':res.age, //年龄
                    city: res.city, //城市
                    experience: res.experience, //相关经验
                    gender: res.gender, //性别
                    name: res.name, //姓名
                    profession: res.profession, //职业
                    selfInviteCode: res.selfInviteCode, //自己的邀请码 
                    wechatId: res.wechatId, //微信号
                    role: res.role,
                    applyStatus: res.applyStatus, // 替换allowDistribute的判断条件，申请状态，-1未通过，0审核中，1审核通过 
                    juminNumList: this.data.juminNumList,
                    hadNumber: this.data.hadNumber,
                    todaySaleRebate: res.todaySaleRebate ? res.todaySaleRebate : 0,
                    todaySettlementAmount: res.todaySettlementAmount ? res.todaySettlementAmount : 0,
                    totalSettlementAmount: res.totalSettlementAmount ? res.totalSettlementAmount : 0,
                    invitedLeaderCount: res.invitedLeaderCount ? res.invitedLeaderCount : 0,
                    invitedMemberCount: res.invitedMemberCount ? res.invitedMemberCount : 0,
                    isAuthed: res.hasReceiver == true ? true : false,
                    applyLeader: res.applyLeader ? 1 : 0,
                    minInvitedMemberCount: res.minInvitedMemberCount,
                    isLoadDataInfo: true,
                });
              if ((this.data.applyLeader == 0 || (this.data.applyLeader == 1 && this.data.applyStatus == -1)) && !this.data.isClickApply && !this.data.member) {
                this.setData({
                  nvabarData: {
                    showCapsule: 0,
                    title: '会员',
                    isIndex: 2
                  },
                })
              } else {
                this.setData({
                  nvabarData: { showCapsule: 0, title: '会员', isIndex: 1 },
                })
              }
            }
        },
        error: err => console.log(err),
        complete: () => wx.hideToast()
    })
}

// 加入分销 成为桔民
function joinDistributor(data) {
    let self = this;
    jugardenService.joinDistributor(data).subscribe({
        next: res => {
            if (res) {
                if (res.role == 'MEMBER' || res.role == 'UNDEFINED') { //桔民
                    this.data.juminNumList = [];
                    this.data.hadNumber = parseInt(res.invitedLeaderCount) + parseInt(res.invitedMemberCount);
                    if (this.data.hadNumber > 0) {
                        for (let i = 0; i < this.data.hadNumber; i++) {
                            let list = 'yes';
                            this.data.juminNumList.push(list);
                        }
                        for (let j = 0; j < (res.minInvitedMemberCount - parseInt(this.data.hadNumber)); j++) {
                            this.data.juminNumList.push('');
                        }
                    } else {
                        for (let j = 0; j < res.minInvitedMemberCount; j++) {
                            this.data.juminNumList.push('');
                        }
                    }
                }
                this.setData({
                    role: res.role,
                    juminNumList: this.data.juminNumList,
                    hadNumber: this.data.hadNumber,
                    applyLeader: res.applyLeader,
                    isAuthed: res.hasReceiver == true ? true : false,
                    minInvitedMemberCount: res.minInvitedMemberCount
                })
            }
        },
        error: err => console.log(err),
        complete: () => wx.hideToast()
    })
}

function getData() {
  service.memberDefines({}).subscribe({
    next: res => {

      // 19.07.17兼容后台送桔子新版本
      if (res.product) {
        var pointMap = res.pointMap
        res = res.product
        var productSkus = res.productSkus
        productSkus.forEach(p => {
          // 自定义添加一个送桔子属性
          p['sendPoint'] = pointMap[p.skuId]
        })
      }

      this.setData({
        dataList: res.productSkus,
        selectedCard: res.productSkus[0],
        productId: res.productId,
        skuMajorId: res.productSkus[0].id,
        skuId: res.productSkus[0].skuId,
        // data里边的sceneId为onLoad函数入参options里边的sceneId，用来确定点击谁的分享链接进入
        // 请求会员卡数据后不应该替换sceneId
        // sceneId: this.data.sceneId ? this.data.sceneId : res.sceneId,
        resData: res
      });

      this.getItemInfo();
    },
    error: err => console.log(err),
    complete: () => wx.hideToast()
  })
}