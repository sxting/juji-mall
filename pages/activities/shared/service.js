import { constant } from '../../../utils/constant';
import { http } from '../../../utils/http';
let activitiesService = {};
let API = constant.apiUrl;

// 活动商品详情 /activity/consumer/activity.json
activitiesService.activity = (data) => {
  let url = API + '/activity/consumer/activity.json';
  return http.get(url, data);
}


module.exports = {
  activitiesService: activitiesService
}