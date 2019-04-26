var timer = null;
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
  detached:function(){
    clearInterval(timer);
  },
  methods: {
    timeChange: function(expireTime){
      if (expireTime){
        console.log(expireTime);
        this.formatTime(expireTime);
        timer = setInterval(()=>{
          this.formatTime(expireTime);
        },1000);
      }
    },
    formatTime:function(expireTime){
        let countDownTime = '';
        let time = new Date(expireTime).getTime() - new Date().getTime();
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
    }
  }
})