Vue.component('adBanner', {
    template: `
    <div class="swiper-container">
        <div class="swiper-wrapper" :class="{ 'banner-height' : adList.length>0}">
            <div class='swiper-slide' v-for="item in adList">
                <img :src="item.adPic" width="100%" height="100%" alt='轮播广告'/>
                <a class='swiper-go' :data-href="item.adUrl" target='_top'></a>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            adList: [],
            bannerHeight:"banner-height"
        }
    },
    mounted() {
        this.queryAdMsg()
    },
    methods: {
        queryAdMsg() {
            var that = this;
            $.ajax({
                url: 'ajx/queryADMsg.do',
                type: 'GET',
                data: 'rid=' + GetQueryString("rid"),
                success: function(res) {
                    if (res.code == 0) {
                        that.adList = res.data;
                        that.initSwiper()
                    }
                }
            })
        },
        initSwiper() {
            loadScript("js/swiper-3.4.2.jquery.min.js");
            loadStyles("css/swiper.min.css");
            var timerInterVal = setInterval(function() {
                try {
                    var mySwiper = new Swiper('.swiper-container', {
                        loop: true,
                        autoplay: 3000,
                        speed: 300,
                        autoplayDisableOnInteraction: false, //用户滚动后，还能继续自动滚动
                        // setWrapperSize :true,
                    });
                    clearInterval(timerInterVal);
                } catch (error) {
                    console.log("swiper loading...")
                }
            }, 100)
        }
    }
});

$(".video-box").append("<div id='adBannerModel' class='display-flex'>\
                                <ad-banner></ad-banner>\
                            </div>\
                        ");
new Vue({
    el:"#adBannerModel"
})