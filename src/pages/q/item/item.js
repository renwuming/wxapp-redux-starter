const util = require('../../../utils/util.js');
const app = getApp();
Page({
  data: {
    key: "",
    title: "",
    list: []
  },
  onLoad: function(option) {
    const data = JSON.parse(option.data);
    this.setData({
      key: data.key,
      title: data.value.title,
      list: data.value.list
    });
  },
  onShareAppMessage: function () {
    return {
      title: '少年，来让叔叔给你测试下心理',
      path: `pages/test/share/index?from=${app.globalData.sessionid}&key=${this.data.key}`,
      success: function (res) {
        // 转发成功
        console.log(res);
      },
      fail: function (res) {
        // 转发失败
        console.log(res);
      }
    }
  },
});


