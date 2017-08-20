import { connect } from '../../vendors/weapp-redux.js';


import Toaster from '../../components/toaster/index.js';

let pageConfig = {
  navigateTo: function() {
    wx.navigateTo({
      url: "/pages/q/home/index"
    });
  },
  onShow: function() {
  },
  onLoad: function () {
    const errorCallback = Toaster.show.bind(this);
  },
  onShareAppMessage: function () {
    return {
      title: '高升客栈',
      desc: '高升客栈',
      path: '/pages/home/index'
    };
  }
};


let mapStateToData = state => {
  return {
    userInfo: state.entities.userInfo,
    sessionid: state.entities.sessionid
  }
};

let mapDispatchToPage = dispatch => ({});


pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);
