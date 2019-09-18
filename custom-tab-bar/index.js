Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list: [
      {
        "pagePath": "/pages/tabBar/index/index",
        "text": "主页",
        "iconPath": "/assets/images/home_blank.png",
        "selectedIconPath": "/assets/images/home_fill.png"
      },
      {
        "pagePath": "/pages/tabBar/find/find",
        "text": "发现",
        "iconPath": "/assets/images/list_blank.png",
        "selectedIconPath": "/assets/images/list_fill.png"
      },
      {
        "pagePath": "/pages/tabBar/find/find",
        "text": "自由",
        "iconPath": "/assets/images/list_blank.png",
        "selectedIconPath": "/assets/images/list_fill.png"
      },
      {
        "pagePath": "/pages/tabBar/mine/mine",
        "text": "库",
        "iconPath": "/assets/images/account_blank.png",
        "selectedIconPath": "/assets/images/account_fill.png"
      },
      {
        "pagePath": "/pages/tabBar/mine/mine",
        "text": "我的",
        "iconPath": "/assets/images/account_blank.png",
        "selectedIconPath": "/assets/images/account_fill.png"
      }
    ]
  },

  attached() {
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url})
      this.setData({
        selected: data.index
      })
    }
  }
})
