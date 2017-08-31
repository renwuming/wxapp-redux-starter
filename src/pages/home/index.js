import { connect } from '../../vendors/weapp-redux.js';
import { fetchPapersList } from '../../redux/models/papers.js';
import Toaster from '../../components/toaster/index.js';
let pageConfig = {
  data: {
    hasmore: true,
    activeName: "home-active",
  },
  onLoad: function() {
    const errorCallback = Toaster.show.bind(this),
          { lazy, posts } = this.data;
    if(lazy && posts.length) return;
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
  longpress: function(e) {
    console.log("longpress");
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
  onShareAppMessage: function() {
    return {
      title: '趣味测试',
      desc: '少年，来让叔叔给你测试一下心理~',
      path: '/pages/home/index'
    };
  }
};
let mapStateToData = (state, params) => {
  return {
    lazy: params.lazy,
    posts: state.papers.list,
    hasmore: state.papers.hasmore,
    postsHash: state.entities.posts,
  }
};
let mapDispatchToPage = dispatch => ({
  fetchPosts: (errorCallback, init) => dispatch(fetchPapersList(errorCallback, init))
});
pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);