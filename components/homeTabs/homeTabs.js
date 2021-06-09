// components/homeTabs/homeTabs.js
Component({
/**
   * 组件的初始数据
   */
  // data: {
  //   status:0
  // },
  properties: {
    status:{
      type:Number,
      value:0
    }
  },
  attached: function() {
    console.log(this.properties.status,'1111')
    // 在组件实例进入页面节点树时执行
    this.setData({
      status:this.properties.status
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    hanldeItemTap(e){
      this.triggerEvent("itemChange",e.target.dataset.status);
      this.setData({
        status:e.target.dataset.status
      })
    }
  }
})
