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
            queList: [],//查询的问卷列表
            gid: videoInfo.groupId,
            isShow: false,//是否显示发送问卷的界面
            selectIndex: -1,//选择的问卷
        }
    },
    mounted: function() {
        var that = this;

    },
    created: function() {
        questionnaire = this;
    },
    methods: {
        queryQuestionnaireByGid: function() {//通过组ID查询问卷列表
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
        selectQue: function(_index) {//选择问卷的点击事件
            var that = this;
            that.selectIndex = _index;
        },
        sendQuestionnaire: function() {//点击发送问卷
            var that = this;
            var question = that.queList[that.selectIndex];
            var message = "#que_" + question.status + "_" + question.key + "_" + question.title;
            models.$refs.hudong.submitClick(message);
        },
        showSendQue: function() {//显示问卷列表的界面
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
