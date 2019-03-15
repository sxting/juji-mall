import { jugardenService } from '../shared/service.js'
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
var app = getApp();
Page({
    data: {
        tablist: [{ name: '本日', type: '1' }, { name: '本周', type: '2' }, { name: '本月', type: '3' }, { name: '累计', type: '4' }],
        curTabIndex: 0,
        curActiveIndex:1,
        constant: constant,
        isShowNodata: false,
        recordlist: ['','',''],
        status:'',
        isFinall:false,
        amount: 0,
        sortIndex1:1,
        sortIndex2:1,
        incomeData:{},
        withdrawData:{},
        incomelist:{},
        withdrawlist:{}
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '我的收入' });
        this.getDataByType('',1);
        this.getDataByType('SETTLED',1);
    },
    switchTab: function(e) {
        var thisIndex = e.currentTarget.dataset.index;
        this.setData({ curTabIndex: thisIndex});
        var type = e.currentTarget.dataset.type;
        this.getDataByType('',type);
        this.getDataByType('SETTLED',type);
    },
    toggleLabel1:function(e){
        var index = e.currentTarget.dataset.label;
        this.setData({ sortIndex1: index });
    },
    toggleLabel2:function(e){
        var index = e.currentTarget.dataset.label;
        this.setData({ sortIndex2: index });
    },
    switchActive:function(e){
        var index = e.currentTarget.dataset.index;
        this.setData({ curActiveIndex: index });
    },
    getDataByType:function(status,type){
        if(type==1){//本日
            var startDate = getNowDate()+' 00:00:00';
            var endDate = getNowDate()+' 23:59:59';
        }
        if(type==2){//本周
            var startDate = getWeekFirstDay()+' 00:00:00';
            var endDate = getWeekLastDay()+' 23:59:59';
        }
        if(type==3){//本月
            var startDate = getMonthFirstDay()+' 00:00:00';
            var endDate = getMonthLastDay()+' 23:59:59';
        }
        if(type==4){//累计
            var startDate = '2019-01-01 00:00:00';
            var endDate = '2100-01-01 00:00:00';
        }
        this.getData(status,startDate,endDate);
        this.getDigestlist(status,startDate,endDate);
    },
    getData: function(status,startDate,endDate){
        jugardenService.getIncomeInfor({
            status:status,
            startDate:startDate,
            endDate:endDate
        }).subscribe({
            next: res => {
                if(status==""){
                    this.setData({incomeData:res});
                }else{
                    this.setData({withdrawData:res});
                }
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    getDigestlist:function(status,startDate,endDate){
        jugardenService.getIncomeOrderDigests({
            status:status,
            startDate:startDate,
            endDate:endDate
        }).subscribe({
            next: res => {
                if(status==""){
                    this.setData({incomelist:res});
                }else{
                    this.setData({withdrawlist:res});
                }
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    toDetail:function(e){
      var id = e.currentTarget.dataset.id;
      wx.navigateTo({ url: '../orderDetail/orderDetail?id='+id });
    },
});


// -----------------------methods------------------------

function getNowDate() {
    var d = new Date();
    var y = d.getFullYear()
    var m = d.getMonth() + 1;
    var d = d.getDate();
    return y+'-'+(m<10?'0'+m:m)+'-'+(d<10?'0'+d:d);
}

function getWeekFirstDay(){     
    var Nowdate=new Date();     
    var WeekFirstDay=new Date(Nowdate-(Nowdate.getDay()-1)*86400000);   
    var M=Number(WeekFirstDay.getMonth())+1;
    var D=WeekFirstDay.getDate();
    return WeekFirstDay.getFullYear()+"-"+(M<10?'0'+M:M)+'-'+(D<10?'0'+D:D);
}

function getWeekLastDay(){     
    var Nowdate=new Date();     
    var WeekFirstDay=new Date(Nowdate-(Nowdate.getDay()-1)*86400000);     
    var WeekLastDay=new Date((WeekFirstDay/1000+6*86400)*1000);     
    var M=Number(WeekLastDay.getMonth())+1     
    var D=WeekLastDay.getDate();
    return WeekLastDay.getFullYear()+"-"+(M<10?'0'+M:M)+'-'+(D<10?'0'+D:D);
}

function getMonthFirstDay(){     
    var Nowdate=new Date();     
    var MonthFirstDay=new Date(Nowdate.getFullYear(),Nowdate.getMonth(),1);     
    var M=Number(MonthFirstDay.getMonth())+1;
    var D=MonthFirstDay.getDate();
    return MonthFirstDay.getFullYear()+"-"+(M<10?'0'+M:M)+'-'+(D<10?'0'+D:D);     
}

function getMonthLastDay(){     
    var Nowdate=new Date();     
    var MonthNextFirstDay=new Date(Nowdate.getFullYear(),Nowdate.getMonth()+1,1);     
    var MonthLastDay=new Date(MonthNextFirstDay-86400000);     
    var M=Number(MonthLastDay.getMonth())+1;
    var D=MonthLastDay.getDate();   
    return MonthLastDay.getFullYear()+"-"+(M<10?'0'+M:M)+'-'+(D<10?'0'+D:D);     
}