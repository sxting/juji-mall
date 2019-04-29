Component({
    properties: {
        pintuanListInfor: {
            type: Array,
            value: ['', '']
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
        },
        resData: {
            type: Object,
            value: {}
        },
        activityOrderId: {
            type: String,
            value: ''
        },
        activityId: {
            type: String,
            value: ''
        }
    },
    data: {
        collageInforData: {}, //获取过来的数据
        headPortraitList: [], //拼团中 参团的头像
        pintuanListInfor: [], //正在参团的小伙伴
        portraitUrl: '/images/unkonw-icon.png',
        resData: {}, //拿过来的全部信息
        activityOrderId: '', //订单ID
        activityId: '', //活动ID
        orderStatus: '', //订单状态
        isInitiator: 1, //是否为发起者 (判断进入是自己 1 还是他人 0)
        orderStock: 0, //查看此活动的库存
        restHour: '00',
        restMinute: '00',
        restSecond: '00',
        resNum: 0
    },
    ready: function() {
        console.log('活动信息');
        console.log(this.data.resData);
        console.log(this.data.activityOrderId);
        console.log(this.data.activityId);
        let self = this;
        // 是否有其他参团者的活动
        if (this.data.resData.otherDigests) {
            this.data.resData.otherDigests.forEach(function(item) {
                let picArr = [];
                item.progresses.forEach(function(list) {
                    picArr.push(list.avatar);
                })
                item.resNum = (2 - picArr.length) ? (2 - picArr.length) : 0;
                for (let i = 0; i < item.resNum; i++) {
                    picArr.push('');
                }
                item.picArr = picArr;
            })
        }

        // 正在参团的人
        if (this.data.resData.orderDigest && this.data.resData.orderDigest.progresses) {
            let resNum = 2 - this.data.resData.orderDigest.progresses.length;
            for (let j = 0; j < resNum; j++) {
                this.data.resData.orderDigest.progresses.push({});
            }
            this.setData({
                resNum: resNum
            })
        }

        this.setData({
            headPortraitList: this.data.resData.orderDigest && this.data.resData.orderDigest.progresses ? this.data.resData.orderDigest.progresses : [],
            pintuanListInfor: this.data.resData.otherDigests, //其他正在参团的小伙伴
            orderStatus: this.data.resData.orderDigest ? this.data.resData.orderDigest.activityOrderStatus : '', //订单状态
            isInitiator: this.data.resData.orderDigest ? this.data.resData.orderDigest.isInitiator : 1, //是否为发起者 (判断进入是自己还是他人)
            orderStock: this.data.resData.stock, //查看此活动的库存
            orderInfor: this.data.resData.orderDigest, //订单信息
        })
        console.log(this.data.resData.otherDigests.length);

        /** 拼团数据 **/
        let countDownTime = '';
        let expireTime = this.data.resData.orderDigest && this.data.resData.orderDigest != null ? this.data.resData.orderDigest.expirationTime.replace(/-/g, '/') : '';
        if (expireTime) {
            let time = new Date(expireTime).getTime() - new Date().getTime();
            console.log(time);
            if (time <= 0) {
                countDownTime = '00:00:00'
            } else {
                let hours = parseInt(time / 1000 / 60 / 60 + '');
                let minutes = parseInt(time / 1000 / 60 - hours * 60 + '');
                let seconds = parseInt(time / 1000 - minutes * 60 - hours * 3600 + '');
                countDownTime = (hours.toString().length < 2 ? '0' + hours : hours) + ':' +
                    (minutes.toString().length < 2 ? '0' + minutes : minutes) + ':' +
                    (seconds.toString().length < 2 ? '0' + seconds : seconds);
            }
            this.setData({
                restHour: countDownTime.substring(0, 2),
                restMinute: countDownTime.substring(3, 5),
                restSecond: countDownTime.substring(6)
            })
            /* 倒计时 */
            let downTime = '2000/01/01';
            let timer = setInterval(function() {
                if (new Date(downTime + ' ' + countDownTime).getHours().toString() === '0' && new Date(downTime + ' ' + countDownTime).getMinutes().toString() === '0' && new Date(downTime + ' ' + countDownTime).getSeconds().toString() === '0') {
                    countDownTime = '00:00:00';
                    clearInterval(timer);
                } else {
                    let times = new Date(new Date(downTime + ' ' + countDownTime).getTime() - 1000);
                    countDownTime =
                        (times.getHours().toString().length < 2 ? '0' + times.getHours() : times.getHours()) + ':' +
                        (times.getMinutes().toString().length < 2 ? '0' + times.getMinutes() : times.getMinutes()) + ':' +
                        (times.getSeconds().toString().length < 2 ? '0' + times.getSeconds() : times.getSeconds());
                }
                self.setData({
                    restHour: countDownTime.substring(0, 2),
                    restMinute: countDownTime.substring(3, 5),
                    restSecond: countDownTime.substring(6)
                })
            }, 1000)
        }
    },
    methods: {
        toMyOrderList() {
            wx.navigateTo({
                url: '/pages/orderlist/index?index=2&status=PAID'
            })
        },
        onlyJoinCollage(){
            wx.navigateTo({
                url: '/pages/payOrder/index?paytype=5&orderType=SPLICED&id=' + e.currentTarget.dataset.productid + '&activityId=' + this.data.activityId + '&splicedRuleId=' + this.data.resData.rules[0].splicedRuleId
            })
        },

        /****  参团 ****/
        joinCollage(e) {
            console.log(this.data.resData.activityOrderId);
            var productid = e.currentTarget.dataset.productid;
            var activityid = e.currentTarget.dataset.activityid;
            var activityorderid = e.currentTarget.dataset.activityorderid;
            console.log("去参团");
            console.log(productid);
            console.log(activityid);
            console.log("activityorderid="+activityorderid);
            wx.navigateTo({
                url: '/pages/payOrder/index?paytype=5&orderType=SPLICED&id=' + productid + '&activityId=' + activityid + '&activityOrderId=' + activityorderid + '&splicedRuleId=' + this.data.resData.rules[0].splicedRuleId
            });
        },

        /****  开团 ****/
        createCollage(e) {
            console.log(e.currentTarget.dataset.productid);
            wx.navigateTo({
                url: '/pages/payOrder/index?paytype=5&orderType=SPLICED&id=' + e.currentTarget.dataset.productid + '&activityId=' + this.data.activityId + '&splicedRuleId=' + this.data.resData.rules[0].splicedRuleId
            })
        }
    }
})