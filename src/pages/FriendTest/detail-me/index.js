import { connect } from '../../../vendors/weapp-redux.js';
import Toolbar from '../../../components/toolbar/index.js';
import Toaster from '../../../components/toaster/index.js';
import { clone, getDeviceInfo, ShareFromMe } from '../../../libs/utils.js';
import { POST_RECORD, GET_FRIENDTEST, UPDATE_Q } from '../../../libs/common.js';
import { dispatchFriendAnswers } from '../../../redux/models/friend_answers.js';

let pageConfig = {
    data: {
      progress: 0,
      result: "",
      isShare: false,
      showsharetip: true,
      isFriendTest: true,
      fShareFlag: false,
    },
    onLoad: function() {
      this.init();
    },
    init: function() {
      let me = this,
          toolbarInit = Toolbar.init.bind(me);
      let {detail, answerHash, questionHash} = this.data,
          questions = detail.questions.map(e => {
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
        title: detail.title
      });
      let fShareFlag = this.data.questions.every(l => {
        return l.options.some(e => e.hoverClass);
      });

      this.setData({ fShareFlag });
      toolbarInit(detail.praise_count, detail.praise || false, true);

      POST_RECORD(this.data.id).then(res => {
        this.setData({
          showsharetip: res.tip,
          auditing: res.tip,
        });
      });
    },
    hidecover: function() {
      this.setData({ showsharetip: false });
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
      let fShareFlag = this.data.questions.every(l => {
        return l.options.some(e => e.hoverClass);
      });
      this.setData({ fShareFlag });

      return UPDATE_Q({
        sessionid: this.data.sessionid,
        qid: id,
        answer,
      }).then(_ => {
        return this.dispatchFriendAnswers({[id]: answer}); // 更新 answers redux
      });
    },
    returnBack: function(e) {
        wx.navigateBack();
    },
    onShareAppMessage: function() {
      return ShareFromMe.call(this, 1);
    },
    navigateTo: function(e) {
      let elCurrentTarget = e.currentTarget,
          { redirect,url } = elCurrentTarget.dataset;
      if(redirect) wx.redirectTo({ url });
      else wx.navigateTo({ url });
    },
    notCompleteTestTip: function() {
      Toaster.show.call(this, "先答完所有题目，才能进行鉴定哦~");
    },
}

let mapStateToData = (state, params) => {
    let id = params.id,
        detail = state.entities.posts[id],
        answerHash = state.entities.answers,
        questionHash = state.entities.questions;

    return {
        sessionid: state.entities.sessionid,
        id: id,
        detail,
        answerHash,
        questionHash,
        user: state.entities.userInfo,
    }
};

let mapDispatchToPage = dispatch => ({
  dispatchFriendAnswers: (data) => dispatch(dispatchFriendAnswers(data)),
});

pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);
