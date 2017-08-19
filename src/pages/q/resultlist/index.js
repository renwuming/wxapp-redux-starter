import { connect } from '../../../vendors/weapp-redux.js';

let pageConfig = {

  navigateTo: function(e) {
    let elCurrentTarget = e.currentTarget,
         url = elCurrentTarget.dataset.url;
    wx.navigateTo({
      url
    });
  },
};


let mapStateToData = (state, params) => {
  let id = params.id;

  return {
    id,
    postsHash: state.entities.posts,
    results: state.entities.results,
    resultDetails: state.entities.resultDetails
  }
};

let mapDispatchToPage = dispatch => ({});


pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);
