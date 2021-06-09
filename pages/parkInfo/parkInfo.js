import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import {
  getTruckSpaceList,
  deleteTruckSpace
} from '../../service/api.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressId:'',
    parkInfoData: []
  },
  handleItemChange(e) {
    // 接收传递过来的参数
    const { index,addressid } =e.currentTarget.dataset;
    let { parkInfoData } = this.data;
    parkInfoData.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false);
    this.setData({
      addressId:addressid,
      parkInfoData
    })
  },
  
  deleteCar() {
    Dialog.confirm({
        title: '',
        message: '确认删除此车位信息',
      })
      .then(() => {
          deleteTruckSpace(this.data.addressId).then(res=>{
            if(res.code==200){
              wx.removeStorageSync('PARKINFO')
              getTruckSpaceList().then(res=>{
                const parkInfoData = res.data
                this.setData({
                  parkInfoData
                })
              })
            }
          })
      })
      .catch(() => {
        console.log("取消删除")
      });
  },
  // 使用车位
  usereCar(){
  const parkInfo = this.data.parkInfoData.filter(v=>{
        return v.addressId == this.data.addressId
    })
    wx.setStorageSync('PARKINFO', parkInfo[0])
    wx.navigateTo({
      url: '/pages/index/index',
    })
  },
  // 跳转
    toLink(e) {
      wx.navigateTo({
        url: '/pages/' + e.currentTarget.dataset.url + '/' + e.currentTarget.dataset.url,
      })
    },
  // 修改
  toEdit(e) {
    const addressId = this.data.addressId
      wx.navigateTo({
        url: '/pages/' + e.currentTarget.dataset.url + '/' + e.currentTarget.dataset.url+ '?addressId=' + addressId,
      })
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getTruckSpaceList().then(res=>{
      const parkInfoData = res.data
      if(parkInfoData.length>0){
        const addressId = parkInfoData[0].addressId
        parkInfoData[0].isActive = true
        this.setData({
          addressId,
          parkInfoData
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