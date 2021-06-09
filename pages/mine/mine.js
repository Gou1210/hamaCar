let app = getApp();
import {
  MINI_PROGRAMMER,
  getOrderList
} from '../../service/api.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '',
    nickName:'',
    totalArr:['0','0','0','0']
  },

  loginTap() {
    const that = this
    wx.login({
      success(res) {
        if (res.code) {
          MINI_PROGRAMMER(res.code).then((loginRes) => {
            if(loginRes.code==200){
             // 抽取token
            const {
              data: token
            } = loginRes
            // 存到全局中
            app.globalData.token = token
            // 存储到本地
            wx.setStorage({
              key: 'TOKEN',
              data:token,
            })
            }else{
              wx.showToast({
                title: '登录出错,服务器验证失败',
                icon: 'none',
                mask: true,
                duration:1500
              })
            }
          })
        } else {
          wx.showToast({
            title: '登录失败',
            icon: 'none',
            mask: true,
            duration:1500
          })
        }
      }
    })
      wx.getUserProfile({
        desc: '用于蛤蟆洗车获取您的资料',
        success: (res) => {
          console.log(res)
        const {userInfo} = res
        wx.setStorage({
          key:'USERINFO',
          data:userInfo
        })
          that.setData({
            nickName:userInfo.nickName,
            avatarUrl:userInfo.avatarUrl
          })
        },
        fail:(res)=>{
          console.log(res)
          wx.showToast({
            title: '获取信息失败',
            icon: 'none',
            mask: true,
            duration:1500
          })
        }
      })
  },
  // 退出登录
  quit(){
    wx.removeStorageSync('TOKEN')
    wx.removeStorageSync('USERINFO')
    this.setData({
      avatarUrl: '',
      nickName:''
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(wx.getStorageSync('USERINFO')){
        const {nickName,avatarUrl} = wx.getStorageSync('USERINFO')
        this.setData({
          nickName,
          avatarUrl
        })
    }
    const  orderQuery = [{pageNum: 1,pageSize: 1,orderStatus:1},{pageNum: 1,pageSize: 1,orderStatus:234},{pageNum: 1,pageSize: 1,orderStatus:5},{pageNum: 1,pageSize: 1,orderStatus:7}]

        Promise.all([getOrderList(orderQuery[0]),getOrderList(orderQuery[1]),getOrderList(orderQuery[2]),getOrderList(orderQuery[3])]).then(res=>{
          console.log(res)
          this.setData({
            totalArr:res
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

  },
  // 跳转
  toLink(e) {
    wx.navigateTo({
      url: '/pages/' + e.currentTarget.dataset.url + '/' + e.currentTarget.dataset.url,
    })
  },
  // 拨打电话
  toPhone() {
    wx.makePhoneCall({
      phoneNumber: '4001188717'
    })
}
})