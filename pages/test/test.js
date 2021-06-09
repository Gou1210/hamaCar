// pages/test/test.js
// 引入SDK核心类
var QQMapWX =require('../../libs/qqmap-wx-jssdk.min');
 
// 实例化API核心类
var qqmapsdk = new QQMapWX({
    key: 'CPABZ-RJ3L3-UCL3B-3YLIP-TXHD3-GUFCL' // 必填
});
import {
  getWasherLocation
} from '../../service/api.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    longitude:'116.65477',
    latitude:'40.13012'
  },
  formSubmit(e) {
    var that = this;

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getWasherLocation().then(res=>{
      console.log(res)
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