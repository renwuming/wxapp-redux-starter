import { connect } from '../../../vendors/weapp-redux.js';

import Toolbar from '../../../components/toolbar/index.js';

import { clone, getDeviceInfo } from '../../../libs/utils.js';
import { POST_RECORD } from '../../../libs/common.js';

let pageConfig = {
    data: {
      progress: 0,
      score: 0,
      result: "",
      showsharetip: true
    },
    onShow: function() {
      var me = this,
            { detail } = me.data,
            toolbarInit = Toolbar.init.bind(me);

      wx.setNavigationBarTitle({
        title: detail.title || '趣味测试'
      });

      toolbarInit(detail.praise_count, detail.praise || false, true);

      POST_RECORD(this.data.id);
    },
    onShareAppMessage: function() {
      let { detail, sessionid, id } = this.data,
           { title, description: desc, image: imageUrl } = detail;

      return {
        title,
        desc,
        // imageUrl,
        path: `/pages/q/detail2/index?id=${id}&from=${sessionid}`
      };
    },
    hidecover: function() {
      this.setData({ showsharetip: false });
    },
    radioSelect: function(e) {
      let _score = this.getScore(e),
           _data = this.data,
           newData = {};
      _data.score += _score;
      this.setData({
        questions: this.data.questions
      });
      setTimeout(() => {
        newData.progress = ++_data.progress;
        if(_data.progress>=_data.questions.length) {
          newData.result = this.getResult();
        }
        this.setData(newData);
      }, 300);
    },
    getScore(e) {
      let ind1 = e.currentTarget.dataset.index,
           ind2 = e.detail.value;
      this.data.questions[ind1].options[ind2].hoverClass = "selected"; // hover
      return +this.data.questions[ind1].options[ind2].score;
    },
    getResult() {
      let _data = this.data,
           ratio = _data.score / _data.totalScore,
           _result = _data.detail.result.filter(e=>e.score<=ratio).sort().reverse()[0];
      if(!_result) _result = _data.detail.result[0];
      return _result;
    },
    returnBack: function(e) {
        wx.navigateBack();
    },
}

let mapStateToData = (state, params) => {
    let id = params.id,
         postsHash = state.entities.posts,
         qHash = state.entities.questions,
         detail = clone(postsHash[id]),
         questions = detail && detail.questions.map(e => {
           qHash[e].options.shuffle();
           return qHash[e];
         }),
         totalScore = questions.reduce((pre,next) => pre+Math.max.apply(null, next.options.map(e=>e.score)), 0);
        
    return {
        id,
        detail,
        questions,
        totalScore,
        sessionid: state.entities.sessionid
    }
};


let mapDispatchToPage = dispatch => ({});


pageConfig = connect(mapStateToData, mapDispatchToPage)(pageConfig)
Page(pageConfig);
