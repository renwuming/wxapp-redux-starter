import { connect } from '../../../vendors/weapp-redux.js';
import { fetchFriendResultList } from '../../../redux/models/results.js';
import { fetchFreindPaperList } from '../../../redux/models/papers.js';
import { fetchFriendAnswers } from '../../../redux/models/friend_answers.js';
import { ArrayIncludeItem, homeShare } from '../../../libs/utils.js';
import Toaster from '../../../components/toaster/index.js';

let pageConfig = {
  data: {
    hasMorePaper: true,
    activeName: "home",
  },
  onLoad: function() {
    this.errorCallback = Toaster.show.bind(this);
    this.initResultList();
  },
  navigateTo: function(e) {
    let elCurrentTarget = e.currentTarget,
         url = elCurrentTarget.dataset.url;
    wx.navigateTo({ url });
  },
  switchTab: function(e) {
    let elCurrentTarget = e.currentTarget,
        activeName = elCurrentTarget.dataset.active;
    this.setData({ activeName });
  },
  initResultList: function() {
    this.waitSessionid = setInterval(() => {
      if(this.data.sessionid) {
        clearInterval(this.waitSessionid);
        this.fetchResultList(this.data.fetchParams, this.errorCallback, true);
        this.fetchPaperList(this.data.fetchParams, this.errorCallback, true);
        this.fetchFriendAnswers();
      }
    }, 100);
  },
  onPullDownRefresh: function() {
    if(this.scrolling) return;
    this.scrolling = true;
    if(this.data.activeName === "home") {
      this.fetchPaperList(this.data.fetchParams, this.errorCallback, true).then(() => {
        this.scrolling = false;
        wx.stopPullDownRefresh();
      });
    } else if(this.data.activeName === "answer") {
      this.fetchResultList(this.data.fetchParams, this.errorCallback, true).then(() => {
        this.scrolling = false;
        wx.stopPullDownRefresh();
      });
    }
  },
  onReachBottom: function() {
    if(this.scrolling) return;
    this.scrolling = true;
    if(this.data.activeName === "home") {
      if(!this.data.hasMorePapers) return;
      this.fetchPaperList(this.data.fetchParams, this.errorCallback).then(() => {
        this.scrolling = false;
      });
    } else if(this.data.activeName === "answer") {
      if(!this.data.hasMoreResults) return;
      this.fetchResultList(this.data.fetchParams, this.errorCallback).then(() => {
        this.scrolling = false;
      });
    }
  },
  onShareAppMessage: homeShare,
};
let mapStateToData = state => {
  let results = state.results.list,
      resultsHash = state.entities.results,
      resultDetailsHash = state.entities.resultDetails,
      resultDetails = {},
      newCount = 0,
      sessionid = state.entities.sessionid;

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
    sessionid,
    papers: state.papers.list,
    hasMorePapers: state.papers.hasmore_friend,
    postsHash: state.entities.posts,
    hasMoreResults: state.results.hasmore_friend,
    results,
    resultDetails,
    fetchParams: {
      sessionid,
      datatype: 1,
    },
  }
};
let mapDispatchToPage = dispatch => ({
  fetchPaperList: (params, errorCallback, init) => dispatch(fetchFreindPaperList(params, errorCallback, init)),
  fetchResultList: (params, errorCallback, init) => dispatch(fetchFriendResultList(params, errorCallback, init)),
  fetchFriendAnswers: () => dispatch(fetchFriendAnswers()),
});

pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);