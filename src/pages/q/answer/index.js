const util = require('../../../utils/util.js');
const app = getApp();
Page({
  data: {
    title: "",
    list: [],
    player: {}
  },
  onLoad: function(option) {
    const data = JSON.parse(option.data),
      player = JSON.parse(option.player);
      !player.avatarUrl && (player.avatarUrl = "/img/head.jpg");
    this.setData({
      title: data.title,
      list: data.list,
      player
    });
  }
});


