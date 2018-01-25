import { connect } from '../../vendors/weapp-redux.js';
import { homeShare } from '../../libs/utils.js';

let pageConfig = {
  navigateTo: function(e) {
    let elCurrentTarget = e.currentTarget,
        url = elCurrentTarget.dataset.url;
    wx.navigateTo({ url });
  },
  onShareAppMessage: homeShare
};


let mapStateToData = state => {
  let userInfo = state.entities.userInfo;
  return {
    userInfo,
  }
};


pageConfig = connect(mapStateToData)(pageConfig)
Page(pageConfig);
