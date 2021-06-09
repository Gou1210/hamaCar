import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import {
  saveTruckSpace,
  getTruckSpaceList
} from '../../service/api.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parkForm: {
      locationFloor: '地上'
    },
    addressName: '',
    topBottom: ['地上', '地下'],
    siteScope: '地上', //停车地址地上还是地上
    siteSpecific: '', //停车地址具体
    rules: {}
  },
  bindPickerChange: function (e) {
    this.setData({
      ['parkForm.locationFloor']: this.data.topBottom[e.detail.value]
    })
  },
  // 获取洗车地点
  getLocation() {
    console.log(11)
    var that = this
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          ['parkForm.locationArea']: res.name,
          ['parkForm.longitude']: res.longitude,
          ['parkForm.latitude']: res.latitude
        })
      }
    })
  },
  changeSiteSpecific: function (e) {
    console.log(e.detail.value)
    this.setData({
      ['parkForm.locationDetail']: e.detail.value
    })
  },
  addPark() {
    console.log(111)
    console.log(this.data.parkForm.locationDetail)
    console.log(222)
    // 地址判断
    if (!this.data.parkForm.locationArea) {
      this.data.rules.isAddressName = true
    } else {
      this.data.rules.isAddressName = false
    }
    // 详细地址判断
    if (!this.data.parkForm.locationDetail) {
      this.data.rules.isSiteSpecific = true
    } else {
      this.data.rules.isSiteSpecific = false
    }
    var rulesArr = []
    for (let i in this.data.rules) {
      rulesArr.push(this.data.rules[i])
    }
    console.log(rulesArr)
    const isAules = rulesArr.every((i) => {
      return i == false
    })
    if (isAules) {
      saveTruckSpace(this.data.parkForm).then(res => {
        wx.navigateTo({
          url: '/pages/parkInfo/parkInfo',
        })
      })
    }
    this.setData({
      rules: this.data.rules
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (this.options.addressId) {
      getTruckSpaceList().then((res) => {
        const parkForm = res.data.filter(v => {
          if (v.addressId == this.options.addressId) {
            return v
          }
        })
        console.log(parkForm[0].locationFloor)
        this.setData({
          parkForm: parkForm[0]
        })
      })

    }
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