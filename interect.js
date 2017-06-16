var hudongId = 1; //互动模块的id
var hudongRef = queryModelRef(hudongId);//互动模块的ref
var interectCom = Vue.component('interect', {
    template: '\
    <div id="hudong" class="display-flex">\
        <div class="hudong display-flex">\
            <div style="text-align: center" class="loadHisMsgs" @click="loadHisMsgs" v-show="hasMore">{{hasMore}}</div>\
            <div class="hudong-out" v-for="(item,index) in msgDataArr">\
                <img :src="item.img" alt="" class="hudong-head" />\
                <div class="hudong-right">\
                    <div class="hudong-top">\
                        <div class="hudong-user">\
                            <span class="hudong-nick">{{item.nick}}</span>\
                            <img src="img/vtc-m/manager-icon-new.png" v-show="isAdminUser" class="hudong-admin">\
                        </div>\
                        <span class="hudong-time">{{item.sendtime}}</span>\
                    </div>\
                    <div class="hudong-bottom">{{item.body}}</div>\
                </div>\
            </div>\
        </div>\
        <div class="chatTextPar">\
            <img src="img/btn_sendRB.png" class="hudong-fav" style="display:none;"/>\
            <img src="img/vtc-m/favour.png" class="hudong-fav"/>\
            <div class="chat_text">\
                <div id="chat_text" v-text="sendMsg" contenteditable="true" @keyup="divModel($event)" placeholder="说点什么吧~"></div>\
            </div>\
            <a id="send_message_button" @click="submitClick" @keypress:enter="submitClick">发送</a>\
        </div>\
    </div>\
    ',
    data() {
        return {
            msgDataArr: [],
            sendMsg: "",
            nickname: userInfo.nickname,
            userImage: "pic/default-user-photo.jpg",
            userId: userInfo.userId,
            isAdminUser: false,
            isGetOnlineCnt: true,
            onlineCnt: 0,
            isNeedScroll: true, //是否还需要向下滚动
            isGetHisMsg: true, //是否主动去获取历史消息
            lasttimestamp: "", //最后一条消息的时间戳
            thisHisMsgNum: 0, //获取的历史消息的总数
            isFirstGetHisMsg: true, //是否是第一次去获取历史消息
            hasMore: "...", //判断是否还有更多的消息
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
        divModel: function(e) {
            var that = this;
            that.sendMsg = e.target.innerText;
        },
        submitClick: function() { //发送互动消息
            var that = this;
            now = new Date();
            var mtime = (now.getHours() < 10) ? "0" + now.getHours() : now.getHours();
            mtime += ":";
            mtime += (now.getMinutes() < 10) ? "0" + now.getMinutes() : now.getMinutes();
            var body = that.sendMsg;

            // 发送cnd消息
            if (body != "") {
                var send = {
                    nick: that.nickname,
                    type: 1,
                    body: that.sendMsg,
                    sendtime: mtime,
                    img: that.userImage,
                    userId: that.userId,
                }
                that.msgDataArr.push(send);
                that.sc(); //每发一条消息，滚动到最新的消息
                if (netimobj) {
                    netimobj.sendmsg(send,
                        function(res) {
                            console.log("Send message successfully");
                            that.sendMsg = "";
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
            roomid = player.videoInfo.videoId;
            //cdn方案及时通信
            netimobj = new netim();
            netimobj.register("message", that.getMsg);
            netimobj.register("stats", that.stats);
            netimobj.checkin(location.hostname, 9876, roomid, mynick,
                function(res) {
                    console.log("The checkin good rc=" + res.code);
                },
                function(res) {
                    console.log("The checkin bad rc=" + res.code);
                },
                function() {
                    console.log("The checkin completed");
                });
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
        getMsg: function(res) { //获取及时聊天的消息
            var that = this;
            if (player.videoInfo.liveFlag != 0) {
                netimobj.stats(); //直播时,轮询stats方法,显示实时人数
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
                        that.sc();
                    }
                }
            } else {
                console.log("Got message but bad rc = " + res.code);
            }
        },
        gethisMsg: function() { //获取历史消息
            var that = this;
            if (netimobj) {
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
        loadHisMsgs: function() { //点击更多去加载以前的消息
            var that = this;
            that.gethisMsg();
            that.isNeedScroll = false;
        },
        showHisMsg: function(res) {
            var that = this;
            that.isGetHisMsg = false;
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
                            }

                            if (that.isFirstGetHisMsg) {
                                $("#hudong").scrollTop($("#hudong")[0].scrollHeight);
                                that.isFirstGetHisMsg = false;
                            }
                        }
                    }
                } else {
                    that.hasMore = ""; //当没有查到的历史消息时，就不能加载以前的消息了
                }
            } else {
                console.log("Got message but bad rc = " + res.code);
            }
        },
        sc: function() {
            var that = this;
            var div = document.getElementById("hudong");
            scrollLength = div.scrollHeight;
            $('.hudong').animate({
                scrollTop: scrollLength
            }, 200);
        },
        iphoneInput: function() {
            //解决iphone上评论的窗口输入文字后整个页面问题
            if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
                $('#chat_text').focus(function() {
                    document.body.scrollTop = document.body.scrollHeight;
                    $('.bottom-box').css('margin-bottom', '0px');

                    setTimeout(function() {
                        $('.chatTextPar').css("margin-bottom", "50px");
                    }, 100);
                }).blur(function() {
                    var videBox = $(window).width();
                    $('.bottom-box').css('margin-top', $(".fix-top").height() || 0);

                    setTimeout(function() {
                        $('.chatTextPar').css("margin-bottom", "0px");
                    }, 100);
                })
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
                                <interect ref="+hudongRef+"></interect>\
                            </div>\
                        ");
loadModels.finish++;