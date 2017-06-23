var queAndAnswerId = 4; //图文模块的Id
var queAndAnswerRef = queryModelRef(queAndAnswerId); //图文模块的ref
var picAndTextCom = Vue.component('queandanswer', {
    template: '\
        <div id="queAndAns" class="display-flex">\
            <div class="queAndAns display-flex">\
                <div class="show-que" v-for="(item, index) in qaList">\
                    <div class="que-top">\
                        <div class="que-left">\
                            <span class="que-name" v-text="item.q_nickname" :style="{color:(item.q_role==admin?\'#1eb2ff\':\'#000\')}"></span>\
                            <img src="img/vtc-m/manager-icon-new.png" v-show="item.q_role==admin" class="que-icon" />\
                            <span class="que-time" v-text="convertTime(item.q_time)"></span>\
                        </div>\
                        <div class="que-right">\
                            <dt style="background-image: url(img/vtc-m/icon_delete.png);width: 18px;height: 13px;background-size: 11px;background-repeat: no-repeat;display: inline-block;" v-show="isAdminUser"></dt>\
                            <span style="color: #ccc;margin-right: 15px;font-size: 14px;" v-show="isAdminUser" @click="deleteQue(item.tid)">删除</span>\
                            <dt style="background-image: url(img/vtc-m/icon_answer.png);width: 18px;height: 13px;background-size: 13px;background-repeat: no-repeat;display: inline-block;"></dt>\
                            <span style="color: #ccc;font-size: 14px;" @click="clickAnswer(item.tid)">{{questionId==item.tid?\'取消\':\'回答\'}}</span>\
                        </div>\
                    </div>\
                    <div v-text="item.question"></div>\
                    <div class="answer-div" v-for="(item1, index1) in item.answers">\
                        <span @click="deleteAns(item1.tid)">\
                            <a v-text="item1.a_nickname" :style="{color:(item1.a_role==admin?\'#1eb2ff\':\'#000\')}"></a>\
                            <a :style="{color:(item1.a_role==admin?\'#1eb2ff\':\'#000\')}">&nbsp;:&nbsp;</a>\
                        </span>\
                        <a style="line-height: 16px;" v-text="item1.answer"></a>\
                    </div>\
                </div>\
            </div>\
            <div class="que-text-par">\
                <textarea class="chat_text" v-model="sendMsg" :placeHolder="placeHolder" id="queText"></textarea>\
                <a id="send_message_button" @click="submitClick()">{{isAnswer?\'回答\':\'发送\'}}</a>\
            </div>\
        </div>\
    ',
    data() {
        return {
            qaList: [],
            isAdminUser: userInfo.isAdminUser,
            videoId: videoInfo.videoId,
            nickname: userInfo.nickname,
            userId: userInfo.userId,
            admin: "admin",
            placeHolder: "输入问题",
            isAnswer: false,
            questionId: -1,
            sendMsg: "",
        }
    },
    mounted: function() {
        var that = this;
        // that.queryPicAndText();
    },
    created: function() {
        var that = this;
    },
    methods: {
        queryQaList: function() {
            var that = this;
            var data1 = "qa.videoId=" + that.videoId;
            $.ajax({
                "url": "ajx/queryQaList.do",
                "type": "POST",
                "data": data1,
                "success": function(data) {
                    var res = data.qaList;
                    if (res.length <= 0) {
                        that.qaList = [];
                    } else {
                        that.qaList = [];
                        that.qaList = res;
                    }
                }
            });
        },
        clickAnswer: function(_qId) {
            var that = this;
            that.isAnswer = !that.isAnswer;
            if (that.isAnswer) {
                $("#queText").focus();
                that.placeHolder = "输入答案";
                that.questionId = _qId;
            } else {
                that.placeHolder = "输入问题";
                that.questionId = -1;
            }
        },
        submitClick: function() {
            var that = this;
            if (!that.isAnswer) {
                that.commitQue(); //提问
            } else {
                that.commitAns(); //回答
            }
        },
        commitQue: function() { //提问
            var that = this;
            var commitQue = that.sendMsg;
            var vid = that.videoId;
            var userId = that.userId;
            var nickname = that.nickname;
            var userStatus = that.isAdminUser ? "admin" : "tourist";
            if (vid != null && vid != "" && userId != null  && nickname != null && nickname != "" && commitQue != null && commitQue != "") {
                var data1 = "qa.videoId=" + vid + "&qa.q_userId=" + userId + "&qa.q_nickname=" + nickname + "&qa.question=" + commitQue + "&qa.q_role=" + userStatus;
                $.ajax({
                    "url": "ajx/ask.do",
                    "type": "POST",
                    "data": data1,
                    "success": function(data) {
                        var res = data.result;
                        if (res == "OK") {
                            that.queryQaList();
                            that.sendMsg = "";
                        } else {
                            alert("提问失败");
                        }
                    }
                })
            }else{
                alert("未登录");
            }
        },
        commitAns: function() {
            var that = this;
            var commitAns = that.sendMsg;
            var vid = that.videoId;
            var userId = that.userId;
            var nickname = that.nickname;
            var userStatus = that.isAdminUser ? "admin" : "tourist";
            var answerTid = that.questionId;
            if (vid != null && vid != "" && userId != null && nickname != null && nickname != "" && commitAns != null && commitAns != "") {
                var data1 = "answer.qid=" + answerTid + "&answer.a_userId=" + userId + "&answer.a_nickname=" + nickname + "&answer.answer=" + commitAns + "&answer.a_role=" + userStatus;
                $.ajax({
                    "url": "ajx/answer.do",
                    "type": "POST",
                    "data": data1,
                    "success": function(data) {
                        var res = data.result;
                        if (res == "OK") {
                            that.isAnswer = false;
                            that.questionId = -1;
                            that.sendMsg = "";
                            that.queryQaList();
                        } else {
                            alert("回答失败");
                        }
                    }
                });
            }
        },
        deleteQue: function(_qId) { //删除问题
            var that = this;
            data1 = "qa.tid=" + _qId;
            if (confirm("是否确认删除问题?")) {
                $.ajax({
                    "url": "ajx/delete.do",
                    "type": "POST",
                    "data": data1,
                    "success": function(data) {
                        var res = data.result;
                        if (res == "OK") {
                            that.queryQaList();
                        } else {
                            alert("删除失败");
                        }
                    }
                });
            }
        },
        deleteAns: function(_aId) { //删除答案
            var that = this;
            data1 = "answer.tid=" + _aId;
            if (confirm("是否确认删除答案?")) {
                $.ajax({
                    "url": "ajx/delete.do",
                    "type": "POST",
                    "data": data1,
                    "success": function(data) {
                        var res = data.result;
                        if (res == "OK") {
                            that.queryQaList();
                        } else {
                            alert("删除失败");
                        }
                    }
                });

            }
        },
        //用于显示时间与现在的差值
        convertTime: function(time) {
            var result;
            var timeStr = time.replace("T", " ");
            timeStr = timeStr.replace(new RegExp(/-/g),"/");//iphone时间问题
            time = new Date(timeStr);
            var now = new Date();
            var diff = parseInt((now.getTime() - time.getTime()) / (1000 * 60));
            if (diff < 1) {
                result = "刚刚";
            } else if (1 < diff && diff < 60) {
                result = diff + "分钟前";
            } else if (60 <= diff && diff < 60 * 24) {
                diff = parseInt(diff / 60);
                result = diff + "小时前";
            } else {
                result = timeStr;
            }
            return result;
        }
    },
    computed: {

    }
});

$(".extend-model").append("<div id='vtcQueAndAns' class='display-flex' v-show='" + queAndAnswerId + " == selectModel'>\
                                <queandanswer ref='" + queAndAnswerRef + "'></queandanswer>\
                            </div>\
                        ");
loadModels.finish++;