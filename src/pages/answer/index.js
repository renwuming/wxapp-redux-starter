import { connect } from '../../vendors/weapp-redux.js';
import { fetchResultList } from '../../redux/models/results.js';
import { clone, updateObject, ArrayIncludeItem } from '../../libs/utils.js';

import Toaster from '../../components/toaster/index.js';

let pageConfig = {
  data: {
    hasmore: true,
    activeName: "answer-active",
  },
  onLoad: function() {
    const errorCallback = Toaster.show.bind(this),
          { lazy, results } = this.data;
    if(lazy && results.length) return;
    this.fetchPosts(errorCallback, true);
  },
  navigateTo: function(e) {
    let elCurrentTarget = e.currentTarget,
        url = elCurrentTarget.dataset.url;
    wx.navigateTo({
      url
    });
  },
  redirectTo: function(e) {
    let elCurrentTarget = e.currentTarget,
         url = elCurrentTarget.dataset.url;
    wx.redirectTo({
      url
    });
  },
  onPullDownRefresh: function() {
    if(this.scrolling) return;
    this.scrolling = true;
    const errorCallback = Toaster.show.bind(this);
    this.fetchPosts(errorCallback, true).then(() => {
      this.scrolling = false;
      wx.stopPullDownRefresh();
    });
  },
  onReachBottom: function() {
    if(this.scrolling || !this.data.hasmore) return;
    this.scrolling = true;
    const errorCallback = Toaster.show.bind(this);
    this.fetchPosts(errorCallback).then(() => {
      this.scrolling = false;
    });
  },
};


let mapStateToData = (state, params) => {
  let results = clone(state.results.list),
       resultsHash = clone(state.entities.results),
       resultDetailsHash = clone(state.entities.resultDetails),
       resultDetails = {};

  results.map(e => {
    resultDetails[e] = { newPlayers: [] };
    let item = resultsHash[e];
    item.list.map(i => {
      let detail = resultDetailsHash[i];
      if(!detail.record_count) {
        resultDetails[e].new = true;
        let newplayers = resultDetails[e].newPlayers;
        // 不重复的头像，仅显示前三个
        if(!ArrayIncludeItem(newplayers, detail.player) && newplayers.length < 3) {
          newplayers.push(detail.player);
        }
      }
    });
  });

  return {
    lazy: params.lazy,
    postsHash: state.entities.posts,
    hasmore: state.results.hasmore,
    results,
    resultDetails
  }
};

let mapDispatchToPage = dispatch => ({
  fetchPosts: (errorCallback, init) => dispatch(fetchResultList(errorCallback, init))
});


pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);
