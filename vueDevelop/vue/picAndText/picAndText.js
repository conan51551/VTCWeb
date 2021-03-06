var picAndTextId = 2; //图文模块的Id
var picAndTextRef = queryModelRef(picAndTextId); //图文模块的ref
var picAndTextCom = Vue.component('picandtext', {
    template: '\
            <div class="PT-window display-flex">\
                <div class="picAndText display-flex" @scroll="scrollDiv($event)">\
                    <div class="load-box" v-show="picDiv.length==0">暂无图文直播内容</div>\
                    <div class="displayPt" v-for="(item,index) in picDiv" :key="item.tid" :style="{backgroundColor:(item.tid==deleteId?\'#bfe1f6\':\'#fff\')}">\
                        <div class="picTop">\
                            <span>{{item.sendTime}}</span>\
                            <span class="deletePic" v-show="isAdmin" @click="deletePic(item.tid)">删除</span>\
                        </div>\
                        <div class="showText" >\
                            <div v-html="item.content" class="showTextInner"></div>\
                        </div>\
                    </div>\
                    <div class="load-box" v-show="picDiv.length!=0">{{loadMsg}}</div>\
                </div>\
                <div class="picBottom" v-show="isAdmin">\
                    <div class="picBtn" @click="showEditPic">发表图文</div>\
                </div>\
                <!--编辑上传图文-->\
                <transition name="fade">\
                    <div class="picPop" v-if="isEditPic||isDeletePic" @click="hideBottom"></div>\
                </transition>\
                <transition enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown">\
                    <div class="reminder" id="editPicAndText" v-if="isEditPic">\
                        <div class="publish-article-content">\
                            <span class="loading" id="loading-img" style="z-index:999;display:none;position: absolute;width: 16px;top: 0px;left: 0px;bottom: 0px;right: 0px;margin: auto;"></span>\
                            <input type="hidden" id="target">\
                            <div class="editPicDiv">\
                                <div class="g-image-upload-box" style="float: left;">\
                                    <div class="upload-button">\
                                        <span class="upload">插入图片</span>\
                                        <input class="input-file" id="imageUpload" type="file" name="fileInput" accept="image/*">\
                                    </div>\
                                </div>\
                                <div class="g-image-upload-box footer-btn-right">\
                                    <div class="upload-button" id="btn_submit">\
                                        <span class="uploadBtn" @click="addGraphic">提交</span>\
                                    </div>\
                                </div>\
                            </div>\
                            <div class="article-content" id="content" style="height: 256px; padding: 10px;"></div>\
                        </div>\
                    </div>\
                </transition>\
                <transition enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown">\
                    <!--删除图文-->\
                    <div class="reminder" id="deletePic" v-if="isDeletePic">\
                        <div class="reminder-hd">\
                            VTC提示\
                        </div>\
                        <div>\
                            <p style="text-align: center; margin: 20px 0">\
                                您确认要删除此条图文消息吗？\
                            </p>\
                            <p class="hint-p" style="text-align: center;">\
                                <a class="hint-btn" style="margin-right: 20px; border-color: #ccc; color: #ccc" id="vtc_cancel" @click="hideBottom">取消</a>\
                                <a class="hint-btn " style="margin-left: 20px;" id="vtc_confirm" @click="confirmDelete">确认</a>\
                            </p>\
                        </div>\
                    </div>\
                </transition>\
            </div>\
    ',
    data() {
        return {
            isAdmin: userInfo.isAdminUser,
            picDiv: [],//展示的图文列表
            totalPic: [],//获取到的图文列表，以5个一组分开
            startIndex: 0,//滚动时展示的图文页数
            scrollFlag: true,//是否可以滚动
            isDeletePic: false,//删除图文显示
            isEditPic: false,//编辑图文显示
            loadMsg: "加载中...",
            deleteId: "",//要删除的图文的ID
            isClick: true,
        }
    },
    mounted: function() {
        var that = this;
        // that.queryPicAndText();
    },
    created: function() {
        var that = this;
    },
    methods: {
        confirmDelete: function() {//提交删除图文的信息
            var that = this;
            var data = "glb.tid=" + that.deleteId;
            $.ajax({
                url: "ajx/deleteGraphic.do",
                data: data,
                type: "post",
                dataType: "json",
                success: function(res) {
                    that.picDiv.map(function(item, index) {
                        if (item.tid == that.deleteId) {
                            Vue.delete(that.picDiv, index)
                            that.deleteId = "";
                            that.hideBottom();
                        }
                    })

                }
            });
        },
        hideBottom: function() {//隐藏编辑和删除页面
            var that = this;
            that.isEditPic = false;
            that.isDeletePic = false;
            that.deleteId = "";
        },
        scrollDiv: function(_this) {//滚动图文
            var that = this;
            var scrollTop = _this.target.scrollTop;
            var clientHeight = _this.target.clientHeight;
            var scrollHeight = _this.target.scrollHeight;
            if ((scrollTop + clientHeight) >= scrollHeight) {
                if (that.scrollFlag) {
                    that.scrollFlag = false;
                    that.showPicAndText();
                }
            }
        },
        queryPicAndText: function() {//查询图文的信息，将获取到的所有图文信息五个一组分开
            var videoId = videoInfo.videoId;
            var that = this;

            that.totalPic = [];
            var videoURL = queryFilePath()+"graphic/" + videoId + ".json";
            if (videoId != null || videoId != "") {
                $.ajax({
                    url: cacheTimeout(videoURL),
                    type: "get",
                    dataType: "json",
                    async: false,
                    success: function(res) {
                        const arr1 = [...that.picDiv];
                        const arr2 = [...res];
                        if (that.compareArr(arr1, arr2)) {
                            that.picDiv = [];
                            for (var i = 0, len = res.length; i < len; i += 5) {
                                that.totalPic.push(res.slice(i, i + 5));
                            }
                            that.startIndex = 0;
                            that.showPicAndText()
                        }

                    },
                    error: function(e) {
                        // body...
                    }
                });
            }
        },
        showPicAndText: function() {//将获取到的图文列表，做成分页的模式展示
            var that = this;
            var result = that.totalPic[that.startIndex];
            if (typeof(result) != "undefined") {
                for (index in result) {
                    try {
                        result[index].content = decodeURI(result[index].content);
                    } catch (e) {}
                    result[index].sendTime = result[index].sendTime.split(" ")[1].substring(0, 5);
                    that.picDiv.push(result[index]);
                }
                that.startIndex++;
            }
            if (typeof(result) == "undefined"||that.picDiv.length<5) {
                that.loadMsg = "已经没有更多了";
            }
            that.scrollFlag = true;
        },
        addGraphic: function() {//发送图文
            var that = this;
            var content = $("#target").val();
            if (that.isClick&&content != "") {
                that.isClick = false;
                var videoId = videoInfo.videoId;
                if (content != "") {
                    var data = {
                        "glb.videoId": videoId,
                        "glb.userId": userInfo.userId,
                        "glb.nickname": userInfo.nickname,
                        "glb.content": content
                    };
                    $.ajax({
                        url: "ajx/addGraphic.do",
                        data: data,
                        type: "post",
                        dataType: "json",
                        success: function(res) {
                            var addResult = res.result;
                            if (addResult == "OK") {
                                that.isEditPic = false;
                                that.picDiv = [];
                                that.totalPic = [];
                                that.queryPicAndText();
                                that.isClick = true;
                            }
                        },
                        error: function() {
                            that.isClick = true;
                        }
                    })
                };
            }
        },
        deletePic: function(_id) {
            var that = this;
            that.isDeletePic = !that.isDeletePic;
            that.deleteId = _id;

        },
        showEditPic: function() {
            var that = this;
            that.isEditPic = true;
            setTimeout(function() {
                useArtEdit();
            }, 100)
        },
        compareArr: function(arr1, arr2) {//对比图文的信息，一样的话就不变化，一直查到一个不一样的，将后面的图文修改
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
                }
            }
            if (arr1.length != arr2.length) {
                return true;
            }
            return false;
        },
    },
});

function useArtEdit() {
    $("#content").artEditor({
        imgTar: '#imageUpload',
        limitSize: 5, // MB
        showServer: true,
        uploadUrl: 'ajx/uploadPliPic.do',
        data: {
            vid: videoInfo.videoId
        },
        uploadField: 'image',
        placeholader: '',
        validHtml: ["<br/>"],
        formInputId: 'target',
        uploadSuccess: function(res) {
            $("#loading-img").hide();
            return res.filePath;
        },
        uploadError: function(res) {
            $("#loading-img").hide();
            alert("图片上传失败,请重新上传")
        }
    });
};

$(".extend-model").append("<div id='vtcPicAndText' class='display-flex' v-show='" + picAndTextId + " == selectModel'>\
                                <picandtext ref='" + picAndTextRef + "'></picandtext>\
                            </div>\
                        ");
loadModels.finish++;