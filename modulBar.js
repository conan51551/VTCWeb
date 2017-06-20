Vue.component('modubar', {
    template: '\
    <div id="tabs" class="display-flex">\
        <span :class="[\'tabs-span\',{selected : selectTab == modelId[index]}]" :data-id="modelId[index]" v-for="(item, index) in tabsname" @click="changeTab(modelId[index])">{{item}}</span>\
    </div>\
    ',
    data() {
        return {
            tabsname: [],
            selectTab: 0, //选择的模块
            modelId: [], //各个模块的ID
        }
    },
    mounted: function() {
    },
    created: function() {

    },
    methods: {
        changeTab: function(_index) {
            var that = this;
            that.selectTab = _index;
            models.selectModel = _index;
            if(_index == 2){
                models.$refs.pat.queryPicAndText();
            }
        },
        getRecordTabsInfo: function() {
            var that = this;
            if (typeof(recordInfo) != "undefined") {
                if (recordInfo.tabsName != "" && recordInfo.tabsName != null) {
                    var tabArr = recordInfo.tabsName.split(",");
                    var tabsNameArr = tabArr.splice(0, 5);
                    tabsNameArr.splice(1, 0, tabArr[0]);
                    tabsNameArr.map(function(item,index) {
                        modelJson[index].name = item;
                    })
                }
                if (recordInfo.tabs == "" || recordInfo.tabs == null || recordInfo.tabs == "null") {
                    //当没有设置的模块信息时
                } else {
                    var tabs = recordInfo.tabs;

                    var modulArr = [];
                    if (tabs.length != 15) { //当没有第六位数字时，按照以前的设置来
                        modulArr = ["1", "0", "2", "3", "0", "0"]; //以前的直播只开互动，图文和简介
                    } else {
                        var totalArr = tabs.split(","); //将6的介绍模块移到第二个来
                        modulArr = totalArr.splice(0, 6);
                    }
                    modulArr = modulArr.map(function(item) {
                        return parseInt(item);
                    });
                    // var removeModNum = 0; //移除的模块数
                    // for (var i = 0; i < modulArr.length; i++) {
                    //     if (modulArr[i] == "0") {
                    //         that.tabsname.splice(i - removeModNum, 1); //移除模块的时候，每移除一个，要向前移除一个
                    //         removeModNum++;
                    //     }
                    // }
                    var isFirstShow = true;
                    var showIndex = -1;
                    modelJson.map(function(model) {
                        if (modulArr.indexOf(model.id) >= 0) {
                            that.tabsname.push(model.name);
                            that.modelId.push(model.id); //各个模块的ID
                            console.log(`正在加载:${model.name}模块!`)
                            loadStyles(model.cssPath)
                            loadScript(model.jsPath)
                            console.log(`${model.name}模块,加载完成!`)
                            loadModels.loadNum++;
                            if (isFirstShow) {
                                isFirstShow = false;
                                showIndex = model.id;
                            }
                        }
                    })
                    loadModels.initModel(showIndex);
                }
            }
        }
    },
});