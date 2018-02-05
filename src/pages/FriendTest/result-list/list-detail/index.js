import { connect } from '../../../../vendors/weapp-redux.js';
import { formatDate } from "../../../../libs/utils.js";
import { homeShare } from '../../../../libs/utils.js';

let pageConfig = {

  navigateToResult: function(e) {
    let elCurrentTarget = e.currentTarget,
         url = elCurrentTarget.dataset.url;
    wx.navigateTo({
      url
    });
  },
  onShareAppMessage: homeShare,
};


let mapStateToData = (state, params) => {
  let id = params.id,
      resultDetails = state.entities.resultDetails;
  for(let key in resultDetails) {
    let item = resultDetails[key];
    item.date = formatDate(new Date(item.publish_time), "yyyy/MM/dd");
  }
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
