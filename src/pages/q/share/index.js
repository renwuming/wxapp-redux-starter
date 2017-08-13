const util = require('../../../utils/util.js');
const app = getApp();
Page({
  data: {
    key: "",
    from: "",
    title: "",
    list: [],
    complete: false
  },
  onLoad: function(option) {
    const {key, from} = option;
    this.setData({
      key,
      from
    });
    util.wxLogin(() => {
      util.getUserInfo();
      util.wxPost("/test/getitem", {
        sessionid: from,
        key
      }, (res) => {
        this.setData({
          title: res.title,
          list: res.list
        });
      });
    });

  },
  radioChange: function(e) {
    const index = e.target.dataset.index;
    this.data.list[index].checked = e.detail.value;
  },
  allChecked: function() {
    let flag = true;
    this.data.list.forEach(e => {
      if(!e.checked) flag = false;
    });
    return flag;
  },
  handleData: function() {
    const list = this.data.list.map(e => {
      return {
        Q: e.Q,
        A: e.checked
      }
    });
    return {
      title: this.data.title,
      list
    }
  },
  complete: function() {
    if(!this.allChecked()) {
      wx.showToast({
        title: '请答完所有题目',
        icon: 'success',
        duration: 1000
      });
      return;
    }
    const data = this.handleData();
    util.wxPost("/test/commit", {
      sessionid: this.data.from,
      key: this.data.key,
      player: app.globalData.sessionid,
      data
    }, (res) => {
      this.setData({
        complete: true
      });
    });
  },
  onShareAppMessage: function () {
    return {
      title: '少年，来让叔叔给你测试下心理',
      path: `pages/test/share/index?from=${this.data.from}&key=${this.data.key}`,
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


