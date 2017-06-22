Vue.component('questionnaire', {
    template: '\
        <div id="questionnaire-bg" v-show="isShow" @click="closeBtn">\
            <div class="questionnaire-pre" @click.stop>\
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
        </div>\
    ',
    data() {
        return {
            queList: [],
            gid: videoInfo.groupId,
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
            var question = that.queList[that.selectIndex];
            var message = "#que_" + question.status + "_" + question.key + "_" + question.title;
            models.$refs.hudong.submitClick(message);
        },
        showSendQue: function() {
            var that = this;
            $("#pop").show();
            that.queryQuestionnaireByGid();
        },
        closeBtn: function() {
            var that = this;
            that.isShow = false;
        }
    },

});

new Vue({
    el: '#vtcQuestionnaire'
});
// $(".extend-model").append("<div id='vtcRedPacket'>\
//                                 <red-packet></red-packet>\
//                             </div>\
//                         ");
