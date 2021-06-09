import {
  addEvaluate,
  getCarTypeList,
  getCarList,
  getOrderService
} from '../../service/api.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // assessForm:{},
    orderForm:{},
    evaluatePerson: 3,
    evaluateCompany:3,
    evaluateContent:''
  },
  // 蛤蟆星星
  onHamaStart(e){
    this.setData({
      ['orderForm.evaluateCompany']:e.detail
    })
  },
  // 师傅星星
  onXiaStart(e){
    this.setData({
      ['orderForm.evaluatePerson']:e.detail
    })
  },
  // 评价
  onMessage(e){
    this.setData({
      ['orderForm.evaluateContent']:e.detail
    })
  },
  // 提交评价
  putAssess(){
    console.log(this.data.orderForm)
    addEvaluate(this.data.orderForm).then(res=>{
      wx.navigateTo({
        url: '/pages/finishorder/finishorder',
      })
    })
  },
  // 关闭页面
  close(){
    wx.navigateTo({
      url: '/pages/finishorder/finishorder',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var orderForm = {}
    // var that = this
    // getOrderService(options.orderId).then(res => {

    // getCarList().then(res => {
    //   const carInfo = res.data.filter(v => {
    //     if (v.carId == orderForm.carId) {
    //       return v
    //     }
    //   })
    //   return (carInfo[0])
    // }).then(carInfo => {
      // getCarTypeList().then(res => {
      //   var carTypeText = ''
      //   res.data.forEach(v => {
      //     if (v.dictSort == carInfo.carType) {
      //       carTypeText = v.dictLabel
      //     }
      //   })
      //   orderForm.carTypeText = carTypeText
      //   orderForm.plateNumber = carInfo.plateNumber
        const orderForm = wx.getStorageSync('ORDERFORM')
        this.setData({
          orderForm,
          // ['orderForm.orderId']:options.orderId,
          ['orderForm.isEvaluatePerson']:orderForm.evaluatePerson
        })
  //     })
  //   })
  // })
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

  },
})