import { connect } from '../../../vendors/weapp-redux.js';
import Toolbar from '../../../components/toolbar/index.js';
import { clone, updateObject, ArrayIncludeItem } from '../../../libs/utils.js';
import { POST_RECORD, GET_FRIENDTEST, UPDATE_Q, GET_FRIENDTEST_ANSWERS } from '../../../libs/common.js';
import { dispatchPaper } from '../../../redux/models/papers.js';
import { dispatchResultList } from '../../../redux/models/results.js';
import { dispatchFriendAnswers } from '../../../redux/models/friend_answers.js';


let pageConfig = {
  data: {
    activeName: "home",
    level: 1,
  },
  onLoad: function() {

    GET_FRIENDTEST_ANSWERS(this.data.sessionid).then(res => {
      let {results} = res;
      this.dispatchResultList(res).then(_ => {
        let resultDetails = {};
        results.forEach(e => {
          let level = e.level;
          resultDetails[level] = { newPlayers: [] };
          e.list.map(detail => {
            if(!detail.record_count) {
              resultDetails[level].new = true;
              let newplayers = resultDetails[level].newPlayers;
              // 不重复的头像，仅显示前三个
              if(!ArrayIncludeItem(newplayers, detail.player) && newplayers.length < 3) {
                newplayers.push(detail.player);
              }
            }
          });
        });
        this.setData({
          results,
          resultDetails,
        });
      });
    });

    GET_FRIENDTEST(this.data.id, this.data.level).then(res => {
      let {paper, answers} = res;
      this.dispatchPaper([paper]);
      this.dispatchFriendAnswers(answers); // 更新 answers redux
      this.setData({
        papers: [paper.id],
      });
    });
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
};


let mapStateToData = state => {
  return {
    id: state.entities.sessionid,
    sessionid: state.entities.sessionid,
    postsHash: state.entities.posts,
  }
};

let mapDispatchToPage = dispatch => ({
  fetchUserInfoUpdate: (data) => dispatch(fetchUserInfoUpdate(data)),
  dispatchFriendAnswers: (data) => dispatch(dispatchFriendAnswers(data)),
  dispatchPaper: (data) => dispatch(dispatchPaper(data)),
  dispatchResultList: (data) => dispatch(dispatchResultList(data)),
});


pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);
