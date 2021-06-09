let QQMapWX = require("../../libs/qqmap-wx-jssdk.min");
let qqmapsdk;
var config = require("../../libs/config.js");
let app = getApp();
import {
  checkServiceCity,
  receiveCoupon,
  selectPrice,
  getCouponList,
  getWashProtectList,
  createOrder,
  getPrepayInfo,
  cancelOrderUser,
  queryOrder,
  getUserOrderNow,
  getWasherLocation,
  getWasherPhone,
  openDoor,
  getCarList,
  getCarTypeList,
  finishOrder,
  checkDoor,
  getCityByLatAndLong,
} from "../../service/api.js";
//偏移量
const IvEnum = 0.06;
//计算
const calculationDegrees = (d, t) => (t ? d - IvEnum : d + IvEnum);
//转换偏移量
const parseIv = ({
  longitude,
  latitude
}, type) => ({
  longitude: calculationDegrees(longitude, type),
  latitude: calculationDegrees(latitude, type),
});
let isRequestOver = false

let requestTask = undefined;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    nickName: "",
    avatarUrl: "",
    latitude: undefined,
    longitude: undefined,
    status: app.globalData.status,
    oldStatus: 0,
    mapContentText: "",
    price: "待确认", //价格
    selectHeight: "33vh",
    mapScale: 16,
    tabs: [{
        id: 0,
        name: "定位洗车",
        isActive: true,
      },
      {
        id: 1,
        name: "智能柜洗车",
        isActive: false,
      },
    ],
    washText: ["车身", "玻璃", "轮毂", "轮胎", "上光"],
    carInfo: "", //车辆信息
    washBtn: [{
        title: "精致外洗(48)",
        isActive: true,
      },
      {
        title: "全车洗护(68)",
        isActive: false,
      },
    ],
    carForm: {
      orderType: 1,
      locationArea: "", //洗车区域
      carId: "", //车辆ID
      washProtect: "", //洗护类型
      locationFloor: "", //停车地址地上还是地上
      locationDetail: "", //停车地址
      price: "待确认",
    },
    topBottom: ["地上", "地下"],
    dredge: true, //本地是否开通服务
    isCoupon: false, //是否有优惠券
    markers: [],
    receivedOrder: {},
    isSubscriptionsSetting: false, //是否订阅
    lastOrder: {},
    realTime: null, //定时器
    waitOrder: {}, //等待接单
    oldOrderStatus: undefined, //用于在定时器中判断是否状态改变
    oldCarKeyStatus: undefined, //用于在定时器中判断是否钥匙状态改变
    cabinetId: app.globalData.cabinetId, //智能柜id
    route: "",
    MapContext: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this;
    var key = config.Config.keyT;
    const pages = getCurrentPages(); //页面对象
    const prevpage = pages[pages.length - 2]; //上一个页面对象
    let route = "";
    if (pages.length > 1) {
      route = prevpage.route || "";
    }
    options.cabinetId  = 456
    if(!app.globalData.cabinetId&&options.q){
      app.globalData.cabinetId = this.getQueryVariable("id",decodeURIComponent(options.q));
    }
    // console.log(app.globalData.cabinetId,'初始化时候appData')

    if(app.globalData.cabinetId){
      // console.log(cabinetId,'有智能柜id')
      // app.globalData.cabinetId = cabinetId
      this.setData({
        cabinetId:  app.globalData.cabinetId,
        status:1
      })
    }
    qqmapsdk = new QQMapWX({
      key: key,
    });
    /**
     * 调用内部获取位置，默认为wsg84,精确为gcj02
     */
    if (
      route == "pages/carInfo/carInfo" ||
      route == "pages/parkInfo/parkInfo"
    ) {
      const carForm = app.globalData.carForm;
      const isCoupon = app.globalData.isCoupon;
      const markers = app.globalData.markers;
      const status = app.globalData.status;
      this.setData({
        status,
        carForm,
        longitude: carForm.longitude,
        latitude: carForm.latitude,
        isCoupon,
        markers,
        route,
      });
    }

    wx.getLocation({
      type: "gcj02",
      success: function (res) {
        // 获取省市地址
        qqmapsdk.reverseGeocoder({
          location: res.latitude + "," + res.longitude,
          success: function (niRes) {
            console.log(niRes.result);
            const {
              province,
              city
            } = niRes.result.address_component;
            checkServiceCity(province, city)
              .then(cityRes => {
                if (cityRes.code == 500) {
                  that.setData({
                    dredge: false,
                  });
                  wx.showToast({
                    title: cityRes.msg,
                    icon: "none",
                    mask: true,
                    duration: 30000,
                  });
                }
              })
              .then(() => {
                if (
                  route != "pages/carInfo/carInfo" &&
                  route != "pages/parkInfo/parkInfo"
                ) {
                  that.setData({
                    latitude: res.latitude,
                    longitude: res.longitude,
                  });
                }
              })
              .then(() => {
                that.getOrderNow();
              });
          },
        });
      },
    });

    // 获取是否订阅
    wx.getSetting({
      withSubscriptions: true,
      success(res) {
        var itemSettings = res.subscriptionsSetting.itemSettings;
        if (itemSettings) {
          if (
            itemSettings["ke5GCWLKWWNEIhBZicXAxPnlt66cIqhLg5JY6Sf4fA4"] ===
            "accept"
          ) {
            that.setData({
              isSubscriptionsSetting: true,
            });
          } else {
            that.setData({
              isSubscriptionsSetting: false,
            });
          }
        }
      },
    });
  },
  onShow() {
    var that = this;
    // 获取头像
    if (wx.getStorageSync("USERINFO")) {
      const {
        nickName,
        avatarUrl
      } = wx.getStorageSync("USERINFO");
      // 获取车辆信息
      var carInfo = {};
      var parkInfo = {};
      if (wx.getStorageSync("ADDCARINFO")) {
        carInfo = wx.getStorageSync("ADDCARINFO");
      }
      // 获取停车地址
      if (wx.getStorageSync("PARKINFO")) {
        parkInfo = wx.getStorageSync("PARKINFO");
      }
      getUserOrderNow().then(res => {
        console.log(res);
      });
      that.data.realTime = setInterval(() => {
        that.getOrderNow();
      }, 5000);
      console.log(parkInfo.locationDetail);
      this.setData({
        realTime: that.data.realTime,
        ["carForm.plateNumber"]: carInfo.plateNumber || "",
        ["carForm.carId"]: carInfo.carId || "",
        ["carForm.carTypeText"]: carInfo.carTypeText,
        ["carForm.name"]: carInfo.name,
        ["carForm.phone"]: carInfo.phone,
        ["carForm.phone"]: carInfo.phone,
        ["carForm.locationFloor"]: parkInfo.locationFloor || "",
        ["carForm.locationDetail"]: parkInfo.locationDetail || "",
        nickName,
        avatarUrl,
      });
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const MapContext = wx.createMapContext("map");
    this.setData({
        MapContext,
      },
      () => {
        const {
          route
        } = this.data;
        if (this.data.status == 0 || this.data.status == 1) {
          if (
            route != "pages/carInfo/carInfo" &&
            route != "pages/parkInfo/parkInfo"
          ) {
            this.getLngLat();
          }
        }
      }
    );
  },
  onUnload() {
    clearInterval(this.data.realTime);
  },
  onHide() {
    clearInterval(this.data.realTime);
  },
  /**
   * 获取中间点的经纬度，并mark出来
   */
  getLngLat() {
    let that = this;
    const {
      latitude,
      longitude
    } = this.data;
    that.mapCtx = wx.createMapContext("map");
    that.mapCtx.getCenterLocation({
      success: function (res) {
        console.log(res, 222222);
        that.setData({
          markers: [
            // {
            //   id: 0,
            //   iconPath: "/static/img/home/chezhu.png",
            //   longitude: res.longitude,
            //   latitude: res.latitude,
            //   width: 60,
            //   height: 60,
            // },
          ],
        });
        if (latitude) {
          that.getPoiList(res.longitude, res.latitude);
        }
      },
    });
  },
  /**
   * 视野发生变化时触发：见页面bindregionchange事件
   */
  regionchange(e) {
    console.log(this.data.lastOrder.status)
    if ((this.data.status == 0||this.data.status == 1)&&!this.data.lastOrder.status) {
      console.log(this.data.status+'我是status')
      console.log(this.data.latitude,this.data.longitude,'视野变化的地址')
      console.log(this.data.status+'我是status')
      e.type == "end" ? this.getLngLat() : this.getLngLat();
      this.mapChange(e);
    }
  },
  getQueryVariable(variable, url) {
    var query = url.split("?")[1];
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] == variable) {
        return pair[1];
      }
    }
    return false;
  },
  // 用于获取地图上的地址名称,即详细地址
  getPoiList(longitude, latitude) {
    const that = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude,
      },
      get_poi: 1,
      poi_options: "policy=2;radius=3000;page_size=2;page_index=1",
      success: function (res) {
        that.setData({
          // ["carForm.locationArea"]: res.result.pois[0].title,
        });
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {},
    });
  },
  // 获取订单状态
  getOrderNow() {
    var that = this;
    const status = this.data.status;
    // 如果判断是否初次登录，则无法轮询
    // && app.globalData.isFirst
    if (
      wx.getStorageSync("TOKEN") &&
      wx.getStorageSync("USERINFO") &&
      status != 1 &&
      status != 3
    ) {
      app.globalData.isFirst = false;
      getUserOrderNow().then(res => {
        const lastOrder = res.data[res.data.length - 1];
        var status = "";
        var selectHeight = "";
        // that.data.oldOrderStatus!=2&&
        if (
          that.data.oldOrderStatus != lastOrder.orderStatus ||
          that.data.oldCarKeyStatus != lastOrder.carKeyStatus
        ) {
          if (that.data.status != 0 && that.data.status != 1) {
            that.setData({
              oldOrderStatus: lastOrder.orderStatus,
              oldCarKeyStatus: lastOrder.carKeyStatus,
            });
          }

          if (lastOrder.orderStatus == 1) {
            status = 4;
            that.getWaitOrder(lastOrder);
            that.setData({
              carForm: lastOrder,
            });
          }
          console.log(lastOrder.orderStatus,'最新订单状态')
          if (lastOrder.orderStatus == 2) {
            // 获取师傅位置
            // setInterval(()=>{
            let masterLatitude = "";
            let masterLongitude = "";
            //注意，如果没有洗车侠的位置，则会报错
            getWasherLocation(lastOrder.orderId).then(res => {
              masterLatitude = res.data.latitude;
              masterLongitude = res.data.longitude;
              console.log(masterLatitude,masterLongitude,'师傅的位置')
              status = 5;
              selectHeight = "42vh";
              //调用距离计算接口
              qqmapsdk.direction({
                mode: "driving", //可选值：'driving'（驾车）、'walking'（步行）、'bicycling'（骑行），不填默认：'driving',可不填
                //from参数不填默认当前地址
                from: {
                  // 师傅的位置
                  latitude: masterLatitude,
                  longitude: masterLongitude,
                },
                // 去订单位置
                to: {
                  latitude: lastOrder.latitude,
                  longitude: lastOrder.longitude,
                },
                success: function (res) {
                  var ret = res;
                  var coors = ret.result.routes[0].polyline,
                    pl = [];
                  //坐标解压（返回的点串坐标，通过前向差分进行压缩）
                  var kr = 1000000;
                  for (var i = 2; i < coors.length; i++) {
                    coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
                  }
                  //将解压后的坐标放入点串数组pl中
                  for (var i = 0; i < coors.length; i += 2) {
                    pl.push({
                      latitude: coors[i],
                      longitude: coors[i + 1],
                    });
                  }
                  //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
                  that.setData({
                      ["receivedOrder.duration"]: res.result.routes[0].duration,
                      ["receivedOrder.distanceKm"]: (res.result.routes[0].distance / 1000).toFixed(1),
                      ["receivedOrder.distanceMeter"]: res.result.routes[0].distance,
                      ["receivedOrder.orderId"]: lastOrder.orderId,
                      status,
                      latitude: pl[0].latitude,
                      longitude: pl[0].longitude,
                      polyline: [{
                        points: pl,
                        color: "#30b977",
                        arrowLine: true,
                        width: 10,
                      }, ],
                      markers: [{
                          iconPath: "../../static/img/home/xichexia.png",
                          id: 0,
                          latitude: lastOrder.latitude,
                          longitude: lastOrder.longitude,
                          width: 40,
                          height: 40,
                        },
                        {
                          iconPath: "../../static/img/home/chezhu.png",
                          id: 1,
                          latitude: masterLatitude,
                          longitude: masterLongitude,
                          width: 40,
                          height: 40,
                        },
                      ],
                    },
                    () => {
                      // !isRequestOver && (isRequestOver = true)
                      that.getCentralPoint(pl)
                    }
                  );
                },
                fail: function (error) {
                  console.log(error);
                },
                complete: function (res) {
                  console.log(res);
                },
              });
            });
            // },30000)
          }else{
            that.setData({
              polyline: [{}],
              markers: [],
            }
          );
          }
          if (lastOrder.orderStatus == 3) {
            //已拿到钥匙，洗车中
            status = 6;
            selectHeight = "52vh";
          }
          if (lastOrder.orderStatus == 4) {
            //结束洗车，车主未还回钥匙
            status = 6;
            selectHeight = "52vh";
          }
          that.setData({
            lastOrder,
            status,
            selectHeight,
          });
        }
      });
    }
  },
  // 等待接单取消订单
  getWaitOrder(lastOrder) {
    const that = this;
    getCarList()
      .then(res => {
        const carInfo = res.data.filter(v => {
          if (v.carId == lastOrder.carId) {
            return v;
          }
        });
        return carInfo[0];
      })
      .then(carInfo => {
        getCarTypeList().then(res => {
          var carTypeText = "";
          res.data.forEach(v => {
            if (v.dictSort == carInfo.carType) {
              carTypeText = v.dictLabel;
            }
          });
          let carForm = lastOrder;
          carForm.carTypeText = carTypeText;
          carForm.plateNumber = carInfo.plateNumber;
          carForm.phone = carInfo.phone;
          carForm.name = carInfo.name;

          that.setData({
            carForm,
          });
        });
      });
  },
  // 联系师傅
  contactMaster() {
    getWasherPhone(this.data.receivedOrder.orderId).then(res => {
      wx.makePhoneCall({
        phoneNumber: res.msg,
      });
    });
  },
  // 快捷洗车和智能柜切换
  handleItemChange(e) {
    var selectHeight = "";
    var orderType = "";
    if (e.detail == 0) {
      selectHeight = "33vh";
      orderType = 1;
      app.globalData.status = 0;
    }
    if (e.detail == 1) {
      selectHeight = "40vh";
      orderType = 2;
      app.globalData.status = 1;
    }
    this.setData({
      ["carForm.orderType"]: orderType,
      selectHeight: selectHeight,
      status: e.detail,
    });
  },
  // 跳转获取洗车地点
  getLocation() {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          ["carForm.locationArea"]: res.name,
          longitude: res.longitude,
          latitude: res.latitude,
          markers: [{
            iconPath: "../../static/img/home/xichexia.png",
            id: 0,
            latitude: res.longitude,
            longitude: res.latitude,
            width: 60,
            height: 60,
          }, ],
        });
        that.getPoiList(res.longitude, res.latitude);
      },
    });
  },
  // 跳转
  toLink(e) {
    if (
      e.currentTarget.dataset.url == "carInfo" ||
      e.currentTarget.dataset.url == "parkInfo"
    ) {
      app.globalData.carForm = this.data.carForm;
      app.globalData.carForm.longitude = this.data.longitude;
      app.globalData.carForm.latitude = this.data.latitude;
      app.globalData.markers = this.data.markers;
      app.globalData.isCoupon = this.data.isCoupon;
      app.globalData.status = this.data.status;
    }
    wx.navigateTo({
      url: "/pages/" +
        e.currentTarget.dataset.url +
        "/" +
        e.currentTarget.dataset.url,
    });
  },
  //改变状态
  changeStatus(e) {
    var selectHeight = "";
    if (e.currentTarget.dataset.status == 0) {
      selectHeight = "33vh";
    }
    if (e.currentTarget.dataset.status == 1) {
      selectHeight = "40vh";
    }
    if (e.currentTarget.dataset.status == 3) {
      selectHeight = "63vh";
      const washText = ["车身", "玻璃", "轮毂", "轮胎", "上光"];
      getWashProtectList().then(res => {
        let washBtn = res.data;
        washBtn[0].isActive = true;
        this.setData({
          ["carForm.washProtect"]: washBtn[0].dictValue,
          washBtn,
          washText,
        });
      });
    }
    this.setData({
      selectHeight: selectHeight,
      oldStatus: this.data.status,
      status: e.currentTarget.dataset.status,
    });
  },
  // 洗护类型切换
  washItemTap(e) {
    // 接收传递过来的参数
    const index = e.currentTarget.dataset.index;
    let {
      washBtn
    } = this.data;
    this.data.washBtn.forEach((v, i) => {
      if (i == index) {
        v.isActive = true;
      } else {
        v.isActive = false;
      }
      var washText = [];
      if (index == 0) {
        washText = ["车身", "玻璃", "轮毂", "轮胎", "上光"];
      }
      if (index == 1) {
        washText = [
          "车身",
          "玻璃",
          "轮毂",
          "轮胎",
          "出风口",
          "上光",
          "座椅",
          "脚垫",
          "中控台",
          "仪表盘",
        ];
      }
      this.setData({
        washText,
      });
    });
    this.setData({
      washBtn,
      ["carForm.washProtectText"]: washBtn[index].dictLabel,
      ["carForm.washProtect"]: washBtn[index].dictValue,
    });
  },
  // 切换回原来的状态
  backStatus(e) {
    var selectHeight = "";
    if (this.data.oldStatus == 0) {
      selectHeight = "33vh";
    }
    if (this.data.oldStatus == 1) {
      selectHeight = "40vh";
    }
    // 取消订单
    if (e.currentTarget.dataset.effect == "cancel") {
      cancelOrderUser(this.data.carForm.orderId).then(res => {});
    }
    this.setData({
      selectHeight: selectHeight,
      status: this.data.oldStatus,
    });
  },
  // 结束洗车
  finishOrder() {
    finishOrder(this.data.lastOrder.orderId).then(res => {
      this.setData({
        lastOrder: {},
        status: 0,
      });
    });
  },
  // 洗护类型确认
  washVerify() {
    var washProtect = [];
    var selectHeight = "";
    if (this.data.oldStatus == 0) {
      selectHeight = "33vh";
    }
    if (this.data.oldStatus == 1) {
      selectHeight = "40vh";
    }
    washProtect = this.data.washBtn.filter(v => {
      return v.isActive == true;
    });
    if (this.data.carForm.carId) {
      const data = {
        carId: this.data.carForm.carId,
        washProtect: this.data.carForm.washProtect,
      };
      // 获取价格
      selectPrice(data).then(res => {
        const price = res.data;
        const original = price + 20;
        this.setData({
          ["carForm.price"]: price,
          ["carForm.original"]: original,
        });
      });
      // 获取是否有可使用优惠卷
      getCouponList(0).then(res => {
        if (res.data.length != 0) {
          const isCoupon = true;
          const couponId = res.data.id;
          this.setData({
            ["carForm.couponId"]: couponId,
            isCoupon,
          });
        }
      });
    }
    this.setData({
      selectHeight: selectHeight,
      ["carForm.washProtectText"]: washProtect[0].dictLabel,
      ["carForm.washProtect"]: washProtect[0].dictValue,
      status: this.data.oldStatus,
    });
  },
  bindPickerChange: function (e) {
    this.setData({
      ["carForm.locationFloor"]: this.data.topBottom[e.detail.value],
    });
  },
  // 创建订单
  createOrder(carForm) {
    const that = this;
    console.log(app.globalData.cabinetId,'创建订单appData')
    createOrder(carForm).then(res => {
      var orderId = res.data.orderId;
      var orderNumber = res.data.orderNumber;
      getPrepayInfo(res.data.orderNumber).then(res => {
        if (res.code == 200) {
          wx.requestPayment({
            timeStamp: res.data.timeStamp,
            nonceStr: res.data.nonceStr,
            package: res.data.package,
            signType: res.data.signType,
            paySign: res.data.paySign,
            success(res) {
              queryOrder(orderNumber).then(res => {
                if (app.globalData.cabinetId) {
                  console.log(orderId,'开门之前OrderId');
                  console.log(app.globalData.cabinetId,'开门之前cabinetId');
                  openDoor(orderId,app.globalData.cabinetId).then(res => {
                    console.log(res,'开门接口');
                  });
                }
                // lastOrder = that.data.carForm
                carForm.orderId = orderId;
              });
              that.setData({
                ["carForm.orderNumber"]: orderNumber,
                selectHeight: "35vh",
                oldStatus: that.data.status,
                carForm,
                status: 4,
              });
            },
            fail(res) {
              console.log("支付出错");
            },
          });
        }
      });
    });
  },
  // 上门洗车
  drop() {
    const that = this;
    var carForm = this.data.carForm;
    // var lastOrder = {}
    carForm.orderType = 1;
    // carForm.latitude = this.data.latitude;
    // carForm.longitude = this.data.longitude;

    if (!this.data.subscriptionsSetting) {
      // 未订阅
      wx.showModal({
        content: "是否订阅接单完成消息提醒？",
        success(res) {
          if (res.confirm) {
            //调用订阅消息
            wx.requestSubscribeMessage({
              tmplIds: ["ke5GCWLKWWNEIhBZicXAxPnlt66cIqhLg5JY6Sf4fA4"],
              success(res) {
                //订阅成功
                that.createOrder(carForm);
              },
              fail(res) {
                console.log(res);
                if (res.errCode == 20004) {
                  wx.showModal({
                    content: "用户关闭了消息订阅主开关，是否前往打开？",
                    cancelText: "直接下单",
                    success(res) {
                      wx.openSetting({
                        withSubscriptions: true,
                        success(res) {
                          console.log(res.authSetting);
                        },
                      });
                    },
                    fail(res) {
                      // on cancel
                      console.log("用户点击取消");
                      that.createOrder(carForm);
                    },
                  });
                }
              },
            });
          } else if (res.cancel) {
            console.log("用户点击取消");
            that.createOrder(carForm);
            // that.onScanCode(event)
          }
        },
      });
    } else {
      // 已订阅
      that.onScanCode(event);
    }
  },
  // 获取输入地址
  changeLocationDetail: function (e) {
    this.setData({
      ["carForm.locationDetail"]: e.detail.value,
    });
  },
  // 领取优惠券
  couponTap() {
    var isCoupon = false;
    // 获取是否有优惠券
    getCouponList(0).then(res => {
      if (res.data.length == 0) {
        getCouponList(1).then(res => {
          if (res.data.length == 0) {
            // 若未使用和已使用都为0 ，则认为是空
            receiveCoupon().then(res => {
              if (res.data) {
                wx.showToast({
                  title: "领取成功",
                  icon: "none",
                  mask: true,
                  duration: 1500,
                });
              }
            });
          } else {
            wx.showToast({
              title: "请勿重复领取",
              icon: "none",
              mask: true,
              duration: 1500,
            });
          }
        });
      } else {
        wx.showToast({
          title: "请勿重复领取",
          icon: "none",
          mask: true,
          duration: 1500,
        });
      }
    });
  },
  // 使用智能柜打开
  onScanCode() {
    console.log(app.globalData.cabinetId,'智能柜打开appData')

    console.log(app.globalData.cabinetId);
    var that = this;
    var carForm = this.data.carForm;
    carForm.cabinetId = app.globalData.cabinetId;
    carForm.orderType = 2;
    carForm.latitude = this.data.latitude;
    carForm.longitude = this.data.longitude;
    console.log(app.globalData.cabinetId,'我是智能柜id')
    checkDoor(app.globalData.cabinetId).then(res => {
      console.log(res);
      if (res.data) {
        if (!this.data.subscriptionsSetting) {
          // 未订阅
          wx.showModal({
            content: "是否订阅接单完成消息提醒？",
            success(res) {
              if (res.confirm) {
                //调用订阅消息
                wx.requestSubscribeMessage({
                  tmplIds: ["ke5GCWLKWWNEIhBZicXAxPnlt66cIqhLg5JY6Sf4fA4"],
                  success(res) {
                    //订阅成功
                    that.createOrder(carForm);
                  },
                  fail(res) {
                    console.log(res);
                    if (res.errCode == 20004) {
                      wx.showModal({
                        content: "用户关闭了消息订阅主开关，是否前往打开？",
                        cancelText: "直接下单",
                        success(res) {
                          wx.openSetting({
                            withSubscriptions: true,
                            success(res) {
                              console.log(res.authSetting);
                            },
                          });
                        },
                        fail(res) {
                          // on cancel
                          console.log("用户点击取消");
                          that.createOrder(carForm);
                        },
                      });
                    }
                  },
                });
              } else if (res.cancel) {
                console.log("用户点击取消");
                that.createOrder(carForm);
              }
            },
          });
        } else {
          // 已订阅
          that.createOrder(carForm);
        }
      } else {
        wx.showToast({
          title: "抱歉，智能柜已满",
          icon: "none",
          mask: true,
          duration: 1500,
        });
      }
    });

    // wx.scanCode({
    //   onlyFromCamera: true, // 是否只能从相机扫码，不允许从相册选择图片
    //   success(res) {
    //     console.log(JSON.parse(res.result))
    //   }
    // })
  },
  // 取出钥匙
  takeKey() {
    const that = this;
    openDoor(this.data.lastOrder.orderId).then(res => {
      console.log("以取出");
      that.getOrderNow();
    });
  },
  //更改当前
  async getCentralPoint(pl) {
    console.log(pl);
    const MapContext = this.data.MapContext;
    //深拷贝
    const pointerList = JSON.parse(JSON.stringify(pl));
    //路径最后一位index
    const substitutionL = pointerList.length - 1;
    //起点偏移量
    pointerList[0] = parseIv(pointerList[0], true);
    //终点偏移量
    pointerList[substitutionL] = parseIv(pointerList[substitutionL], false);
    //展示
    //动态切换显示内容
    MapContext.includePoints({
      points: pointerList,
    });
  },
  mapChange({
    detail
  }) {
    if (detail.type === "begin") {
      //开始
      this.setData({
        mapContentText: "",
      });
      return;
    }
    this.setData({
        mapContentText: "",
      },
      () => {
        // 获取到map实例
        const MapContext = this.data.MapContext;
        //获取map中心点距离
        MapContext.getCenterLocation({
          success: async ({
            longitude,
            latitude
          }) => {
            //调用第三方 根据经纬度获取到位置
            try {
              const {
                formatted_addresses
              } = await getCityByLatAndLong(
                latitude,
                longitude,
                task => {
                  requestTask && requestTask.abort();
                  requestTask = task;
                }
              );
              requestTask = undefined;
              setTimeout(() => {
                //如果有数据则赋值
                const title = formatted_addresses ? formatted_addresses.recommend : undefined
                console.log(longitude)
                this.setData({
                  mapContentText: title,
                  ['carForm.locationArea']: title,
                  ['carForm.longitude']: longitude,
                  ['carForm.latitude']: latitude
                });
              }, 500);
            } catch (error) {}
          },
        });
      }
    );
  },
});