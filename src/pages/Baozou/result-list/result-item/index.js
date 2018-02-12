import { connect } from '../../../../vendors/weapp-redux.js';
import Toolbar from '../../../../components/toolbar/index.js';
import { clone, updateObject, homeShare } from '../../../../libs/utils.js';
import { POST } from '../../../../libs/request.js';
import { fetchResultRecord } from "../../../../redux/models/results.js";

let pageConfig = {
    onShow: function() {
      var me = this,
            { detail } = me.data,
            toolbarInit = Toolbar.init.bind(me);

      wx.setNavigationBarTitle({
          title: detail.title || '趣味测试'
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
      let { detail, questions } = this.data,
           totalScore = questions.reduce((pre,next) => pre+Math.max.apply(null, next.options.map(e=>e.score)), 0),
           score = questions.reduce((pre,next) => pre+next.options[next.selected].score, 0),
           ratio = score / totalScore,
           _result = detail.result.filter(e=>e.score<=ratio).sort().reverse()[0];
      if(!_result) _result = detail.result[0];
      return _result;
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
         questions = result.answers.map(e => updateObject(e,qHash[e.id]));

    return {
        id,
        result,
        detail,
        questions,
        sessionid: state.entities.sessionid
    }
};


let mapDispatchToPage = dispatch => ({
  fetchResultRecord: (id) => dispatch(fetchResultRecord(id))
});


pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);
