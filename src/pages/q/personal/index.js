import { connect } from '../../../vendors/weapp-redux.js';

import { fetchResultList } from '../../../redux/models/results.js';

import Toaster from '../../../components/toaster/index.js';

let pageConfig = {
  data: {
    hasmore: true
  },
  onShow: function() {
    const errorCallback = Toaster.show.bind(this);

    this.fetchPosts(errorCallback, true);
  },
  navigateTo: function(e) {
    let elCurrentTarget = e.currentTarget,
         url = elCurrentTarget.dataset.url;
    wx.navigateTo({
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



let mapStateToData = state => {
  return {
    lastkey: state.results.listLastkey,
    results: state.results.list,
    hasmore: state.results.hasmore,
    resultsHash: state.entities.results,
    postsHash: state.entities.posts,
  }
};

let mapDispatchToPage = dispatch => ({
  fetchPosts: (errorCallback, init) => dispatch(fetchResultList(errorCallback, init))
});


pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);
