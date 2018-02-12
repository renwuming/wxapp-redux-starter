let pageConfig = {
  preview: function() {
    wx.previewImage({
      urls: ["https://sec-cdn.static.xiaomi.net/secStatic/groups/miui-sec/rentianfu/wxapp/common/pay.jpg"],
    });
  }
};

Page(pageConfig);
