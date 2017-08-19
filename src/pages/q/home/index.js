import { connect } from '../../../vendors/weapp-redux.js';

import { fetchUserInfo, fetchSessionid } from '../../../redux/models/user.js';
import { fetchPapersList } from '../../../redux/models/papers.js';

import Toaster from '../../../components/toaster/index.js';

let pageConfig = {
  data: {
    hasmore: true
  },
  onLoad: function() {
    const errorCallback = Toaster.show.bind(this);

    // 先获取sessionid再获取userInfo
    this.fetchSessionid(errorCallback).then(() => {
      this.fetchUserInfo(errorCallback);
    });
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
  onShareAppMessage: function() {
    return {
      title: '趣味测试',
      desc: '少年，来让叔叔给你测试一下心理~',
      path: '/pages/q/home/index'
    };
  }
};



let mapStateToData = state => {
  return {
    posts: state.papers.list,
    hasmore: state.papers.hasmore,
    postsHash: state.entities.posts,
  }
};

let mapDispatchToPage = dispatch => ({
  fetchUserInfo: (errorCallback) => dispatch(fetchUserInfo(errorCallback)),
  fetchSessionid: (errorCallback) => dispatch(fetchSessionid(errorCallback)),
  fetchPosts: (errorCallback, init) => dispatch(fetchPapersList(errorCallback, init))
});


pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);
