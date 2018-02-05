let pageConfig = {
  preview: function() {
    wx.previewImage({
      urls: ["https://www.renwuming.xyz/wumingstore/img/common/pay.jpg"],
    });
  }
};

Page(pageConfig);
