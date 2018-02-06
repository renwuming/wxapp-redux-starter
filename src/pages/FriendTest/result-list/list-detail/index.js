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
      paper = state.entities.posts[id],
      results = state.entities.results[id].list,
      resultDetails = state.entities.resultDetails;
  results = results.map(id => {
    let item = resultDetails[id];
    item.date = formatDate(new Date(item.publish_time), "yyyy/MM/dd");
    return item;
  })
  return {
    id,
    paper,
    results,
  }
};

let mapDispatchToPage = dispatch => ({});


pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);
