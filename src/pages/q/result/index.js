import { connect } from '../../../vendors/weapp-redux.js';

import Toolbar from '../../../components/toolbar/index.js';
import Toaster from '../../../components/toaster/index.js';

import { clone, updateObject } from '../../../libs/utils.js';

let pageConfig = {
    data: {
      progress: 0,
      score: 0,
      result: ""
    },
    onLoad: function(params) {
        var me = this,
            { detail } = me.data,
            errorCallback = Toaster.show.bind(me),
            toolbarInit = Toolbar.init.bind(me);

        wx.setNavigationBarTitle({
            title: detail.title || '趣味测试'
        });

        // 隐藏分享
        toolbarInit(detail.praise_count, detail.praise || false, true, false);

        this.setData({
          answerResult: this.getResult()
        });
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
}

let mapStateToData = (state, params) => {
    let id = params.id,
         { posts: postsHash, questions: qHash, results: resultsHash } = state.entities,
         result = clone(resultsHash[id]),
         detail = clone(postsHash[result.paperid]),
         questions = result.answers.map(e => updateObject(e,qHash[e.id]));

    return {
        id,
        result,
        detail,
        questions
    }
};


let mapDispatchToPage = dispatch => ({});


pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);
