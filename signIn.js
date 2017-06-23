var signInId = 5; //图文模块的Id
var signInRef = queryModelRef(signInId); //图文模块的ref
var picAndTextCom = Vue.component('signin', {
    template: '\
        <div class="display-flex SIGN-window">\
            <div class="sign-top">\
                <p>签到人数:</p>\
                <p>0</p>\
                <p>人</p>\
            </div>\
            <div class="signIn display-flex">\
                <div class="show-sign" v-for="(item, index) in signInList">\
                    <p v-text="convertTime(item.signTime)"></p>\
                    <p>{{isAdminUser?item.nickname:item.realName}}</p>\
                    <p>签到啦</p>\
                </div>\
            </div>\
            <div class="signInBottom">\
                <div class="signInBtn" @click="showSign()">签到</div>\
            </div>\
            <transition name="fade">\
                <div class="signIn-out" @click="clickSign=false" v-show="clickSign">\
                    <div class="signIn-bottom" @click.stop>\
                        <div class="signIn-inner-top">请实名签到</div>\
                        <div class="signIn-inner-bottom">\
                            <input v-model="signInName">\
                            <p @click="clickSignIn()">签到</p>\
                        </div>\
                    </div>\
                </div>\
            </transition>\
        </div>\
    ',
    data() {
        return {
            clickSign: false,
            isSign:true,
            signInName: "",
            signInList: [],
            isAdminUser: userInfo.isAdminUser,
            videoId: videoInfo.videoId,
            nickname:userInfo.nickname,
            userId:userInfo.userId
        }
    },
    mounted: function() {
        var that = this;
    },
    created: function() {
        var that = this;
    },
    methods: {
        showSign:function(){
            var that = this;
            if(that.isSign){
                that.clickSign = true;
            }else{
                alert("您已签过到");
            }
        },
        clickSignIn: function() {
            var that = this;
            var realName1 = that.signInName;
            var vid = that.videoId;
            var nickname = that.nickname;
            var userId = that.userId;
            if (vid != null && vid != "" && userId != null && nickname != null && nickname != "" && realName1 != null && realName1 != "") {
                var data1 = "sign.videoId=" + vid + "&sign.userId=" + userId + "&sign.nickname=" + nickname + "&sign.realName=" + realName1;
                $.ajax({
                    "url": "ajx/userSign.do",
                    "type": "POST",
                    "data": data1,
                    "success": function(data) {
                        var res = data.result;
                        if (res == "OK") {
                            that.querySignInList();
                        } else {
                            alert("签到失败");
                        }
                        that.clickSign = false;
                    }
                });
            }
        },
        querySignInList: function() { //查询签到的列表
            var that = this;
            var data1 = "sign.videoId=" + that.videoId;
            $.ajax({
                "url": "ajx/querySignUser.do",
                "type": "POST",
                "data": data1,
                "success": function(data) {
                    that.signInList = [];
                    that.signInList = data.signList;
                    for(index in that.signInList){
                        if(that.signInList[index].userId == that.userId){
                            that.isSign = false;
                        }
                    }
                }
            });
        },
        //用于显示时间与现在的差值
        convertTime: function(time) {
            var result;
            var timeStr = time.replace("T", " ");
            timeStr = timeStr.replace(new RegExp(/-/g), "/"); //iphone时间问题
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

$(".extend-model").append("<div id='vtcSignIn' class='display-flex' v-show='" + signInId + " == selectModel'>\
                                <signin ref='" + signInRef + "'></signin>\
                            </div>\
                        ");
loadModels.finish++;