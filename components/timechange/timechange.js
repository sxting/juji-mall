Component({
  properties: {
    dataFromParent: {
      type: String,
      value: "2000-01-01 00:00:00",
      observer: function (newVal, oldVal, changedPath) {

      }
    },
    customeClass:{
      type: String,
      value: "",
      observer: function (newVal, oldVal, changedPath) {

      }
    }
  },
  data: { 
    restHour: '00',
    restMinute: '00',
    restSecond: '00',
  },
  ready: function () {
    console.log("倒计时组件");
    console.log(this.data.dataFromParent)
    var expireTime = this.data.dataFromParent;
    let expireDate = expireTime.replace(/-/g, '/');
    this.timeChange(expireDate);
  },
  methods: {
    timeChange: function(expireTime){
      let countDownTime = '';
      if (expireTime){
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
        let timer = setInterval(() => {
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
          this.setData({
            restHour: countDownTime.substring(0, 2),
            restMinute: countDownTime.substring(3, 5),
            restSecond: countDownTime.substring(6)
          })
        }, 1000)
      }
    }
  }
})