import {
  constant
} from 'utils/constant';
import {
  http
} from 'utils/http';
let service = {};
let api = constant.apiUrl;
//测试预下单 微信支付
service.testPreOrder = (data) => {
  let apiUrl = 'https://juji.juniuo.com/customer/order/testPreOrder.json';
  return http.post(apiUrl, data);
}
//预下单 微信支付
service.preOrder = (data) => {
  let apiUrl = api + '/customer/order/preOrder.json';
  return http.post(apiUrl, data);
}

// -------------------------------------橘子商城部分接口------------------------------------------

service.getAuthCode = (data) => {
  let apiUrl = api + '/user/getAuthCode.json';//描述:获取验证码
  return http.get(apiUrl, data);
}
service.bindPhone = (data) => {
  let apiUrl = api + '/user/bindPhone.json';//描述:绑定手机号 注册 参数手机号 和 验证码
  return http.get(apiUrl, data);
}
service.getIndexData = (data) => {
  let apiUrl = api + '/index.json';//首页轮播图和桔子换礼2个
  return http.get(apiUrl, data);
}

service.getRecommendPage = (data) => {
  let apiUrl = api + '/index/recommendPage.json';//描述:首页精选推荐 sortField排序分为：IDX,PRICE,DISTANCE,SOLDNUM,CHEAP； sortOrder顺序：ASC，DESC；type商品类型：PRODUCT POINT；
  return http.get(apiUrl, data);
}

service.getHotData = (data) => {
  let apiUrl = api + '/loc/hot.json';//描述:查询热门开通城市
  return http.get(apiUrl, data);
}

service.getCurrentLoc = (data) => {
  let apiUrl = api + '/loc/currentLoc.json';//描述:当前城市 参数经纬度
  return http.get(apiUrl, data);
}

service.getSelectHotCity = (data) => {
  let apiUrl = api + '/selectHotCity.json';//描述:选择省市县确认服务商信息 （根据上面开通城市 ）
  return http.get(apiUrl, data);
}

service.currentPoint = (data) => {
  let apiUrl = api + '/point/currentPoint.json';//描述:查询桔子主页信息
  return http.get(apiUrl, data);
}
service.signIn = (data) => {
  let apiUrl = api + '/point/signIn.json';//描述:用户签到
  return http.get(apiUrl, data);
}
// --------------------------------------------merchant-----------------------------------
/*获取Banner列表*/
service.listBanners = (data) => {
  let apiUrl = api + '/mer/listBanners.json';
  return http.get(apiUrl, data);
}

/*获取城市列表 */
service.listCities = () => {
  let apiUrl = api + '/mer/listCities.json';
  return http.get(apiUrl);
}

/*获取最近商户列表 */
service.listMerchants = (data) => {
  let apiUrl = api + '/mer/listMerchantsNearby.json';
  return http.get(apiUrl, data);
}

/*获取最近门店列表 */
service.listShops = (data) => {
  let apiUrl = api + '/mer/listShopsNearby.json';
  return http.get(apiUrl, data);
}
/*获取商户详细信息 */
service.merchantDetail = (data) => {
  let apiUrl = api + '/mer/getMerchantDetail.json';
  return http.get(apiUrl, data);
}
/*商户共享卡列表 */
service.listShareCards = (data) => {
  let apiUrl = api + '/mer/listShareCards.json';
  return http.get(apiUrl, data);
}

service.signature = (data) => {
  let apiUrl = api + '/usr/sign.json';
  return http.post(apiUrl, data);
}

service.listUserComments = (data) => {
  let apiUrl = api + '/comment/listUserComments.json';
  return http.get(apiUrl, data);
}

// --------------------------------------------comment-----------------------------------
/*获取点赞列表*/
service.listCommentPraise = () => {
  let apiUrl = api + '/comment/listCommentPraise.json';
  return http.post(apiUrl);
}

/*留言回复*/
service.listCommentReply = () => {
  let apiUrl = api + '/comment/listCommentReply.json';
  return http.post(apiUrl);
}

/*获取商户留言*/
service.listComments = () => {
  let apiUrl = api + '/comment/listComments.json';
  return http.post(apiUrl);
}

/*点赞/取消点赞*/
service.praise = (data) => {
  let apiUrl = api + '/comment/praise.json';
  return http.post(apiUrl, data);
}
/*id获取评价详情*/
service.getComment = (data) => {
  let apiUrl = api + '/comment/getComment.json';
  return http.get(apiUrl, data);
}
/*获取商户评价*/
service.merListComments = (data) => {
  let apiUrl = api + '/comment/listComments.json';
  return http.post(apiUrl, data);
}

/*首页获取附近对商户的评价*/
service.listCommentsNearBy = (data) => {
  let apiUrl = api + '/comment/listCommentsNearBy.json';
  return http.post(apiUrl, data);
}

//留言回复
service.reply = (data) => {
  let apiUrl = api + '/comment/reply.json';
  return http.post(apiUrl, data);
}

// -------------------------------------------order-----------------------------------

//订单列表
service.orderlist = (data) => {
  let apiUrl = api + '/order/orderList.json';
  return http.get(apiUrl, data);
}
//订单详情
service.orderInfo = (data) => {
  let apiUrl = api + '/order/info.json';
  return http.get(apiUrl, data);
}

service.decodeUserPhone = (data) => {
  let apiUrl = api + '/user/decodeUserPhone.json';
  return http.get(apiUrl, data);
}

//下单
service.savePreOrder = (data) => {
  let apiUrl = api + '/order/savePreOrder.json';
  return http.get(apiUrl, data);
}

//走余额支付
service.confirmOrder = (data) => {
  let apiUrl = api + '/order/confirmOrder.json';
  return http.get(apiUrl, data);
}

// --------------------------------------------usr-----------------------------------
/*获取会员信息*/
service.userInfo = (data) => {
  let apiUrl = api + '/user/userInfo.json';
  return http.get(apiUrl, data);
}

/*会员注册*/
service.regist = () => {
  let apiUrl = api + '/usr/regist.json';
  return http.post(apiUrl);
}

/*会员关注*/
service.attent = (data) => {
  let apiUrl = api + '/usr/attent.json';
  return http.post(apiUrl, data);
}

service.fanList = (data) => {
  let apiUrl = api + '/usr/fans.json';
  return http.get(apiUrl,data);
}

service.focus = (data) => {
  let apiUrl = api + '/usr/focus.json';
  return http.get(apiUrl,data);
}

service.userUpdate = (data) => {
  let apiUrl = api + '/usr/update.json';
  return http.post(apiUrl, data);
}
// --我的交易--
service.payRecord = () => {
  let apiUrl = api + '/usr/payRecord.json';
  return http.post(apiUrl);
}

service.buyCardRecord = () => {
  let apiUrl = api + '/usr/buyCardRecord.json';
  return http.post(apiUrl);
}

// --------------------------------------------card-----------------------------------
/*获取卡列表*/
service.listCards = (data) => {
  let apiUrl = api + '/card/listCards.json';
  return http.post(apiUrl, data);
}

/*获取卡包详情*/
service.getCardPackage = (data) => {
  let apiUrl = api + '/card/getCardPackage.json';
  return http.get(apiUrl,data);
}

/*获取卡详情*/
service.getCard = () => {
  let apiUrl = api + '/card/getCard.json';
  return http.post(apiUrl);
}

/*------------------------------------------wallet----------------------------------------*/
service.getWallet = (data) => {
  let apiUrl = api + '/wallet/balance.json';
  return http.post(apiUrl, data);
}

service.walletRecord = (data) => {
  let apiUrl = api + '/wallet/record.json';
  return http.post(apiUrl, data);
}

/*--------------------------------------------卡包----------------------------------------*/
service.listCardPackage = () => {
  let apiUrl = api + '/card/listCardPackage.json';
  return http.get(apiUrl);
}

//------------我的卡 -----------
service.getMyCardPackage = () => {
  let apiUrl = api + '/card/mycards.json';
  return http.get(apiUrl);
}

//------------我的卡 -----------
service.getShareCard = (data) => {
  let apiUrl = api + '/card/getShareCards.json';
  return http.get(apiUrl,data);
}

//------------共享/取消共享卡 -----------
service.cardShare = (data) => {
  let apiUrl = api + '/usr/share.json';
  return http.post(apiUrl, data);
}
//---------------卡使用日志 -----------
service.cardShareLog = (data) => {
  let apiUrl = api + '/usr/shareLog.json';
  return http.post(apiUrl, data);
}
//------------------------------------------coin--------------------------------------
service.coinIndex = () => {
  let apiUrl = api + '/coin/coinIndex.json';
  return http.get(apiUrl);
}
service.listRules = () => {
  let apiUrl = api + '/coin/listRules.json';
  return http.get(apiUrl);
}
service.listRecords = () => {
  let apiUrl = api + '/coin/listRecords.json';
  return http.get(apiUrl);
}
service.signIn = () => {
  let apiUrl = api + '/coin/signIn.json';
  return http.get(apiUrl);
}
service.getMyInfo = () => {
  let apiUrl = api + '/usr/index.json';
  return http.get(apiUrl);
}

service.commentOrder = (data) => {
  let apiUrl = api +'/comment/comment.json'
  return http.post(apiUrl,data);
}

module.exports = {
  service: service
}