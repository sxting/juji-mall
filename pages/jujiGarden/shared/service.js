import { constant } from '../../../utils/constant';
import { http } from '../../../utils/http';
let jugardenService = {};
let API = constant.apiUrl;

// 桔园首页
jugardenService.getGardenHomeInfor = () => {
  let url = API + '/distributor/index.json';
  return http.get(url)
}

module.exports = {
  jugardenService: jugardenService
}