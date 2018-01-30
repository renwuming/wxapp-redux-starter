import { connect } from '../../../vendors/weapp-redux.js';
import Toolbar from '../../../components/toolbar/index.js';
import { clone, getDeviceInfo } from '../../../libs/utils.js';
import { POST_RECORD, GET_FRIENDTEST, UPDATE_FRIEND_RESULT } from '../../../libs/common.js';

let pageConfig = {
    data: {
      newAnswers: {},
      progress: 0,
      result: {},
    },
    onLoad: function() {
      var me = this,
          toolbarInit = Toolbar.init.bind(me);
      this.setData({progress:0});
      GET_FRIENDTEST(this.data.id, this.data.pid).then(res => {
        let {paper, answers} = res,
            questions = paper.questions.map(e => {
              e.options.shuffle();
              return e;
            });
        this.setData({
          paper,
          questions,
          answers,
        });

        wx.setNavigationBarTitle({
          title: paper.title
        });
        toolbarInit(paper.praise_count, paper.praise || false, true);
      });

    },
    updateFriendResult() {
      let {sessionid, id, pid} = this.data;
      UPDATE_FRIEND_RESULT({
        sessionid,
        from: id,
        pid,
        answers: this.data.newAnswers,
      });
    },
    onShareAppMessage: function() {
      let { pid, id } = this.data,
          { shareTitle, shareDesc, shareImage } = paper;
      return {
        shareTitle,
        shareDesc,
        shareImage,
        path: `/pages/realfriend/share/index?id=${pid}&from=${id}`
      };
    },
    radioSelect: function(e) {
      if(this.selecting) return;
      this.selecting = true;
      this.handleQ(e);
      this.setData({
        questions: this.data.questions,
      });
      setTimeout(() => {
        let obj = {};
        obj.progress = ++this.data.progress;
        if(this.data.progress>=this.data.questions.length) {
          obj.result = this.getResult();
          this.updateFriendResult();
        }
        this.setData(obj);
        this.selecting = false;
      }, 300);
    },
    getResult() {
      let answers = this.data.answers,
          len = Object.keys(answers).length,
          l = 0;
      for(let k in answers) {
        if(answers[k] == this.data.newAnswers[k]) l++;
      }
      let res = parseFloat(l / len * 100).toFixed(2);
      if(isNaN(res)) res = 0;
      return {
        content: `${res}%`,
      };
    },
    handleQ(e) {
      let ind1 = e.currentTarget.dataset.index,
          ind2 = e.detail.value,
          id = e.currentTarget.dataset.id;
      this.data.questions[ind1].options.forEach(e => {
        e.hoverClass = "";
      });
      this.data.questions[ind1].options[ind2].hoverClass = "selected"; // hover
      let answer = +this.data.questions[ind1].options[ind2].score;
      this.data.newAnswers[id] = answer;
    },
    returnBack: function(e) {
        wx.navigateBack();
    },
}

let mapStateToData = (state, params) => {
    return {
        sessionid: state.entities.sessionid,
        id: params.from,
        pid: params.id,
    }
};


pageConfig = connect(mapStateToData)(pageConfig)
Page(pageConfig);
