let pageConfig = {
  preview: function() {
    wx.previewImage({
      urls: ["http://www.renwuming.xyz/wumingstore/img/pay.jpg"],
    });
  }
};

Page(pageConfig);
