import { connect } from '../../vendors/weapp-redux.js';

let pageConfig = {
  data: {
    activeName: "personal-active",
  },
  redirectTo: function(e) {
    let elCurrentTarget = e.currentTarget,
        url = elCurrentTarget.dataset.url;
    wx.redirectTo({
      url
    });
  },
};


let mapStateToData = state => {
  return {
  }
};

let mapDispatchToPage = dispatch => ({});


pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);
