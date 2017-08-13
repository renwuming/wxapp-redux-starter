const util = require('../../../utils/util.js');
const test = require('../../../utils/test.js');
const app = getApp();
Page({
  data: {
    testlist: []
  },
  goto: function(e) {
    const data = e.target.dataset.test;
    wx.navigateTo({
      url: '../item/item?data=' + JSON.stringify(data)
    })
  },
  setList: function(data) {
    for(let key in data) {
      this.data.testlist.push({
        key: key,
        value: JSON.parse(data[key])
      });
    }
    this.setData({
      testlist: this.data.testlist
    });
  },
  onLoad: function () {
    util.wxLogin(() => {
      util.wxPost("/test/getlist", {
        sessionid: app.globalData.sessionid
      }, (res) => {
        this.setList(res);
      });
    });
  },
});


