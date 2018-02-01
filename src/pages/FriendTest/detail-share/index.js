import { connect } from '../../../vendors/weapp-redux.js';
import Toolbar from '../../../components/toolbar/index.js';
import { clone, getDeviceInfo } from '../../../libs/utils.js';
import { POST_RECORD, GET_FRIENDTEST, UPDATE_FRIEND_RESULT, GET_FRIENDTEST_PAPERRESULT } from '../../../libs/common.js';

let pageConfig = {
    data: {
      newAnswers: {},
      progress: 0,
      otherResults: [],
      result: {
        value: 0,
      },
      resultCanvas: "resultCanvas",
    },
    onLoad: function() {
      var me = this,
          toolbarInit = Toolbar.init.bind(me);
      this.setData({progress:0});
      GET_FRIENDTEST_PAPERRESULT(this.data.id, this.data.pid).then(res => {
        this.setData({
          otherResults: res.list,
        });
      });
      GET_FRIENDTEST(this.data.id, this.data.pid).then(res => {
        let {paper, answers, user} = res,
            questions = paper.questions.map(e => {
              e.title = e.title.replace("你", "");
              e.options.shuffle();
              return e;
            });
        this.setData({
          paper,
          questions,
          answers,
          from: user,
        });

        wx.setNavigationBarTitle({
          title: paper.title
        });
        toolbarInit(paper.praise_count, paper.praise || false, true);
      });

    },
    createAnimation: function(score) {
      let animation = wx.createAnimation({
        duration: 600,
        timingFunction: 'ease',
        delay: 1000,
      });
      animation.width(score+"%").step();
      return animation.export();
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
          this.target = this.getResult();
          this.updateFriendResult();
          // 绘制结果图案
          this.drawResult(this.target);
        }
        this.setData(obj);
        this.selecting = false;
      }, 300);
    },
    drawResult: function(value) {
      this.handleScreen();
      this.angleStep = .1;
      this.startAngle = -.5 * Math.PI;
      this.endAngle = this.startAngle - (2 * Math.PI);
      this.targetAngle = this.startAngle - (2 * Math.PI) * value / 100;
      this.canvasFlag = true;
      this.resultAngle = this.startAngle;
      this.delay = 14;
      this.rightColor = "#33cc33";
      this.wrongColor = "#ff6666";

      this.ctx = wx.createCanvasContext(this.data.resultCanvas);
      this.ctx.setStrokeStyle(this.rightColor);
      // const grd = ctx.createLinearGradient(0, 0, 250, 0);
      // grd.addColorStop(0, 'red');
      // grd.addColorStop(1, 'white');

      // 绘制百分比数字
      this.totalStep = Math.PI * 2 / this.angleStep;
      this.percentStep = value / this.totalStep * 2;


      // 更新otherResults
      this.data.otherResults.push({
        player: this.data.user,
        score: value,
      });
      this.setData({
        otherResults: this.data.otherResults,
      });

      setTimeout(() => {
        this.drawOtherResults();
        this.drawResultStep();
        this.drawPercentStep();
      });


    },
    drawOtherResults: function() {
      // 绘制其他结果的进度条
      // setTimeout(() => {
        this.data.otherResults.forEach(e => {
          e.animation = this.createAnimation(e.score);
        });
        this.setData({
          otherResults: this.data.otherResults,
        });
      // }, 10);
    },
    handleScreen: function() {
      let that = this;
      wx.getSystemInfo({
        success: function(res) {
          that.canvasW = res.screenWidth / 750 * 500;
          that.canvasH = res.screenWidth / 750 * 360;
        }
      });
    },
    drawPercentStep: function() {
      let p = parseFloat(parseFloat(this.data.result.value) + this.percentStep).toFixed(2);
      if(p > +this.target) {
        p = this.target;
      } else {
        setTimeout(this.drawPercentStep, this.delay);
      }
      this.setData({
        result: {
          value: p,
        },
      });
    },
    drawResultStep: function() {
      if(this.canvasFlag) {
        this.resultAngle -= this.angleStep;
        if(this.resultAngle < this.endAngle) {
          this.resultAngle = this.endAngle;
          this.canvasFlag = false;
        } else if (this.resultAngle < this.targetAngle&&this.resultAngle > this.targetAngle-this.angleStep) {
          this.resultAngle = this.targetAngle;
        }
        if (this.resultAngle < this.targetAngle&&this.resultAngle >= this.targetAngle-this.angleStep) {
          this.ctx.setStrokeStyle(this.wrongColor);
        }
        this.ctx.beginPath(); //开始一个新的路径
        this.ctx.arc(this.canvasW/2, this.canvasH/2, this.canvasH/3, this.resultAngle + this.angleStep * 1.1, this.resultAngle, true);
        this.ctx.setLineWidth(this.canvasH/6);
        this.ctx.stroke(); //对当前路径进行描边
        this.ctx.closePath(); //关闭当前路径
        this.ctx.draw(true);

        setTimeout(() => {
          this.drawResultStep();
        }, this.delay);
      }
    },
    getResult() {
      let answers = this.data.answers,
          len = 0,
          l = 0;
      for(let k in this.data.newAnswers) {
        let ans = answers[k];
        if(ans || ans == 0) len++;
        if(ans == this.data.newAnswers[k]) l++;
      }
      let res = parseFloat(l / len * 100).toFixed(2);
      if(isNaN(res)) res = 0;
      return res;
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
        user: state.entities.userInfo,
    }
};


pageConfig = connect(mapStateToData)(pageConfig)
Page(pageConfig);
