
var picAndTextId = 2; //图文模块的Id
var picAndTextRef = queryModelRef(picAndTextId); //图文模块的ref
var picAndTextCom = Vue.component('picandtext', {
    template: '\
            <div class="PT-window display-flex">\
                <div class="picAndText display-flex">\
                    <div class="displayPt">\
                        <div class="picTop">\
                            <span>14:54</span>\
                            <span class="deletePic" v-show="isAdmin">删除</span>\
                        </div>\
                        <div class="showText" >\
                            <div v-html="picDiv" class="showTextInner"></div>\
                        </div>\
                    </div>\
                </div>\
                <div class="picBottom" v-show="isAdmin">\
                    <div class="picBtn" @click="showEditPic">发表图文</div>\
                </div>\
                <!--编辑上传图文-->\
                <transition name="fade">\
                    <div class="picPop" v-if="isEditPic" @click="isEditPic=!isEditPic"></div>\
                </transition>\
                <transition enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown">\
                    <div class="reminder" id="editPicAndText" v-if="isEditPic">\
                        <div class="publish-article-content">\
                            <span class="loading"></span>\
                            <input type="hidden" id="target">\
                            <div class="editPicDiv">\
                                <div class="g-image-upload-box" style="float: left;">\
                                    <div class="upload-button">\
                                        <span class="upload">插入图片</span>\
                                        <input class="input-file" id="imageUpload" type="file" name="fileInput" capture="camera" accept="image/*">\
                                    </div>\
                                </div>\
                                <div class="g-image-upload-box footer-btn-right">\
                                    <div class="upload-button" id="btn_submit">\
                                        <span class="uploadBtn">提交</span>\
                                    </div>\
                                </div>\
                            </div>\
                            <div class="article-content" id="content" style="height: 256px; padding: 10px;"></div>\
                        </div>\
                    </div>\
                </transition>\
            </div>\
    ',
    data() {
        return {
            isAdmin: userInfo.isAdminUser,
            picDiv: "123<img src='http://v.vtc365.com/LiveVideoServer/streams/s10//upload/352582/1497522303689.jpg'  style='width:100%;display:block;'>444",
            isEditPic: false,
        }
    },
    mounted: function() {},
    created: function() {

    },
    methods: {
        showEditPic: function() {
            var that = this;
            that.isEditPic = true;
            setTimeout(function() {
                useArtEdit();
            }, 100)
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
        data: "",
        uploadField: 'image',
        placeholader: '<p>请输入文章正文内容</p>',
        // validHtml: ["<br/>"],
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