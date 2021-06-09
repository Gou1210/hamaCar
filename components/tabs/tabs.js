// components/Tabs.js
Component({
  /**
   * 里面存放的是 要从父组件中接收的数据
   */
  properties: {

    tabs:{
      type:Array,
      value:[]
    },

  },

  data: {

  },


  methods: {
    hanldeItemTap(e){

      const {index}=e.currentTarget.dataset;
      this.triggerEvent("itemChange",{index});

    }
  }
})