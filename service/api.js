import request from "./network.js";

// 查询所在城市是否支持
export function checkServiceCity(province, city) {
  return request({
    url: "/api/home/checkServiceCity",
    data: {
      province,
      city,
    },
  });
}

// 登录，获取token
export function MINI_PROGRAMMER(password) {
  return request({
    url: "/api/login/MINI_PROGRAMMER",
    method: "post",
    data: {
      password,
    },
  });
}

// 获取优惠卷列表
export function getCouponList(useStatus) {
  return request({
    url: "/api/personal/getCouponList",
    data: {
      useStatus,
    },
  });
}
// 点击领取优惠券
export function receiveCoupon() {
  return request({
    url: "/api/personal/receiveCoupon",
  });
}

// 获取颜色字典
export function getCarColorList() {
  return request({
    url: "/api/home/getCarColorList",
  });
}
// 获取汽车车型字典
export function getCarTypeList() {
  return request({
    url: "/api/home/getCarTypeList",
  });
}
// 车辆信息-新增-修改
export function saveCarInfo(data) {
  return request({
    url: "/api/car/saveCarInfo",
    method: "post",
    data: data,
  });
}
// 车辆信息-车辆信息列表
export function getCarList() {
  return request({
    url: "/api/car/getCarList",
  });
}
// 车辆信息-删除
export function deleteCarInfo(carId) {
  return request({
    url: "/api/car/deleteCarInfo/" + carId,
    method: "post",
  });
}
//洗车价格查询
export function selectPrice(data) {
  return request({
    url: "/api/home/selectPrice",
    data: data,
  });
}
//获取洗护类型列表
export function getWashProtectList() {
  return request({
    url: "/api/home/getWashProtectList",
  });
}
//车位信息-新增修改
export function saveTruckSpace(data) {
  return request({
    url: "/api/car/saveTruckSpace",
    data: data,
    method: "post",
  });
}
//车位信息-列表查询
export function getTruckSpaceList() {
  return request({
    url: "/api/car/getTruckSpaceList",
  });
}
//车位信息-删除
export function deleteTruckSpace(addressid) {
  return request({
    url: "/api/car/deleteTruckSpace/" + addressid,
    method: "post",
  });
}
//创建订单
export function createOrder(data) {
  return request({
    url: "/api/order/createOrder",
    method: "post",
    data: data,
  });
}
//订单支付
export function getPrepayInfo(orderNumber) {
  return request({
    url: "/api/wechatPay/getPrepayInfo/" + orderNumber,
    method: "post",
  });
}
//支付状态查询
export function queryOrder(orderNumber) {
  return request({
    url: "/api/wechatPay/queryOrder/" + orderNumber,
    method: "post",
  });
}
//取消订单
export function cancelOrderUser(orderNumber) {
  return request({
    url: "/api/order/cancelOrderUser/" + orderNumber,
    method: "post",
  });
}
//评价新增
export function addEvaluate(data) {
  return request({
    url: "/api/order/addEvaluate",
    method: "post",
    data: data,
  });
}
//订单列表
export function getOrderList(data) {
  return request({
    url: "/api/personal/getOrderList",
    data: data,
  });
}
//订单列表当前订单-是否有进行中订单
export function getUserOrderNow() {
  return request({
    url: "/api/home/getUserOrderNow",
  });
}
//获取洗车侠位置
export function getWasherLocation(orderId) {
  return request({
    url: "/api/home/getWasherLocation/" + orderId,
  });
}
//获取洗车侠电话
export function getWasherPhone(orderId) {
  return request({
    url: "/api/order/getWasherPhone/" + orderId,
  });
}
//打开智能柜-用户
export function openDoor(orderId,cabinetId) {
  return request({
    url: "/api/order/openDoor/" + orderId+'?cabinetId='+cabinetId,
    method: "post",
  });
}
//订单信息-详情
export function getOrderService(orderId) {
  return request({
    url: "/api/order/getOrderService/" + orderId,
  });
}
//订单信息-详情
export function finishOrder(orderId) {
  return request({
    url: "/api/order/finishOrder/" + orderId,
    method: "post",
  });
}
//校验是否有空余柜门-通用
export function checkDoor(cabinetId) {
  return request({
    url: "/api/order/checkDoor/" + cabinetId,
  });
}


//第三方接口
export const getCityByLatAndLong = (latitude, longitude, task) => {
  return new Promise(resolve => {
    const TaskNow = wx.request({
      url: "https://apis.map.qq.com/ws/geocoder/v1/?location=",
      method: "GET",
      data: {
        location: latitude + "," + longitude,
        key: "HYPBZ-DEPWF-I3DJV-N5DAQ-TQ5C2-DNB36",
      },
      success(d) {
        try {
          resolve(d.data.result);
        } catch (error) {
          resolve({});
        }
      },
    });
    task && task(TaskNow);
  });
};
