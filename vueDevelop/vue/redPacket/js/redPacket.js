Vue.component('redPacket', {
    template: '\
    <div id="red-packet-bg" v-show="showStatus !=0 ">\
        <transition enter-active-class="animated bounceIn">\
            <!--打开红包-->\
            <div id="redPacket" v-show="showStatus==1">\
                <div class="main xy-center">\
                    <div class="close" @click="close"></div>\
                    <div class="header x-center">{{redPacketInfo.topic}}</div>\
                    <div class="desc x-center">{{redPacketInfo.description}}</div>\
                    <div class="grab xy-center" @click="openPacket"></div>\
                    <div class="showall x-center" @click="showOther(false)">看看大家的手气 ></div>\
                </div>\
            </div>\
        </transition>\
            <!--红包抢完了红包-->\
            <transition enter-active-class="animated bounceIn">\
                <div id="redPacketOver" v-show="showStatus==2">\
                    <div class="main xy-center">\
                        <div class="close" @click="close"></div>\
                        <div class="header x-center">{{redPacketInfo.topic}}</div>\
                        <div class="desc x-center">手太慢,红包派完了！</div>\
                        <div class="showall x-center" @click="showOther(false)">看看大家的手气 ></div>\
                    </div>\
                </div>\
            </transition>\
        <!--发红包-->\
        <div id="sendRedPacket" v-show="showStatus==8">\
            <div class="main xy-center">\
                <div class="close" @click="close"></div>\
                <div class="header"></div>\
                <div class="body">\
                    <div>\
                        <span class="title">总金额</span> \
                        <span class="unit">元</span> \
                        <input type="number" name="" v-model="rpb.amount" placeholder="0.00">\
                        <span class="tip">每个人抽到的金额随机</span>\
                    </div>\
                    <div>\
                        <span class="title">红包个数</span> \
                        <span class="unit">个</span>\
                        <input type="number" name="" v-model="rpb.count"  placeholder="填写个数">\
                    </div>\
                    <div>\
                        <span class="title">标题</span> \
                        <input type="text" name="" maxlength="8" v-model="rpb.topic"  placeholder="VTC的红包">\
                    </div>\
                    <div>\
                        <span class="title">留言</span> \
                        <input type="text" name="" maxlength="15" v-model="rpb.desc"  placeholder="恭喜发财,大吉大利">\
                    </div>\
                </div>\
                <div class="footer">\
                    <button @click="sendRedPacket">塞钱</button>\
                    <span class="tip">剩余可用红包余额<span>{{balance}}</span>元</span>\
                </div>\
            </div>\
        </div>\
        <transition enter-active-class=" animated bounceIn">\
            <!--大家的手气-->\
            <div id="redPacketList" v-show="showStatus==3">\
                <div class="main xy-center">\
                    <div class="header" :class="{ headernoamount : !isGetted }">\
                        <div class="close" @click="close"></div>\
                        <div class="title">{{redPacketInfo.topic}}</div>\
                        <div class="desc">{{redPacketInfo.description}}</div>\
                        <div v-show="isGetted">\
                            <div class="money">{{myAmount/100.00}}元</div>\
                            <div class="tip">已转入微信零钱</div>\
                        </div> \
                    </div>\
                    <div class="userList" :class="{ biguserList : !isGetted }">\
                        <p :class="{ headerp : !isGetted }">已领取 <span>{{userList.length}}</span>/<span>{{redPacketInfo.count}}</span>个  共 <span>{{userAllAmount/100.00}}</span>/<span>{{redPacketInfo.amount/100.00}}</span>元 </p>\
                        <ul>\
                            <li v-for="item in userList">\
                                <img :src="item.userHeadImg" width="35px">\
                                <div class="name">{{item.userNick}}</div>\
                                <div class="timer">{{ new Date( parseInt(item.time) ).Format("hh:mm:ss") }}</div>\
                                <div class="money">{{item.amount/100.00}}元</div>\
                                <div class="best" v-show=" userList.length==redPacketInfo.count && item.isBest==1"><img src="img/redPacket/best.png" height="16px"><span>手气最佳</span>  </div>\
                            </li>\
                        </ul>\
                    </div>\
                </div>\
            </div>\
        </transition>\
        <!--加载提示-->\
        <div v-show="msg.length>0" class="red-loading xy-center">\
            {{msg}}\
        </div>\
    </div>\
    ',
    data() {
        return {
            showStatus: 0,
            isGetted: false,
            redPacketInfo: {
                topic: "VTC的大红包",
                description: "恭喜发财,大吉大利",
                amount: 0,
                count: 0
            }, //红包信息
            rpb: {
                amount: '',
                count: '',
                groupId: groupId,
                recordId: GetQueryString("rid"),
                topic: '',
                desc: ''
            }, //发红包的参数
            send: {
                sender: userId,
                message: '#rb_',
                groupName: group_name
            }, //XMPP发送参数
            wxInfo: {
                userNick: '',
                userHeadImg: '',
                wxOpenId: ''
            },
            userList: [], //抢到的用户列表
            userAllAmount: 0, //用户已经抢到的钱
            redPacketId: 29, //红包ID
            myAmount: 0, //用户抢到的钱
            balance: 0, //剩余红包钱
            isConnected: 0, //管理员可不可以发送
            msg: ''
        }
    },
    created: function() {
        redPacket = this;
    },
    methods: {
        init: function() {
            this.myAmount = 0;
            this.balance = 0;
            this.userAllAmount = 0;
            this.rpb.amount = '';
            this.rpb.count = '';
            this.rpb.topic = '';
            this.rpb.desc = '';
            this.send.message = '#rb_';
            this.msg = '';
        },
        showSend: function() {
            this.init();
            if (this.isConnected == 0) {
                alert("聊天服务器已断开，请刷新页面");
                return;
            }
            this.showStatus = 8;
            this.queryGroupBalance();
        },
        showGrap: function(redPacketId) {
            this.init();
            this.redPacketId = redPacketId;
            if (isAdminUser == "admin") {
                this.showOther();
                return;
            }
            this.wxInfo = JSON.parse(localStorage.getItem("wxInfo"));
            if (!this.wxInfo) {
                alert("先登录才可以抢红包!")
                return;
            }
            this.queryPacketStatus();
        },
        queryPacketStatus: function() {
            var that = this;
            that.wxInfo.redPacketId = that.redPacketId;
            $.ajax({
                type: "get",
                url: "ajx/rp_queryPacketStatus.do",
                data: searchParams(this.wxInfo),
                success: function(response) {
                    that.redPacketInfo = response.data.redPacketInfo[0];
                    if (response.code == 902) {
                        that.showStatus = 2;
                    } else if (response.code == 906) {
                        var myGrabInfo = response.data.myGrabInfo[0];
                        that.myAmount = myGrabInfo.amount;
                        if (myGrabInfo.erro && myGrabInfo.erro == "V2_ACCOUNT_SIMPLE_BAN") {
                            alert("由于你未实名认证,红包转账失败!")
                            return;
                        }
                        that.userList = response.data.usersInfo;
                        that.sumUserAmount();
                        that.showStatus = 3;
                    } else {
                        that.showStatus = 1;
                    }
                }
            });
        },
        sendRedPacket: function() {
            //判断是否超余额
            var that = this;
            var _rpb = copy(that.rpb);
            var _send = copy(that.send);
            if (_rpb.amount * 100 > that.balance * 100) {
                alert("账户余额不足")
                return;
            }
            if (_rpb.amount * 100 < _rpb.count * 100) {
                alert("至少保证每个人可以抢到一元钱")
                return;
            }
            _rpb.amount *= 100;
            if (_rpb.topic == '') {
                _rpb.topic = 'VTC的红包';
            }
            if (_rpb.desc == '') {
                _rpb.desc = '恭喜发财,大吉大利';
            }
            if (that.isConnected == 0) {
                alert("聊天服务器已断开，请刷新页面");
                that.init();
                that.showStatus = 0;
                return;
            }
            that.msg = '正在发送红包...';
            $.ajax({
                type: "get",
                url: "ajx/createRedPacket.do",
                data: searchParams(_rpb, "rpb"),
                success: function(response) {
                    if (response.code == 0) {
                        _send.message += response.data;
                        _send.message += "_" + _rpb.topic;
                        that.redPacketId = response.data;

                        sendRBMsg(_send.message);
                        that.showStatus = 0;
                        that.init();
                    } else {
                        alert(response.msg)
                    }
                    that.msg = '';
                },
                error: function() {
                    that.msg = '发送失败';
                }
            });
        },
        openPacket: function() {
            var that = this;
            that.msg = '奋力抢包中...';
            $.ajax({
                type: "get",
                url: "ajx/rp_grabRedPacket.do",
                data: searchParams(this.wxInfo),
                success: function(response) {
                    if (response.code == 902) {
                        that.showStatus = 2;
                    } else if (response.code == 0) {
                        that.showStatus = 3;
                        that.myAmount = response.data.amount;
                        that.showOther(true)
                        that.msg = '';
                    }
                },
                error: function() {
                    that.msg = '';
                }
            });
        },
        close: function() {
            this.showStatus = 0;
        },
        showOther: function(isShow) {
            var that = this;
            if (isAdminUser != "admin") {
                that.isGetted = isShow;
            }
            that.msg = '获取列表中...';
            $.ajax({
                type: "get",
                url: "ajx/rp_getGrabedList.do",
                data: "redPacketId=" + that.redPacketId,
                success: function(response) {
                    that.redPacketInfo = response.data.redPacketInfo[0];
                    that.userList = response.data.usersInfo;
                    that.sumUserAmount();
                    that.showStatus = 3;
                    that.msg = '';
                },
                error: function() {
                    that.msg = '';
                }
            });
        },
        queryGroupBalance: function() {
            var that = this;
            $.ajax({
                type: "get",
                url: "ajx/rp_queryReadPacketInfo.do",
                data: "gid=" + that.rpb.groupId,
                success: function(response) {
                    if (response.code == 0) {
                        that.balance = response.data.balance / 100.00;
                    }
                }
            });
        },
        //计算已经被抢的红包总额
        sumUserAmount: function() {
            var that = this;
            that.userAllAmount = 0;
            that.userList.forEach(function(item) {
                that.userAllAmount += parseInt(item.amount);
            })
        },
    },
    //     watch:{
    //         'rpb':{
    // 　　　　　　　　　 handler(curVal,oldVal){
    //                     if(this.rpb.topic.length>8){
    //                         alert("标题不可以超过")
    //                         return;
    //                     }
    // 　　　　　　　　　　},
    // 　　　　　　　　　　deep:true
    // 　　　　　　　　}
    //     }

});

new Vue({
    el: '#vtcRedPacket'
});

//封装传参数的方法  兼容性写法
function searchParams(obj, name) {
    if (window.hasOwnProperty('URLSearchParams') || typeof URLSearchParams != 'undefined') {
        var params = new URLSearchParams();
        for (var k in obj) {
            if (name) {
                params.append(name + "." + k, obj[k]);
            } else {
                params.append(k, obj[k]);
            }
        }
        return params.toString();
    } else {
        var str = '';
        for (var k in obj) {
            if (name) {
                str += name + "." + k + "=" + obj[k];
            } else {
                str += k + "=" + obj[k];
            }
            str += "&"
        }
        return str.substring(0,str.length-1);
    }
}

//浅复制对象
function copy(obj) {
    var newobj = {};
    for (var attr in obj) {
        newobj[attr] = obj[attr];
    }
    return newobj;
}

//事件格式化
Date.prototype.Format = function(fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}