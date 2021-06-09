import {
  getOrderList,
  cancelOrderUser,
  getCarTypeList,
  getCarList
} from '../../service/api.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderQuery: {
      pageNum: 1,
      pageSize: 4,
      orderStatus: 1
    },
    outList: ['车身', '玻璃', '轮毂', '轮胎', '上光'],
    globalList: ['车身', '玻璃', '轮毂', '轮胎', '中控台', '上光', '座椅', '出风口', '脚垫', '仪表盘'],
    orderList: {}
  },
     // 跳转到详情页
     toDetail(e) {
      wx.setStorageSync('ORDERFORM',e.currentTarget.dataset.orderform)
      wx.navigateTo({
        url: '/pages/' + e.currentTarget.dataset.url + '/' + e.currentTarget.dataset.url+'?orderId='+e.currentTarget.dataset.orderid,
      })
    },
  // 取消订单
  cancelOrder(e) {
    const orderid = e.currentTarget.dataset.orderid
    const that = this
    cancelOrderUser(orderid).then(res => {
      that.getOrderList()
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrderList()
  },

  getOrderList() {
    getOrderList(this.data.orderQuery).then(res => {
      const orderList = res.rows
      if (orderList.length > 0) {
        getCarTypeList().then(res => {
          orderList.forEach((v, i) => {
            res.data.forEach(k => {
              if (v.carType == k.dictValue) {
                v.carTypeText = k.dictLabel
              }
            })
          })
          this.setData({
            orderList
          })
        })
        getCarList().then(res=>{
          orderList.forEach((v, i) => {
            res.data.forEach(k => {
              if (v.carId == k.carId) {
                v.plateNumber= k.plateNumber
              }
            })
          })
          this.setData({
            orderList
          })
        })
      }
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
    this.setData({
      ['orderQuery.pageNum']: --this.data.orderQuery.pageNum
    })
    this.getOrderList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      ['orderQuery.pageNum']: ++this.data.orderQuery.pageNum
    })
    this.getOrderList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})