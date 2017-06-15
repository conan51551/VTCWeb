Vue.component('modubar', {
    template: '\
    <div id="tabs" class="display-flex">\
        <span :class="[\'tabs-span\',{selected : selectTab == index}]" v-for="(item, index) in tabsname" @click="changeTab(index)">{{item}}</span>\
    </div>\
    ',
    data() {
        return {
            tabsname: ["互动", "介绍", "图文", "简介", "问答", "签到"],
            selectTab: 0,
        }
    },
    mounted: function() {},
    created: function() {
        modubar = this;

    },
    methods: {
        changeTab: function(_index) {
            var that = this;
            that.selectTab = _index;
            _index+=1;
            if(_index==1){
                $("#vtcInterectMod").show();
            }else{
                $("#vtcInterectMod").hide();
            }
        },
        getRecordTabsInfo: function() {
            var that = this;
            if (typeof(recordInfo) != "undefined") {
                if (recordInfo.tabsName != "") {
                    var tabsNameArr = recordInfo.tabsName.split(",");
                    var introduceName = tabsNameArr.splice(-1);
                    tabsNameArr.splice(1, 0, introduceName);
                    that.tabsname = tabsNameArr;
                }
                if (recordInfo.tabs == "" || recordInfo.tabs == null || recordInfo.tabs == "null") {
                    //当没有设置的模块信息时
                } else {
                    var tabs = recordInfo.tabs;
                    var modulArr = [];
                    if (tabs.length != 15) { //当没有第六位数字时，按照以前的设置来
                        modulArr = ["1", "0", "3", "4", "0", "0"]; //以前的直播只开互动，图文和简介
                    } else {
                        var totalArr = tabs.split(","); //将6的介绍模块移到第二个来
                        var modul = totalArr.splice(0, 6);
                        modulArr = modul.splice(0, 5);
                        modulArr.splice(1, 0, modul[0]);
                    }
                    var removeModNum = 0; //移除的模块数
                    for (var i = 0; i < modulArr.length; i++) {
                        if (modulArr[i] == "0") {
                            that.tabsname.splice(i - removeModNum, 1); //移除模块的时候，每移除一个，要向前移除一个
                            removeModNum++;
                        }
                    }
                    // //当出现第一个没有关闭的模块时，显示这个模块
                    // for (var i = 0; i < modulArr.length; i++) {//
                    //     if (modulArr[i] != "0") {
                    //         that.changeTab(i);
                    //         break;
                    //     }
                    // }
                }
            }
        }
    },
});