import { connect } from '../../../../vendors/weapp-redux.js';
import Toolbar from '../../../../components/toolbar/index.js';
import { clone, updateObject } from '../../../../libs/utils.js';
import { POST } from '../../../../libs/request.js';
import { fetchResultRecord2 } from "../../../../redux/models/results.js";

let pageConfig = {
    onShow: function() {
      var me = this,
            { detail } = me.data,
            toolbarInit = Toolbar.init.bind(me);

      wx.setNavigationBarTitle({
          title: detail.title
      });

      // 隐藏分享
      toolbarInit(detail.praise_count, detail.praise || false, true, false);

      this.setData({
        answerResult: this.getResult()
      });
      // 已查看
      this.fetchResultRecord(this.data.id);
    },
    getResult() {
      // let { detail, questions } = this.data,
      //      totalScore = questions.reduce((pre,next) => pre+Math.max.apply(null, next.options.map(e=>e.score)), 0),
      //      score = questions.reduce((pre,next) => pre+next.options[next.selected].score, 0),
      //      ratio = score / totalScore,
      //      _result = detail.result.filter(e=>e.score<=ratio).sort().reverse()[0];
      // if(!_result) _result = detail.result[0];
      return { content: "" };

      // let answers = this.data.answers,
      //     len = Object.keys(answers).length,
      //     l = 0;
      // for(let k in answers) {
      //   if(answers[k] == this.data.newAnswers[k]) l++;
      // }
      // let res = parseFloat(l / len * 100).toFixed(2);
      // if(isNaN(res)) res = 0;
      // return {
      //   content: `${res}%`,
      // };
    },
    returnBack: function(e) {
        wx.navigateBack();
    },
}

let mapStateToData = (state, params) => {
    let id = params.id,
        { posts: postsHash, questions: qHash, resultDetails: resultsHash } = state.entities,
        result = clone(resultsHash[id]),
        detail = clone(postsHash[result.paperid]),
        questions = result.answers.map(e => updateObject(e,qHash[e.id])),
        answerHash = state.entities.answers;

    questions.forEach(e => {
      let id = e.id,
          ans = answerHash[id];
      if(ans!=undefined) {
        e.correct = ans;
      }
    });

    return {
        id,
        result,
        detail,
        questions,
        sessionid: state.entities.sessionid,
        answerHash,
    }
};


let mapDispatchToPage = dispatch => ({
  fetchResultRecord: (id) => dispatch(fetchResultRecord2(id))
});


pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);
