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
            picDiv: [],
            totalPic: [],
            startIndex: 0,
            scrollFlag: true,
            isDeletePic: false,
            isEditPic: false,
            loadMsg: "加载中...",
            deleteId: "",
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
        confirmDelete: function() {
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
        hideBottom: function() {
            var that = this;
            that.isEditPic = false;
            that.isDeletePic = false;
            that.deleteId = "";
        },
        scrollDiv: function(_this) {
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
            console.log("滚动");
        },
        queryPicAndText: function() {
            var videoId = videoInfo.videoId;
            var that = this;

            that.totalPic = [];
            if (hostname == "voip.vtc365.com") {
                var videoURL = "http://" + hostname + "/LiveVideoServer/streams/s2/graphic/" + videoId + ".json";
            } else if (hostname == "www.vtc365.cn") {
                var videoURL = "http://" + hostname + "/LiveVideoServer/streams/graphic/" + videoId + ".json";
            } else if (hostname == 'multi3.in.vtc365.com') {
                var videoURL = "http://" + hostname + "/LiveVideoServer/streams/s3/graphic/" + videoId + ".json";
            } else if (hostname == 't.vtc365.com') {
                var videoURL = "http://" + hostname + "/LiveVideoServer/streams/s10/graphic/" + videoId + ".json";
            }
            if (videoId != null || videoId != "") {
                $.ajax({
                    url: videoURL,
                    type: "get",
                    dataType: "json",
                    async: false,
                    success: function(res) {
                        var arr1 = that.picDiv.slice(0);
                        var arr2 = res.slice(0);
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
        showPicAndText: function() {
            var that = this;
            var result = that.totalPic[that.startIndex];
            for (index in result) {
                result[index].content = decodeURI(result[index].content);
                result[index].sendTime = result[index].sendTime.split(" ")[1].substring(0, 5);
                that.picDiv.push(result[index]);
            }
            if (typeof(result) == "undefined") {
                that.loadMsg = "已经没有更多了";
            } else {
                that.startIndex++;
            }
            that.scrollFlag = true;
        },
        addGraphic: function() {
            var that = this;
            var videoId = videoInfo.videoId;
            var content = encodeURI($("#target").val());
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
                        }
                    }
                })
            };
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
        compareArr: function(arr1, arr2) {
            var index = arr1.length > arr2.length ? arr2.length : arr1.length;
            var _arr1 = arr1.reverse();
            var _arr2 = arr2.reverse();
            var res = [];
            if (index == 0) {
                return true;
            } else {
                for (var i = 0; i < index; i++) {
                    var sliceIndex = index;
                    if (_arr1[i].tid != _arr2[i].tid) {
                        return true;
                    }
                }
            }
            if(arr1.length != arr2.length){
                return true;
            }
            return false;
        }
    },
});

function useArtEdit() {
    "use strict";
    $("#content").artEditor({
        imgTar: '#imageUpload',
        limitSize: 5, // MB
        showServer: true,
        uploadUrl: 'ajx/uploadPliPic.do',
        data: {
            vid: videoInfo.videoId
        },
        uploadField: 'image',
        placeholader: '<p>请输入文章正文内容</p>',
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