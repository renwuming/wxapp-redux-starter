const util = require('../../../utils/util.js');
const test = require('../../../utils/test.js');
const app = getApp();
Page({
  data: {
    reslist: []
  },
  goto: function(e) {
    const data = e.target.dataset.answer,
      player = e.target.dataset.player || {};
    wx.navigateTo({
      url: `../answer/index?data=${JSON.stringify(data)}&player=${JSON.stringify(player)}`
    });
  },
  setList: function(data) {
    for(let key in data) {
      data[key].forEach(e => {
        e.player && (e.player = JSON.parse(e.player));
      });
      this.data.reslist.push({
        title: data[key][0].data.title,
        list: data[key]
      });
    }
    this.setData({
      reslist: this.data.reslist
    });
  },
  onReady: function () {
    util.wxLogin(() => {
      util.wxPost("/test/getreslist", {
        sessionid: app.globalData.sessionid
      }, (res) => {
        this.setList(res);
      });
    });
  },
});

