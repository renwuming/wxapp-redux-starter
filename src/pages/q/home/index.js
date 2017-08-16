import { connect } from '../../../vendors/weapp-redux.js';

import { fetchPapersList } from '../../../redux/models/papers.js';

import Toaster from '../../../components/toaster/index.js';

let pageConfig = {
  data: {
    hasmore: true
  },
  onLoad: function () {
    const errorCallback = Toaster.show.bind(this);
    this.fetchPosts(errorCallback);
  },
  navigateTo: function(e) {
    let elCurrentTarget = e.currentTarget,
         url = elCurrentTarget.dataset.url;
    wx.navigateTo({
      url
    });
  },
  handleScroll: function() {
    const errorCallback = Toaster.show.bind(this);
    if(this.data.hasmore) {
      this.fetchPosts(errorCallback);
    }
  },
  onShareAppMessage: function() {
    return {
      title: '高升客栈',
      desc: '高升客栈',
      path: '/pages/q/home/index'
    };
  }
};



let mapStateToData = state => {
  return {
    lastkey: state.papers.listLastkey,
    posts: state.papers.list,
    hasmore: state.papers.hasmore,
    postsHash: state.entities.posts,
  }
};

let mapDispatchToPage = dispatch => ({
  fetchPosts: (errorCallback) => dispatch(fetchPapersList(errorCallback))
});


pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);
