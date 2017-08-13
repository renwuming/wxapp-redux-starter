const util = require('../../../utils/util.js');
const test = require('../../../utils/test.js');
const app = getApp();
Page({
  data: {
    list: [],
    title: ""
  },
  onReady: function () {
    util.wxLogin();
  },
  new: function() {
    this.data.list.push({editing: true});
    this.setData({
      list: this.data.list
    });
  },
  editQ: function(e) {
    const index = e.target.dataset.index;
    this.data.list[index].Q = e.detail.value;
  },
  editA: function(e) {
    const index = e.target.dataset.index;
    this.data.list[index].A = e.detail.value;
  },
  editB: function(e) {
    const index = e.target.dataset.index;
    this.data.list[index].B = e.detail.value;
  },
  editTitle: function(e) {
    this.setData({
      title: e.detail.value
    });
  },
  save: function(e) {
    const index = e.target.dataset.index;
    let item = this.data.list[index];
    if(!(item.Q && item.A && item.B)) {
      wx.showToast({
        title: '不能为空',
        icon: 'success',
        duration: 1000
      });
      return;
    }
    item.editing = false;
    this.setData({
      list: this.data.list
    });
  },
  edit: function(e) {
    const index = e.target.dataset.index;
    this.data.list[index].editing = true;
    this.setData({
      list: this.data.list
    });
  },
  delete: function(e) {
    const index = e.target.dataset.index;
    this.data.list.splice(index, 1);
    this.setData({
      list: this.data.list
    });
  },
  hasEditing: function() {
    let flag = false;
    this.data.list.forEach(e => {
      if(e.editing) flag = true;
    });
    return flag;
  },
  complete: function() {
    if(this.data.list.length < 1 || this.hasEditing() || !this.data.title) {
      wx.showToast({
        title: '不能为空',
        icon: 'success',
        duration: 1000
      });
      return;
    }
    let reslist = test.createTest(this.data.title, this.data.list);
    util.wxPost("/test/list", {
      item: JSON.stringify(reslist),
      sessionid: app.globalData.sessionid
    }, (res) => {
      wx.redirectTo({
        url: '../list/list'
      });
    });
  }
});


