import { connect } from '../../../vendors/weapp-redux.js';

import { fetchPapersList } from '../../../redux/models/papers.js';

import Toaster from '../../../components/toaster/index.js';

let pageConfig = {
  onLoad: function () {
    const errorCallback = Toaster.show.bind(this);

    this.fetchPosts(errorCallback);
  },
  goto0: function() {
    // wx.navigateTo({
    //   url: "../new/new"
    // });
  },
  goto1: function() {
    // wx.navigateTo({
    //   url: "../list/list"
    // });
  },
  goto2: function() {
    // wx.navigateTo({
    //   url: "../result/index"
    // });
  },
  onShareAppMessage: function () {
    return {
      title: '高升客栈',
      desc: '高升客栈',
      path: '/pages/q/index/index'
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
