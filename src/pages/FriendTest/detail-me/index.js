import { connect } from '../../../vendors/weapp-redux.js';
import Toolbar from '../../../components/toolbar/index.js';
import { clone, getDeviceInfo } from '../../../libs/utils.js';
import { POST_RECORD, GET_FRIENDTEST, UPDATE_Q } from '../../../libs/common.js';
import { dispatchFriendAnswers } from '../../../redux/models/friend_answers.js';

let pageConfig = {
    data: {
      progress: 0,
      result: "",
      showsharetip2: true,
      canShare: false,
    },
    onLoad: function() {
      var me = this,
          toolbarInit = Toolbar.init.bind(me);
      let {paper, answerHash, questionHash} = this.data,
          questions = paper.questions.map(e => {
            e = questionHash[e];
            let id = e.id;
            if(answerHash[id] || answerHash[id] == 0) {
              let ans = answerHash[id];
              e.options[ans].hoverClass = "selected"
            }
            return e;
          });
      this.setData({
        questions,
      });

      wx.setNavigationBarTitle({
        title: paper.title || '泛泛之交'
      });
      let canShare = this.data.questions.every(l => {
        return l.options.some(e => e.hoverClass);
      });
      toolbarInit(paper.praise_count, paper.praise || false, true, canShare);

    },
    onShareAppMessage: function() {
      let { pid, id, paper } = this.data,
          { shareTitle, shareDesc, shareImage } = paper;
      this.hidecover();
      return {
        shareTitle,
        shareDesc,
        shareImage,
        path: `/pages/FriendTest/detail-share/index?id=${pid}&from=${id}`
      };
    },
    hidecover: function() {
      this.setData({ showsharetip2: false });
    },
    radioSelect: function(e) {
      if(this.selecting) return;
      this.selecting = true;
      this.updateQ(e).then(_ => {
        this.setData({
          questions: this.data.questions
        });

        setTimeout(() => {
          let obj = {};
          obj.progress = ++this.data.progress;
          if(this.data.progress>=this.data.questions.length) {
            obj.result = {
              content: "aaaa",
            };
          }
          this.setData(obj);
          this.selecting = false;
        }, 300);
      });
    },
    updateQ(e) {
      let ind1 = e.currentTarget.dataset.index,
          ind2 = e.detail.value,
          id = e.currentTarget.dataset.id;
      this.data.questions[ind1].options.forEach(e => {
        e.hoverClass = "";
      });
      this.data.questions[ind1].options[ind2].hoverClass = "selected"; // hover
      let answer = +this.data.questions[ind1].options[ind2].score;
      let canShare = this.data.questions.every(l => {
        return l.options.some(e => e.hoverClass);
      });
      Toolbar.setShare.call(this, canShare);

      return UPDATE_Q({
        sessionid: this.data.id,
        qid: id,
        answer,
      }).then(_ => {
        return this.dispatchFriendAnswers({[id]: answer}); // 更新 answers redux
      });
    },
    returnBack: function(e) {
        wx.navigateBack();
    },
}

let mapStateToData = (state, params) => {
    let id = params.id,
        paper = state.entities.posts[id],
        answerHash = state.entities.answers,
        questionHash = state.entities.questions;

    return {
        id: state.entities.sessionid,
        pid: id,
        paper,
        answerHash,
        questionHash,
    }
};

let mapDispatchToPage = dispatch => ({
  dispatchFriendAnswers: (data) => dispatch(dispatchFriendAnswers(data)),
});

pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);
