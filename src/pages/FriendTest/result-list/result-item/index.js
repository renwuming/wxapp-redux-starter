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
      return { content: "" };
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
