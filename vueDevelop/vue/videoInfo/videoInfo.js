var vinfo = 3; //互动模块的id
var vinfoRef = queryModelRef(vinfo);//互动模块的ref

Vue.component('videoInfo', {
    template: `<div>
        <p class="video-title">{{liveTitle}}</p>
        <p class="video-info">{{liveDesc}}</p>
    </div>`,
    data() {
        return {
            liveTitle:recordInfo.liveTitle,
            liveDesc:recordInfo.liveDesc
        }
    }
});

$(".extend-model").append("<div id='videoInfoModel' class='display-flex' v-show='" + vinfo + " == selectModel'>\
                                <video-info ref="+vinfoRef+"></video-info>\
                            </div>\
                        ");
loadModels.finish++;