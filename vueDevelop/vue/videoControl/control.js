Vue.component('videoControls', {
    props: ['liveFlag'],
    template: `<div id="videoControls" @click.stop="showControls">
        <!--直播-->
        <img @click.stop="playVideo" v-show="controlStat" id="bigbutton" class="abs-center-y" :src="'img/video/'+(imgStat ? 'bigpause' : 'bigstart')+'.png'" width="60px">
        <img src="./img/vtc-m/loading.gif" class="video-loading" alt="加载中" v-show="loading">
        <div class="ratebox">
            <div>
                <img class="img-support" src="img/vtc-m/supportNum.png">
                <a id="onlineCnt">{{viewCnt}}</a>
            </div>
            <div class="div-fav">
                <img class="img-fav" src="img/vtc-m/favourNum.png" id="likeanc">
                <a id="likeCnt">{{likeCnt}}</a>
            </div>
        </div>
        <transition v-if="liveFlag!=0">
            <div class="controls">
                <span>直播中</span>
            </div>
        </transition>
        <!--历史视频-->
        <transition v-else>
            <div class="controls" v-show="controlStat">
                <img id="start" class="abs-center-y" :src="'img/video/'+(imgStat ? 'pause' : 'start')+'.png'" alt="" width="15px" height="15px">
                <div id="progressWrap" class="abs-center-xy">
                    <div id="playProgress" :style="'width:'+perWidth" @click.stop="videoSeek($event)">
                        <span id="cursor" @touchmove.stop="controlsTouch($event)">
						    <span id="showProgress" class="abs-center-xy"></span>
                        </span>
                    </div>
                    <div class="time">
                        <span id="played-time">{{parseTime(video.currentTime)}}</span>/
                        <span id="all-time">{{parseTime(video.duration)}}</span>
                    </div>
                </div>
            </div>
        </transition>
        <div id="fullscreen" @click="fullscreen">
            <img class="abs-center-xy" src="img/video/fullscreen.png" width="15px" height="15px">
        </div>
    </div>`,
    data() {
        return {
            viewCnt: 0,
            likeCnt: 0,
            isPaly: false, //是否播放
            loading: false,
            imgStat: false, //按钮状态
            controlStat: true, // 控制器是否显示
            timeout: 0, // 控制器定时器
            video: {
                duration: 0,
                currentTime: 0
            }

        }
    },
    computed: {
        //计算进度条百分比
        perWidth() {
            var per = this.video.currentTime / this.video.duration * 100;
            return per + "%";
        }
    },
    methods: {
        //视频播放时间更新触发
        timeupdate() {
            var that = this;
            var video = document.querySelector('video');
            that.video.currentTime = video.currentTime
            that.video.duration = video.duration;
        },
        loadstart() {
            if (this.isPaly) {
                this.loading = true;
                this.controlStat = false;
            }
        },
        canplay() {
            if (this.isPaly) {
                this.loading = false;
                this.controlStat = true;
            }
        },
        //滑动调整视频时间事件
        controlsTouch(event) {
            var that = this;
            var video = document.querySelector('video');
            var offsetLeft = $("#progressWrap").offset().left;
            var length = event.touches[0].pageX - offsetLeft;
            var progressWrap = document.getElementById("progressWrap");
            var percent = length / progressWrap.offsetWidth; //得到进度条相对总长度的百分比
            that.video.currentTime = percent * that.video.duration; //计算出当前时间
            video.currentTime = that.video.currentTime;
            clearTimeout(that.timeout);
            that.timeout = setTimeout(function() {
                that.controlStat = false;
            }, 3000)
        },
        /*
            点击进度条事件 暂时不可用
            应该增大可点击区域后在实现,目前区域太小 无法点中
         */
        videoSeek(e) {
            var that = this;
            var video = document.querySelector('video');
            if (video.paused || video.ended) {
                play();
            }
            var offsetLeft = $("#progressWrap").offset().left;
            var progressWrap = document.getElementById("progressWrap");
            var length = e.pageX - offsetLeft;
            var percent = length / progressWrap.offsetWidth;
            that.video.currentTime = percent * that.video.duration;
            video.currentTime = that.video.currentTime;
        },
        //格式化视频时间显示
        parseTime(currentTime) {
            var minutes = parseInt(currentTime / 60);
            var seconds = parseInt(currentTime - minutes * 60);
            if (seconds < 10) { seconds = '0' + seconds; }
            if (isNaN(minutes) || isNaN(seconds)) {
                return "00:00";
            }
            return minutes + ':' + seconds;
        },
        //视频播放暂停控制
        playVideo() {
            var video = document.querySelector('video');
            if (video.paused) {
                this.isPaly = true;
                video.play();
            } else {
                video.pause();
            }
        },
        //是否展示控制条
        showControls() {
            var video = document.querySelector('video');
            if (video.paused) {
                return;
            }
            var that = this;
            if (!that.controlStat) {
                that.controlStat = true;
                clearTimeout(that.timeout);
                that.timeout = setTimeout(function() {
                    if (!video.paused) {
                        that.controlStat = false;
                    }
                }, 3000)
            } else {
                that.controlStat = false;
            }
        },
        //控制条状态控制
        controlsChange() {
            var that = this;
            var video = document.querySelector('video');
            if (video.paused) {
                that.controlStat = true;
                that.imgStat = false;
            } else {
                that.imgStat = true;
                setTimeout(function() {
                    if (!document.querySelector('video').paused) {
                        if (!video.paused) {
                            that.controlStat = false;
                        }
                    }
                }, 5000)
            }
        },
        //控制视频是否全屏 走微信接管的通道
        fullscreen() {
            var video = document.querySelector("video")
                //判断是苹果就走playsinline
            if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
                video.pause()
                video.playsinline = false;
                video.play()
                video.playsinline = true;
                //是安卓就改变视频高度就行 只要不是100% 自动会退出同层播放器
            } else {
                video.style.height = "99.9%";
            }
        }

    },
});