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
    },
    radius:{
      type: String,
      value: "1",
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
        let time = new Date(expireTime).getTime() - new Date().getTime();
        if (time <= 0) {
          var hours = '00';
          var minutes = '00';
          var seconds = '00';
        } else {
          var hours = formatNum(parseInt(time / 1000 / 60 / 60));
          var minutes = formatNum(parseInt(time / 1000 / 60 - hours * 60));
          var seconds = formatNum(parseInt(time / 1000 - minutes * 60 - hours * 3600));
        }
        this.setData({
          restHour: hours,
          restMinute: minutes,
          restSecond: seconds
        })
    }
  }
})

function formatNum(number){
  return number<10?'0'+number:number;
}