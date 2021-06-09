import {
  baseURL,
  timeout
} from './config.js'
// const AuthorizationApi = wx.getStorageSync('TOKEN') || ''
let app = getApp();

function request(options) {
  // wx.showLoading({
  //   title: '数据加载中',
  // })

  return new Promise((resolve, reject) => {
    const AuthorizationApi = wx.getStorageSync('TOKEN') || ''
    wx.request({
      url: baseURL + options.url,
      timeout: timeout,
      data: options.data,
      header: {
        AuthorizationApi:AuthorizationApi
      },
      method: options.method,
      success: function (res) {
        if (res.data.code == 401) {
          console.log('token已过期')
          wx.login({
            success(res) {
              if (res.code) {
                // console.log('我是code'+res.code)
                wx.request({
                  url:baseURL+ '/api/login/MINI_PROGRAMMER',
                  method:'post',
                  data: {
                    password: res.code
                  },
                  success(loginRes) {
                    // 抽取token
                    const {
                      data: token
                    } = loginRes.data
                    // 存到全局中
                    app.globalData.token = token
                    // 存储到本地
                    wx.setStorage({
                      key: 'TOKEN',
                      data: token,
                    })
                  },
                  fail(res){
                    console.log(res)
                  }
                })
              } else {
                wx.showToast({
                  title: '登录失败',
                  icon: 'none',
                  mask: true,
                  duration: 1500
                })
              }
            }
          })
        }else{
          resolve(res.data)
        }
      },
      fail: reject,
      complete: res => {
        // wx.hideLoading()

      }
    })
  })
}

export default request;