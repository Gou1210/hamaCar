import {
  getCarColorList,
  getCarTypeList,
  saveCarInfo,
  getCarList,
} from '../../service/api.js'
import {
  baseURL
} from '../../service/config'

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sexArr: ['先生', '女士'],
    colorArr: ['白色', '黑色'],
    colorCodeArr: [], //颜色码值
    typeCodeArr: [], //类型码值
    typeArr: ['小型车', '中型车'],
    brandArr: ['奔驰', '宝马'],
    colorForm:[],
    carTypeForm:[],
    carForm: {
      name: '',
      sexText: '',
      phone: '',
      colorText: '',
      carTypeText: '',
      brand: '',
      num: '',
      picture: ''
    },
    rules: {
      // isName:false
    },
    showNum: false,
    fileList: [],
    baseURL: baseURL
  },
  // 上传图片
  afterRead(event) {
    const that = this
    const {
      file
    } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    var AuthorizationApi = wx.getStorageSync('TOKEN') || ''
    wx.uploadFile({
      url: that.data.baseURL + '/api/common/upload',
      filePath: file.url,
      name: 'file',
      header: {
        AuthorizationApi: AuthorizationApi,
        'content-type': 'multipart/form-data'
      },
      success(res) {
        new Promise((resolve) => {
          const data = JSON.parse(res.data)
          resolve(data)
        }).then((data) => {
          if (data.code != 200) {
            wx.showToast({
              title: '请上传正确的图片格式',
              icon: 'none',
              mask: true,
              duration: 1500
            })
          } else {
            const picture = data.fileName
            that.setData({
              ['carForm.picture']: picture
            })
          }
        })
      },
    });
  },
  // 展示键盘
  showNumEvent: function () {
    this.setData({
      showNum: true,
      ['carForm.plateNumber']: ''
    })
  },
  // 关闭键盘
  closeNum: function () {
    this.setData({
      showNum: false
    })
  },
  // 输入车牌
  inputChange(value) {
    let carNo = this.data.carForm.plateNumber
    if (!value.detail) {
      carNo = carNo.substring(0, carNo.length - 1)
    } else if (carNo.length >= 8) { // 限制8位车牌 （燃油7位，电动8位）
      return
    } else {
      carNo += value.detail
    }
    this.setData({
      ['carForm.plateNumber']: carNo
    })

  },
  // 底部确定键
  inputOk: function () {
    this.setData({
      showNum: false
    })
  },
  // 获取名字
  changeName: function (e) {
    this.data.carForm.name = e.detail.value
    this.setData({
      carForm: this.data.carForm
    })
  },
  changeSex: function (e) {
    this.data.carForm.sexText = this.data.sexArr[e.detail.value]
    if (e.detail.value == 0) {
      this.data.carForm.sex = 1
    }
    if (e.detail.value == 1) {
      this.data.carForm.sex = 0
    }

    console.log(e.detail.value)
    this.setData({
      carForm: this.data.carForm
    })
  },
  //获取联系方式
  changePhone: function (e) {
    this.data.carForm.phone = e.detail.value
    this.setData({
      carForm: this.data.carForm
    })
  },
  // 确定颜色
  bindPickerColor: function (e) {
    this.data.carForm.colorText = this.data.colorArr[e.detail.value]
    this.data.carForm.color = this.data.colorCodeArr[e.detail.value]
    this.setData({
      carForm: this.data.carForm
    })
  },
  // 确定类型
  bindPickerType: function (e) {
    this.data.carForm.carTypeText = this.data.typeArr[e.detail.value]
    this.data.carForm.carType = this.data.typeCodeArr[e.detail.value]
    this.setData({
      carForm: this.data.carForm
    })
  },
  changeBrand: function (e) {
    this.data.carForm.carBrand = e.detail.value
    this.setData({
      carForm: this.data.carForm
    })
  },

  // 提交
  commit() {
    // 姓名判断
    if (!this.data.carForm.name) {
      this.data.rules.isName = true
    } else {
      this.data.rules.isName = false
    }
    //性别判断
    console.log(this.data.carForm)
    if (!this.data.carForm.sexText) {
      this.data.rules.isSex = true
    } else {
      this.data.rules.isSex = false
    }
    // 手机号判断
    if (!(/^1\d{10}$/.test(this.data.carForm.phone))) {
      this.data.rules.isPhone = true
    } else {
      this.data.rules.isPhone = false
    }
    // 车辆颜色
    if (!this.data.carForm.colorText) {
      this.data.rules.isColor = true
    } else {
      this.data.rules.isColor = false
    }
    // 汽车车型
    if (!this.data.carForm.carTypeText) {
      this.data.rules.isCarType = true
    } else {
      this.data.rules.isCarType = false
    }
    // 汽车品牌判断
    if (!this.data.carForm.carBrand) {
      this.data.rules.isBrand = true
    } else {
      this.data.rules.isBrand = false
    }
    // 车牌号判断
    if (!this.data.carForm.plateNumber) {
      this.data.rules.isNum = true
    } else {
      this.data.rules.isNum = false
    }
    // 图片判断
    if (!this.data.carForm.picture) {
      this.data.rules.isPicture = true
    } else {
      this.data.rules.isPicture = false
    }
    this.setData({
      rules: this.data.rules
    })

    for (let i in this.data.rules) {
      if (this.data.rules[i]) {
        return
      } else {}
    }
    saveCarInfo(this.data.carForm).then(res => {
      if (res.code == 200) {
        console.log(res)
        wx.setStorageSync('ADDCARINFO', this.data.carForm)
        // const pages = getCurrentPages()
        // let prevpage = pages[pages.length - 2].route;
        wx.redirectTo({
          // url: '/' + prevpage,
          url: '/pages/carInfo/carInfo',
        })
        console.log(res)
        wx.showToast({
          title: '上传成功',
          icon: 'none',
          mask: true,
          duration: 1500
        })
      } else {
        wx.showToast({
          title: '上传失败',
          icon: 'none',
          mask: true,
          duration: 1500
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(baseURL)
    const that = this
    // 获取颜色字典列表
    const p1 = getCarColorList().then(res => {
      var colorArr = []
      var colorCodeArr = []
      const colorForm = res.data
      res.data.forEach(v => {
        colorArr.push(v.dictLabel)
        colorCodeArr.push(v.dictValue)
      })
      this.setData({
        colorForm:colorForm,
        colorArr,
        colorCodeArr
      })
    })
    // 获取车辆类型字典列表
   const p2 = getCarTypeList().then(res => {
      var typeArr = []
      var typeCodeArr = []
      const carTypeForm = res.data
      res.data.forEach(v => {
        typeArr.push(v.dictLabel)
        typeCodeArr.push(v.dictValue)
      })
      this.setData({
        carTypeForm:carTypeForm,
        typeArr,
        typeCodeArr
      })
    })
    Promise.all([p1,p2]).then(()=>{
      if (this.options.carId) {
        getCarList().then(res => {
          const carList = res.data.filter(v => {
            if (v.carId == this.options.carId) {
              return v
            }
          })
          if (carList[0].sex == 1) {
            carList[0].sexText = '先生'
          } else {
            carList[0].sexText = '女士'
          }
         const colorText = this.data.colorForm.filter(v => {
            if (v.dictValue ==carList[0].color ) {
                return v.dictLabel
            }
          })
         const carTypeText = this.data.carTypeForm.filter(v => {
            if (v.dictValue ==carList[0].color ) {
                return v.dictLabel
            }
          })
          
          carList[0].colorText = colorText[0].dictLabel
          carList[0].carTypeText = carTypeText[0].dictLabel
          this.setData({
            carForm: carList[0]
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