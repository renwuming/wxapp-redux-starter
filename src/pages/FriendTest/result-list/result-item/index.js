import { connect } from '../../../../vendors/weapp-redux.js';
import Toolbar from '../../../../components/toolbar/index.js';
import { clone, updateObject, homeShare } from '../../../../libs/utils.js';
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
      toolbarInit(detail.praise_count, detail.praise || false, false, false);

      // 已查看
      this.fetchResultRecord(this.data.id);

      this.setData({
        score: this.getResult(this.data.correctL, this.data.questions.length),
      });
    },
    getResult(l, len) {
      let res = Math.floor(l / len * 100);
      if(isNaN(res)) res = 0;
      return res;
    },
    returnBack: function(e) {
        wx.navigateBack();
    },
    navigateTo: function(e) {
      let elCurrentTarget = e.currentTarget,
          { redirect,url } = elCurrentTarget.dataset;
      if(redirect) wx.redirectTo({ url });
      else wx.navigateTo({ url });
    },
    onShareAppMessage: homeShare,
}

let mapStateToData = (state, params) => {
    let id = params.id,
        { posts: postsHash, questions: qHash, resultDetails: resultsHash } = state.entities,
        result = clone(resultsHash[id]),
        detail = clone(postsHash[result.paperid]),
        questions = result.answers.map(e => updateObject(e,qHash[e.id])),
        answerHash = state.entities.answers;

    let correctL = 0;
    questions.forEach(e => {
      let id = e.id,
          ans = answerHash[id];
      if(ans!=undefined) {
        e.correct = ans;
        if(e.selected == e.correct) correctL++;
      }
    });

    return {
        id,
        result,
        detail,
        questions,
        sessionid: state.entities.sessionid,
        answerHash,
        correctL,
    }
};


let mapDispatchToPage = dispatch => ({
  fetchResultRecord: (id) => dispatch(fetchResultRecord2(id))
});


pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);
