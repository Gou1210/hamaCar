// pages/orderDetail/orderDetail.js
import {
  getOrderService,
  getCarTypeList,
  getCarList,
  cancelOrderUser,
  openDoor,
  finishOrder,
  getWasherPhone
} from '../../service/api.js'
import {
  baseURL
} from '../../service/config'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList: [],
    orderForm: {},
    baseURL: baseURL,
    afterImgList: [{
        title: '正面'
      }, {
        title: '左侧'
      }, {
        title: '右侧'
      }, {
        title: '后方'
      }, {
        title: '其他'
      }, {
        title: '其他'
      }, {
        title: '其他'
      },
      {
        title: '其他'
      }
    ],
    beforeImgList: [{
      title: '正面'
    }, {
      title: '左侧'
    }, {
      title: '右侧'
    }, {
      title: '后方'
    }, {
      title: '其他'
    }, {
      title: '其他'
    }, {
      title: '其他'
    }, {
      title: '其他'
    }],
  },
  getKey() {
    const {orderForm} = this.data
    console.log(orderForm)
    if(orderForm.orderStatus==1||orderForm.orderStatus==4){
      openDoor(this.data.orderForm.orderId).then(res=>{
        console.log(res)
      })
    }
  },
  // 结束洗车
  finishOrder() {
    finishOrder(this.data.orderForm.orderId).then(res => {
      wx.navigateTo({
        url: '/pages/serviceorder/serviceorder',
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    // var orderForm = {}
    // getOrderService(options.orderId).then(res => {
      // orderForm = res.data
      // getCarList().then(res => {
      //   const carInfo = res.data.filter(v => {
      //     if (v.carId == orderForm.carId) {
      //       return v
      //     }
      //   })
      //   return (carInfo[0])
      // }).then(carInfo => {
      //   getCarTypeList().then(res => {
      //     var carTypeText = ''
      //     res.data.forEach(v => {
      //       if (v.dictSort == carInfo.carType) {
      //         carTypeText = v.dictLabel
      //       }
      //     })
      //     orderForm.carTypeText = carTypeText
      //     orderForm.plateNumber = carInfo.plateNumber
          let orderForm = wx.getStorageSync('ORDERFORM')
          if (orderForm.afterImg) {
            const afterImgArr = orderForm.afterImg.split(',')
            that.data.afterImgList.forEach((v, i) => {
              v.img = afterImgArr[i]
            })
          }
          if (orderForm.beforeImg) {
            const beforeImgArr = orderForm.beforeImg.split(',')
            that.data.beforeImgList.forEach((v, i) => {
              v.img = beforeImgArr[i]
            })
          }
          const afterImgList = that.data.afterImgList
          const beforeImgList = that.data.beforeImgList
          getWasherPhone(orderForm.orderId).then(res=>{
              this.setData({
                ['orderForm.phone']:res.msg
              })
          })
          that.setData({
            orderForm,
            afterImgList,
            beforeImgList
          })
        // })
    //   })
    // })
  },
      // 联系师傅
      contactMaster() {
        // getWasherPhone(this.data.orderForm.orderId).then(res => {
          wx.makePhoneCall({
            phoneNumber: this.data.orderForm.phone,
          });
        // });
      },
  // 取消订单
  cancelOrder() {
    const orderId = this.data.orderForm.orderId
    cancelOrderUser(orderId).then(res => {
      wx.navigateTo({
        url: '/pages/pendorder/pendorder',
      })
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})