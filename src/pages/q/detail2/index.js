import { connect } from '../../../vendors/weapp-redux.js';
import { GET, POST } from '../../../libs/request.js';

import { fetchPaper } from '../../../redux/models/papers.js';
import { fetchUserInfo, fetchSessionid } from '../../../redux/models/user.js';

import Toolbar from '../../../components/toolbar/index.js';
import Toaster from '../../../components/toaster/index.js';

import { clone, getDeviceInfo } from '../../../libs/utils.js';

let pageConfig = {
    data: {
      progress: 0,
      score: 0,
      result: ""
    },
    onShow: function() {
      let { detail, id } = this.data,
          errorCallback = Toaster.show.bind(this);
      // 先获取sessionid再获取userInfo
      this.fetchSessionid(errorCallback).then(() => {
        this.fetchUserInfo(errorCallback);
      });
      // 获取测试详情
      this.fetchPaper(id, errorCallback).then(() => {
        this.init();
      });
    },
    init: function() {
      let { detail } = this.data,
           toolbarInit = Toolbar.init.bind(this);
      wx.setNavigationBarTitle({
          title: detail.title || '趣味测试'
      });
      toolbarInit(detail.praise_count, detail.praise || false, true);
      this.setData({progress:0});
    },
    onShareAppMessage: function() {
      let { title, description } = this.data.detail,
           { id, aesSessionid } = this.data;
      return {
        title,
        desc: description,
        path: `/pages/q/detail2/index?id=${id}&from=${from}`
      };
    },
    radioSelect: function(e) {
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
}

let mapStateToData = (state, params) => {
    let id = params.id,
         from = params.from,
         postsHash = state.entities.posts,
         qHash = state.entities.questions,
         detail = postsHash && clone(postsHash[id]),
         questions = detail && detail.questions.map(e => qHash[e]),
         totalScore = questions && questions.reduce((pre,next) => pre+Math.max.apply(null, next.options.map(e=>e.score)), 0);
    return {
        id,
        detail,
        sessionid: state.entities.sessionid,
        from,
        questions,
        totalScore
    }
};


let mapDispatchToPage = dispatch => ({
  fetchPaper: (id, errorCallback) => dispatch(fetchPaper(id, errorCallback)),
  fetchUserInfo: (errorCallback) => dispatch(fetchUserInfo(errorCallback)),
  fetchSessionid: (errorCallback) => dispatch(fetchSessionid(errorCallback))
});


pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);
