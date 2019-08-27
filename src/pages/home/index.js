import { connect } from '../../vendors/weapp-redux.js';
import { homeShare } from '../../libs/utils.js';

let pageConfig = {
  navigateTo: function(e) {
    let elCurrentTarget = e.currentTarget,
        url = elCurrentTarget.dataset.url;
    wx.navigateTo({ url });
  },
  onShareAppMessage: homeShare,
  onLoad: () => {
    // // 在页面中定义激励视频广告
    // let videoAd = null
    // // 在页面onLoad回调事件中创建激励视频广告实例
    // if (wx.createRewardedVideoAd) {
    //   videoAd = wx.createRewardedVideoAd({
    //     adUnitId: 'adunit-71cd83a547f9379f'
    //   })
    //   videoAd.onLoad(() => {})
    //   videoAd.onError((err) => {})
    //   videoAd.onClose((res) => {})
    // }
    // // 用户触发广告后，显示激励视频广告
    // if (videoAd) {
    //   videoAd.show().catch(() => {
    //     // 失败重试
    //     videoAd.load()
    //       .then(() => videoAd.show())
    //       .catch(err => {
    //         console.log('激励视频 广告显示失败')
    //       })
    //   })
    // }
  }
};


let mapStateToData = state => {
  let userInfo = state.entities.userInfo;
  return {
    userInfo,
  }
};


pageConfig = connect(mapStateToData)(pageConfig)
Page(pageConfig);
