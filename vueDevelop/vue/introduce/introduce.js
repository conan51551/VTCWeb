var introduceId = 6; //图文模块的Id
var introduceRef = queryModelRef(introduceId); //图文模块的ref
Vue.component('introduce', {
    template: '\
            <div class="PT-window display-flex">\
                <div class="picAndText display-flex" @scroll="scrollIntroduce($event)">\
                    <div class="load-box" v-show="introduceList.length==0">暂无介绍内容</div>\
                    <div class="displayIntro" v-for="(item,index) in introduceList" :key="item.tid">\
                        <div v-html="item.content"></div>\
                    </div>\
                    <div class="introduce-loading" v-show="introduceList.length!=0">{{loadIntroMsg}}</div>\
                </div>\
            </div>\
            ',
    data() {
        return {
            introduceList: [],
            loadIntroMsg: "",
            totalIntroduce: [],
            introStart: 0,
            introduceFlag: true
        }
    },
    methods: {
        scrollIntroduce(_this) {
            var that = this;
            var scrollTop = _this.target.scrollTop;
            var clientHeight = _this.target.clientHeight;
            var scrollHeight = _this.target.scrollHeight;
            if ((scrollTop + clientHeight) >= scrollHeight) {
                if (that.introduceFlag) {
                    that.introduceFlag = false;
                    that.showIntroduce();
                }
            }
        },
        queryIntroduce: function() {
            var rid = videoInfo.rid;
            var that = this;

            that.totalIntroduce = [];
            var videoURL = queryFilePath()+"publicize/" + rid + ".json";
            if (rid != null || rid != "") {
                $.ajax({
                    url: videoURL,
                    type: "get",
                    dataType: "json",
                    async: false,
                    success: function(res) {
                        const arr1 = [...that.introduceList];
                        const arr2 = [...res];
                        if (that.compareArr(arr1, arr2)) {
                            that.introduceList = [];
                            for (var i = 0, len = res.length; i < len; i += 5) {
                                that.totalIntroduce.push(res.slice(i, i + 5));
                            }
                            that.introStart = 0;
                            that.showIntroduce()
                        }
                    },
                    error: function(e) {
                        // body...
                    }
                });
            }
        },
        showIntroduce: function() {
            var that = this;
            var result = that.totalIntroduce[that.introStart];
            for (index in result) {
                result[index].content = result[index].content;
                that.introduceList.push(result[index]);
            }
            if (typeof(result) == "undefined") {
                that.loadIntroMsg = "已经没有更多了";
                setTimeout(function() {
                    that.loadIntroMsg = "";
                }, 3000)
            } else {
                that.introStart++;
            }
            that.introduceFlag = true;
        },
        compareArr: function(arr1, arr2) {
            var index = arr1.length > arr2.length ? arr2.length : arr1.length;
            var _arr1 = arr1.reverse();
            var _arr2 = arr2.reverse();
            var res = [];
            if (index == 0) {
                return true;
            } else {
                for (var i = 0; i < index; i++) {
                    var isSame = arr2.find(function(element) {
                        return element.tid == arr1[i].tid;
                    });
                    if (!isSame) {
                        return true;
                    }

                    // var sliceIndex = index;
                    // if (_arr1[i].tid != _arr2[i].tid) {
                    //     return true;
                    // }
                }
            }
            if (arr1.length != arr2.length) {
                return true;
            }
            return false;
        },

    },
})

$(".extend-model").append("<div id='vtcIntroduce' class='display-flex' v-show='" + introduceId + " == selectModel'>\
                                <introduce ref='" + introduceRef + "'></introduce>\
                            </div>\
                        ");
loadModels.finish++;