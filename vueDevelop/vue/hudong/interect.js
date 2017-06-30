var hudongId = 1; //互动模块的id
var hudongRef = queryModelRef(hudongId); //互动模块的ref
var interectCom = Vue.component('interect', {
    template: '\
    <div id="hudong" class="display-flex">\
        <div class="hudong display-flex" @scroll="scrollInterect($event)" :style="{backgroundColor:(hasMore?\'#eee\':\'#fff\')}">\
            <div style="text-align: center" class="loadHisMsgs" @click="gethisMsg" v-show="hasMore">{{hasMore}}</div>\
            <div class="hudong-out" v-for="(item,index) in msgDataArr">\
                <img :src="item.img" alt="" class="hudong-head" />\
                <div class="hudong-right">\
                    <div class="hudong-top">\
                        <div class="hudong-user">\
                            <span class="hudong-nick">{{item.nick}}</span>\
                            <img src="img/vtc-m/manager-icon-new.png" v-show="item.userId.length==6" class="hudong-admin">\
                        </div>\
                        <span class="hudong-time">{{item.sendtime}}</span>\
                    </div>\
                    <span @click="grabeRB(item.body.split(\'_\')[1])" v-if="item.body.indexOf(\'#rb_\')==0" class="chat_arrow_me">\
                        <img class="rb_img" src="img/img_RB.png"/>\
                        <p class="rb_topic">{{item.body.split("_")[2]}}</p>\
                        <p class="rb_check">查看红包</p>\
                    </span>\
                    <span @click="intoQuestion(item.body.split(\'_\')[2])" v-else-if="item.body.indexOf(\'#que_\')==0" class="chat_arrow_me">\
                        <img class="rb_img" src="img/img_QUE.png"/>\
                        <p class="que_topic">{{item.body.split("_")[3]}}</p>\
                        <p class="que_check">查看问卷</p>\
                    </span>\
                    <div class="hudong-bottom" v-else>{{item.body}}</div>\
                </div>\
            </div>\
        </div>\
        <div class="chatTextPar">\
            <img src="img/vtc-m/favour.png" class="hudong-fav" @click="imgAnimate()"/>\
            <div class="chat_text">\
                <div id="chat_text" contenteditable="true" @keypress.13 ="submitClick()" @focus="focusInput" @blur="blurInput" placeholder="说点什么吧~"></div>\
            </div>\
            <a id="send_message_button" @click="submitClick()">发送</a>\
        </div>\
        <div v-show="isAdminUser&&animateModu" :class="[\'extend-model\',\'hudongAnimated\',{slideOutRight :!isOpen},{slideInLeft:isOpen}]" >\
            <div @click="isOpen=!isOpen" :class="{rotateDiv :!isOpen}"><i class="iconfont">&#xe624</i></div>\
            <div style="width:50px;margin-left:22px;">\
                <img src="img/sendQueBtn.png" v-show="queModu" class="extend-qa" @click="sendQuestionnaire()"/>\
                <img src="img/btn_sendRB.png" v-show="redModu" class="extend-rb" @click="sendPacket()"/>\
            </div>\
        </div>\
    </div>\
    ',
    data() {
        return {
            msgDataArr: [],
            nickname: userInfo.nickname,
            userImage: userInfo.wxImgHead == "" ? "pic/default-user-photo.jpg" : userInfo.wxImgHead,
            userId: userInfo.userId,
            isAdminUser: userInfo.isAdminUser,
            isGetOnlineCnt: true,
            onlineCnt: 0,
            isNeedScroll: true, //是否还需要向下滚动
            isGetHisMsg: true, //是否主动去获取历史消息
            lasttimestamp: "", //最后一条消息的时间戳
            thisHisMsgNum: 0, //获取的历史消息的总数
            isFirstGetHisMsg: true, //是否是第一次去获取历史消息
            hasMore: "上拉加载", //判断是否还有更多的消息
            interectScroll: true, //互动是否在滚动
            scrollTop1: 0,
            isOpen: true,
            isLike: true,
            roomId: videoInfo.liveWay == 1 ? videoInfo.rid : videoInfo.videoId, //导播以场次ID作为roomid，并行直播以videoId作为roomId
            isChangeOnline: false,
            animateModu: recordInfo.redPacket || recordInfo.questionnaire ? true : false,
            redModu: recordInfo.redPacket,
            queModu: recordInfo.questionnaire
        }
    },
    mounted: function() {
        var that = this;
    },
    created: function() {
        var that = this;
        interect = this;
        that.initNeti();
    },
    methods: {
        submitClick: function(msg) { //发送互动消息
            var that = this;
            now = new Date();
            var mtime = (now.getHours() < 10) ? "0" + now.getHours() : now.getHours();
            mtime += ":";
            mtime += (now.getMinutes() < 10) ? "0" + now.getMinutes() : now.getMinutes();
            var body = $("#chat_text").text()

            // 发送cnd消息
            if (body != "" || msg) {
                var send = {
                    nick: that.nickname,
                    type: 1,
                    body: msg ? msg : body,
                    sendtime: mtime,
                    img: that.userImage,
                    userId: that.userId,
                    userStatus: userInfo.isAdminUser
                }
                that.msgDataArr.push(send);
                sendDanmu(body, true);
                that.sc(); //每发一条消息，滚动到最新的消息
                if (netimobj) {
                    netimobj.sendmsg(send,
                        function(res) {
                            console.log("Send message successfully");
                            $("#chat_text").text("");
                        },
                        function(code) {
                            console.log("Send message failed");
                        });
                }
            }
        },
        initNeti: function() { //init netimobj
            var that = this;
            mynick = that.nickname;
            myuid = that.userId;
            roomid = that.roomId;
            //cdn方案及时通信
            netimobj = new netim();
            netimobj.register("message", that.getMsg);
            netimobj.register("stats", that.stats);
            netimobj.register("like", that.showLike);
            netimobj.checkin(location.hostname, 80, roomid, mynick,
                function(res) {
                    console.log("The checkin good rc=" + res.code);
                },
                function(res) {
                    that.hasMore = "聊天服务器断开";
                    console.log("The checkin bad rc=" + res.code);
                },
                function() {
                    console.log("The checkin completed");
                });
        },
        showLike: function(res) { //显示点赞数
            var that = this;
            player.$refs.controls.likeCnt = res.count;
        },
        stats: function(res) { //注册
            var that = this;
            that.onlineCnt = res.count;
            var leaveCnt = res.leaveCount;
            if (player.videoInfo.liveFlag != 0) {
                that.onlineCnt = that.onlineCnt - leaveCnt;
            }
            //显示注册的人数，显示在线人数
            player.$refs.controls.viewCnt = that.onlineCnt;
        },
        queryOnlineCnt: function(resolve, reject) { //查修改人数的文件
            var that = this;
            var url = queryFilePath() + "onlineCnt/" + videoInfo.videoId + ".json";
            $.ajax({
                url: url,
                type: "get",
                dataType: "json",
                success: function(res) {
                    that.onlineCnt = res.count;
                    player.$refs.controls.viewCnt = that.onlineCnt;
                    resolve();
                    that.isChangeOnline = true;
                },
                error: function() {
                    reject();
                }
            })
        },
        getMsg: function(res) { //获取及时聊天的消息
            var that = this;
            if (player.videoInfo.liveFlag != 0) {
                //先查文件是否存在修改的人数
                new Promise(that.queryOnlineCnt).then(function() {
                    console.log("对的")
                }).catch(function() {
                    netimobj.stats(); //直播时,轮询stats方法,显示实时人数
                });
            } else { //非直播时,显示人数只增
                if (that.isGetOnlineCnt) {
                    netimobj.stats();
                    that.isGetOnlineCnt = false;
                }
                for (var i = 0; i < res.users.length; i++) {
                    console.log("有人登录了:" + res.users[i]);
                    if (res.users[i] != mynick) {
                        that.onlineCnt++;
                        console.log("自己登录的不算数");
                    }
                }
                player.$refs.controls.viewCnt = that.onlineCnt;
            }
            if (that.isGetHisMsg) {
                that.lasttimestamp = res.lastStamp;
                that.gethisMsg();
            }
            netimobj.likeCount();
            //定时刷新cnd消息
            if (res.code == 0) {
                var i = 0;
                for (i = 0; i < res.count; i++) {
                    if (res.messages[i].userId != that.userId) {
                        var msg = res.messages[i];
                        var mtime = msg.timestamp;
                        mtime = that.getDate(mtime);
                        msg.sendtime = mtime;
                        that.msgDataArr.push(msg);
                        sendDanmu(msg.body);
                        that.sc();
                    }
                }
            } else {
                console.log("Got message but bad rc = " + res.code);
            }
        },
        gethisMsg: function() { //获取历史消息
            var that = this;
            if (netimobj && that.hasMore != "") {
                if (that.lasttimestamp == -1) {
                    that.hasMore = "";
                } else {
                    netimobj.gethismsgs({
                        laststamp: that.lasttimestamp
                    });
                }
            }
        },
        getDate: function(tm) {
            var now = new Date();
            var diff = parseInt((now.getTime() - tm * 1000) / (1000 * 60));
            if (diff > 60 * 24) {
                var tt = new Date(parseInt(tm) * 1000).toLocaleString('chinese', {
                    hour12: false
                });
                tt = tt.substr(0, tt.length - 3);
                return tt;
            } else {
                var tt = new Date(parseInt(tm) * 1000).toLocaleTimeString('chinese', {
                    hour12: false
                });
                tt = tt.substr(0, tt.length - 3);
                return tt;
            }
        },
        scrollInterect: function(_this) {
            var that = this;
            var scrollTop = _this.target.scrollTop;
            var clientHeight = _this.target.clientHeight;
            var scrollHeight = _this.target.scrollHeight;
            if (scrollTop == 0) {
                if (that.interectScroll) {
                    that.interectScroll = false;
                    that.gethisMsg();
                    that.isNeedScroll = false;
                }
            }
            //滚动聊天栏时，整个页面不滚动
            _this.preventDefault();
            _this.stopPropagation();

        },
        showHisMsg: function(res) {
            var that = this;
            that.isGetHisMsg = false;
            that.interectScroll = true;
            //定时刷新cnd消息
            if (res.code == 0) {
                if (res.count != 0) {
                    that.thisHisMsgNum += res.count;
                    var i = 0;
                    for (i = res.count; i > 0; i--) {
                        var msg = res.messages[i - 1];
                        var userIcon = msg.img;
                        var mtime = msg.timestamp;
                        mtime = that.getDate(mtime);
                        msg.sendtime = mtime;
                        that.msgDataArr.unshift(msg);
                    }
                    /***获取一页消息后,判断是否还要再请求***/
                    var contentTextHeight = 0;
                    for (var x = 0; x < that.thisHisMsgNum; x++) {
                        contentTextHeight += 51;
                    }
                    if (res.lastStamp != null) {
                        that.lasttimestamp = res.lastStamp;
                        if (contentTextHeight < $("#hudong").height()) { //判断当前获取的历史消息数是否够一页
                            //当历史聊天内容不足以填满全部聊天框之后,再向前请求一次聊天内容
                            interect.gethisMsg();
                        } else {

                            that.thisHisMsgNum = 0; //够一页就清零
                            if (that.isNeedScroll) {
                                that.sc();
                            } else {
                                setTimeout(function() {
                                    $(".hudong").scrollTop($(".hudong")[0].scrollHeight - that.scrollTop1);
                                }, 100);

                            }
                            setTimeout(function() {
                                that.scrollTop1 = $(".hudong")[0].scrollHeight;
                            }, 100)
                        }
                    }
                } else {
                    that.hasMore = ""; //当没有查到的历史消息时，就不能加载以前的消息了
                }
            } else {
                console.log("Got message but bad rc = " + res.code);
            }
        },
        sc: function() { //收到或者发送消息成功，滚动到最新消息
            setTimeout(function() {
                var that = this;
                var scrollLength = $(".hudong")[0].scrollHeight;
                $('.hudong').animate({
                    scrollTop: scrollLength
                }, 200);
            }, 100)
        },
        focusInput: function() {
            if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
                setTimeout(function() {
                    $('.chatTextPar').css("margin-bottom", "50px");
                    $('.extend-model').css("bottom", "100px");
                }, 100);
            }
        },
        blurInput: function() {
            if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
                setTimeout(function() {
                    $('.chatTextPar').css("margin-bottom", "0px");
                    $('.extend-model').css("bottom", "50px");
                }, 100);
            }
        },
        grabeRB: function(rbId) { //显示红包
            redPacket.showGrap(rbId);
        },
        sendPacket: function() { //显示发红包
            redPacket.showSend();
        },
        //发送问卷的方法
        sendQuestionnaire: function() {
            questionnaire.showSendQue();
        },
        //跳转问卷的方法
        intoQuestion: function(_qid) {
            $.ajax({
                url: "ajx/wen_selectUserCommit.do",
                data: "qid=" + _qid + "&userId=" + userInfo.userId,
                success: function(response) {
                    if (!response.data) {
                        window.location.href = "showQuestionnaire.html?groupId=" + videoInfo.groupId + "&queId=" + _qid + "&show=0&userId=" + userInfo.userId + "&rid=" + videoInfo.rid;
                    } else {
                        alert("您已参与过本次问卷");
                    }
                }
            });
        },
        imgAnimate: function() { //点赞按钮的点击事件
            var that = this;
            if (that.isLike) {
                var $demo = $(".demo");
                var x = 10;
                var y = $(window).width();
                var num = Math.floor(Math.random() * 3 + 1);
                var index = $('.demo').children('img').length;
                var rand = parseInt(Math.random() * (x - y + 1) + y);
                var $img = $("<img class='animate-img' src='img/vtc-m/favour.png'>")
                $demo.append($img);
                // $('.demo img:eq(' + index + ')').attr('src',)
                $img.animate({
                    bottom: "500px",
                    opacity: "0",
                    left: rand,
                }, 3000, function() {
                    $(this).remove()
                })
                that.isLike = false;
                setTimeout(function() {
                    that.isLike = true;
                }, 200)
            }

            //read localstorage 
            if (!getLocalStorage("like_" + that.roomId)) {
                //cdn方案点赞
                netimobj.like(location.hostname, 80, that.roomId, that.nickname,
                    function(res) {
                        console.log("The like good rc=" + res.code);
                        if (!window.localStorage) {
                            //如果浏览器不支持localstorage
                        } else {
                            //write localstorage
                            setLocalStorage("like_" + that.roomId, true) //点赞成功后，根据聊天室ID存储localstorage，防止重复点赞
                        }
                    },
                    function(res) {
                        console.log("The like bad rc=" + res.code);
                    },
                    function() {
                        console.log("The like completed");
                    });
            }
        }
    },
    watch: {
        vtcInterectModHeight: function() {
            console.log("高度" + this.vtcInterectModHeight);
        }
    }
});

function showHisMsg(res) {
    interect.showHisMsg(res);
}
$(".extend-model").append("<div id='vtcInterectMod' class='display-flex' v-show='" + hudongId + " == selectModel'>\
                                <interect ref=" + hudongRef + "></interect>\
                            </div>\
                        ");
loadModels.finish++;

window.onbeforeunload = function() {
    netimobj.checkout();
}

function setLocalStorage(objname, obj) { //存储localstorage
    var storage = window.localStorage;
    if (window.localStorage) {
        storage.setItem(objname, obj);
    } else {
        console.log("dont support LocalStorage");
    }
}

function getLocalStorage(objname) { //取localstorage
    var storage = window.localStorage;
    var result;
    if (window.localStorage) {
        result = storage.getItem(objname);
    } else {
        console.log("dont support LocalStorage");
        result = null;
    }
    return result;
}

$(function() {
    window.addEventListener("popstate", function(e) {
        netimobj.checkout();
    }, false);
});