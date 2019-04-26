import { constant } from '../../../utils/constant';
import { http } from '../../../utils/http';
let activitiesService = {};
let api = constant.apiUrl;

// 活动商品详情 /activity/consumer/activity.json
activitiesService.activity = (data) => {
  let url = api + '/activity/consumer/activity.json';
  return http.get(url, data);
}

// 活动列表 /activity/consumer/activities.json
activitiesService.activityList = (data) => {
  let url = api + '/activity/consumer/activities.json';
  return http.get(url, data);
}

activitiesService.myOrder = (data) =>{
	let url = api + '/activity/consumer/orders.json';
	return http.get(url, data);
}
// 秒杀提醒
activitiesService.remain = (data) =>{
	let url = api + '/secKill/remain.json';
	return http.get(url, data);
}

module.exports = {
  activitiesService: activitiesService
}