import { connect } from '../../../vendors/weapp-redux.js';

import { fetchUserInfoUpdate } from '../../../redux/models/user.js';
import { homeShare } from '../../../libs/utils.js';

let pageConfig = {
  login: function(e) {
    let userInfo = e.detail.rawData;
    if(userInfo) {
      userInfo = JSON.parse(userInfo);
      this.fetchUserInfoUpdate(userInfo);
    }
  },
  navigateTo: function(e) {
    let elCurrentTarget = e.currentTarget,
         url = elCurrentTarget.dataset.url;
    wx.navigateTo({ url });
  },
  onShareAppMessage: homeShare,
};


let mapStateToData = state => {
  let userInfo = state.entities.userInfo,
      loginText = userInfo.language === "isDefault" ? "授权登录" : "更新信息";
  return {
    userInfo,
    loginText
  }
};

let mapDispatchToPage = dispatch => ({
  fetchUserInfoUpdate: (data) => dispatch(fetchUserInfoUpdate(data)),
});


pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);
