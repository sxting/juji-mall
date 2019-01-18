import {
  constant
} from 'utils/constant';
import {
  http
} from 'utils/http';
let service = {};
let api = constant.apiUrl;
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

//买卡
service.buyCard = (data) => {
  let apiUrl = api + '/order/preBuyCard.json';
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
  let apiUrl = api + '/usr/info.json';
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