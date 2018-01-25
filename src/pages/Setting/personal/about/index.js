let pageConfig = {
  preview: function() {
    wx.previewImage({
      urls: ["https://www.renwuming.xyz/wumingstore/img/pay.jpg"],
    });
  }
};

Page(pageConfig);
