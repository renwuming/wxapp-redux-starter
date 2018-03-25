import { connect } from '../../../vendors/weapp-redux.js';
import { GET, POST } from '../../../libs/request.js';
import { fetchPaper } from '../../../redux/models/papers.js';
import Toolbar from '../../../components/toolbar/index.js';
import Toaster from '../../../components/toaster/index.js';
import { clone, getDeviceInfo, ShareFromShare } from '../../../libs/utils.js';
import { POST_RECORD } from '../../../libs/common.js';

let pageConfig = {
    data: {
      progress: 0,
      score: 0,
      result: "",
      showhometip: true,
      toBaozouTest: true,
    },
    onLoad: function() {
      let { detail, id } = this.data,
          errorCallback = Toaster.show.bind(this);
      this.selecting = true;
      // 获取测试详情
      this.fetchPaper(id, errorCallback).then(() => {
        this.init();
        this.selecting = false;
      });

      POST_RECORD(this.data.id).then(res => {
        this.setData({
          showhometip: res.tip,
          auditing: res.tip,
        });
      });
    },
    hidecover: function() {
      this.setData({ showhometip: false });
    },
    init: function() {
      let { detail } = this.data,
           toolbarInit = Toolbar.init.bind(this);
      wx.setNavigationBarTitle({
          title: detail.title
      });
      toolbarInit(detail.praise_count, detail.praise || false, false, false);
      this.setData({progress:0});
    },
    onShareAppMessage: function() {
      return ShareFromShare.call(this);
    },
    radioSelect: function(e) {
      if(this.selecting) return;
      this.selecting = true;
      let _score = this.getScore(e),
           _data = this.data,
           newData = {};
      _data.score += _score;
      this.saveSelect(e);
      this.setData({
        questions: this.data.questions
      });
      setTimeout(() => {
        newData.progress = ++_data.progress;
        if(_data.progress>=_data.questions.length) {
          newData.result = this.getResult();
          this.postResult();
        }
        this.setData(newData);
        this.selecting = false;
      }, 300);
    },
    saveSelect(e) {
      let ind1 = e.currentTarget.dataset.index,
           ind2 = e.detail.value;
      this.data.questions[ind1].selected = +ind2;
    },
    getScore(e) {
      let ind1 = e.currentTarget.dataset.index,
           ind2 = e.detail.value;
      this.data.questions[ind1].options[ind2].hoverClass = "selected"; // hover
      return +this.data.questions[ind1].options[ind2].score;
    },
    getResult() {
      let { detail, score, totalScore } = this.data,
           ratio = score / totalScore,
           _result = detail.result.filter(e=>e.score<=ratio).sort().reverse()[0];
      if(!_result) _result = detail.result[0];
      return _result;
    },
    postResult() {
      let { from, sessionid, id, questions } = this.data;
      let body = {
        from,
        sessionid,
        id,
        questions
      };
      POST("/test/result", body);
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
    navigateToBaozouTest: function(e) {
      wx.navigateTo({
        url: `/pages/Baozou/detail-me/index?id=${this.data.id}`,
      });
    },
}

let mapStateToData = (state, params) => {
    let id = params.id,
         from = params.from,
         postsHash = state.entities.posts,
         qHash = state.entities.questions,
         detail = postsHash && clone(postsHash[id]),
         questions = detail && detail.questions.map(e => {
           qHash[e].options.shuffle();
           return qHash[e];
         }),
         totalScore = questions && questions.reduce((pre,next) => pre+Math.max.apply(null, next.options.map(e=>e.score)), 0);
    return {
        id,
        detail,
        sessionid: state.entities.sessionid,
        from,
        questions,
        totalScore,
        name: params.name,
    }
};


let mapDispatchToPage = dispatch => ({
  fetchPaper: (id, errorCallback) => dispatch(fetchPaper(id, errorCallback))
});


pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);
