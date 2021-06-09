// app.js
App({
  onLaunch() {
    // 从缓存中去除token
    const token = wx.getStorageSync('TOKEN')
    // 判断是否取出token
    if(token&&token.length){

    }
  },
  globalData: {
    userInfo: null,
    token:null,
    status:0,
    baseUrl:'http://8.140.163.142:8080',
    isFirst:true,
    isCoupon:false,
    carForm:{},
    markers:[],
    cabinetId:undefined
  }
})
