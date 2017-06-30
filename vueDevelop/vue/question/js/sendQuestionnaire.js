Vue.component('questionnaire', {
    template: '\
        <div id="questionnaire-bg" v-show="isShow">\
            <div class="send-que">问卷调查</div>\
            <i class="closeBtn" @click="closeBtn"></i>\
            <div class="scrollDiv">\
                <div v-for="(item,index) in queList" class="select-que" @click="selectQue(index)">\
                    <div class="topic">{{item.title}}</div>\
                    <i :class="{select:index==selectIndex}" class="unselect"></i>\
                </div>\
            </div>\
            <button class="sendBtn" @click="sendQuestionnaire">发起问卷</button>\
        </div>\
    ',
    data() {
        return {
            queList: [],
            gid: groupId,
            isConnected: 0, //管理员可不可以发送
            isShow: false,
            selectIndex: -1,
        }
    },
    mounted: function() {
        var that = this;

    },
    created: function() {
        questionnaire = this;
    },
    methods: {
        queryQuestionnaireByGid: function() {
            var that = this;
            that.isShow = true;
            $.ajax({
                type: "post",
                url: "ajx/wen_queryQuestionnaireByGid.do",
                data: "gid=" + that.gid,
                // data: params,
                dataType: "json",
                success: function(response) {
                    if (response.data.length != 0) {
                        that.queList = response.data;
                    }
                }
            });
        },
        selectQue: function(_index) {
            var that = this;
            that.selectIndex = _index;
        },
        sendQuestionnaire: function() {
            var that = this;
            if (this.isConnected == 0 && liveFlag != 0) {
                alert("聊天服务器已断开，请刷新页面");
                return;
            }
            var question = that.queList[that.selectIndex];
            var message = "#que_" + question.status + "_" + question.key + "_" + question.title;
            if (liveFlag == "0") {
                //历史视频发送问卷
                var data = "commentsinfo=" + message + "&cname=" + nickname + "&vid=" + vid + "&mobile=1";
                $.ajax({
                    "url": "./servlet/SendCommentsAction",
                    "type": "POST",
                    "data": data,
                    "success": function(data) {
                        $("#newcmt").val("");
                        $('#comments').scrollTop(0);
                    }
                });
                that.isShow = false;
			    $("#pop").fadeOut(400);
                var sendTime = new Date().format('yyyy-MM-dd hh:mm:ss');
                var cb = {
                    userName: nickname,
                    sendTime: sendTime,
                    messageInfo: message,
                    imgPath: img
                }
                gCommentBox = new CommentBox();
                gCommentBox.init($("#comments"), vid, userId);
                gCommentBox.showComment(cb, false);
                
            } else {
                sendQueMsg(message);
            }
        },
        showSendQue: function() {
            var that = this;
            if (this.isConnected == 0 && liveFlag != 0) {
                alert("聊天服务器已断开，请刷新页面");
                return;
            }
            $("#pop").show();
            that.queryQuestionnaireByGid();
        },
        closeBtn: function() {
            var that = this;
            that.isShow = false;
            $("#pop").fadeOut(400);
        }
    },

});

new Vue({
    el: '#vtcQuestionnaire'
});