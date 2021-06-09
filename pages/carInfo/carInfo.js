import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
const app = getApp();
import {
  getCarList,
  getCarColorList,
  getCarTypeList,
  deleteCarInfo
} from '../../service/api.js'
import {
  baseURL
} from '../../service/config'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    carList: [],
    baseURL: baseURL,
    indicatorDots: false,
    autoplay: false,
    circular: false,
    interval: 2000,
    duration: 100,
    current: '0',
    carId: '',
    carInfo: {

    }
  },

  // 跳转
  toLink(e) {
    wx.navigateTo({
      url: '/pages/' + e.currentTarget.dataset.url + '/' + e.currentTarget.dataset.url,
    })
  },
  toEdit(e) {
    const carId = this.data.carId
    wx.navigateTo({
      url: '/pages/' + e.currentTarget.dataset.url + '/' + e.currentTarget.dataset.url + '?carId=' + carId,
    })
  },
  deleteCar() {
    const that = this
    Dialog.confirm({
        title: '',
        message: '确认删除此车辆信息',
      })
      .then(() => {

        deleteCarInfo(that.data.carId).then(res => {
          if (res.code == 200) {
            wx.removeStorageSync('ADDCARINFO')
            wx.showToast({
              title: '删除成功',
              icon: 'none',
              mask: true,
              duration: 1000
            })
            getCarList().then(res => {
              const carList = res.data.reverse()
              this.setData({
                carList
              })
            })
          }
        })
      })
      .catch(() => {
        console.log("取消删除")
      });
  },

  // 车辆切换
  onChange(event) {
    const carIds = this.data.carList.filter((v, i) => {
      if (i == event.detail.current) {
        return v.carId
      }
    })

    this.setData({
      carId: carIds[0].carId,
      current: event.detail.current
    })
  },

  // 清洗此车
  washCar(e) {
    const {
      carList,
      current
    } = this.data
    wx.setStorageSync('ADDCARINFO', carList[current])
    wx.navigateTo({
      url: '/pages/index/index',
    })
    this.setData({
      carList
    })
  },
  getCarList() {
    getCarList().then(res => {
      const carList = res.data.reverse()
      if (carList.length > 0) {
        carList.forEach((v, i) => {
          if (carList[i].sex == 1) {
            carList[i].sexText = '先生'
          } else {
            carList[i].sexText = '女士'
          }
        })
        getCarColorList().then(res => {
          carList.forEach((v, i) => {
            res.data.forEach(k => {
              if (v.color == k.dictValue) {
                v.colorText = k.dictLabel
              }
            })
          })
          this.setData({
            carList
          })
        })
        getCarTypeList().then(res => {
          carList.forEach((v, i) => {
            res.data.forEach(k => {
              if (v.carType == k.dictValue) {
                v.carTypeText = k.dictLabel
                console.log(v.carTypeText)
              }
            })
          })
          this.setData({
            carList
          })
        })
        this.setData({
          carId: carList[0].carId
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCarList()
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