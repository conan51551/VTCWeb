Vue.component('lottery_winner', {
    template: '\
    <div>\
	    <div id="winnerPanel" v-show="showWinner">\
	        <div class="main xy-center">\
	            <div class="close" @click="closeBtn_winner"></div>\
	            <div class="header">抽奖结果</div>\
	            <div class="body">\
    					<p>恭喜您，在本次抽奖活动中被抽中，请填写个人信息以便我们联系到您！</p>\
	                <div>\
				    	<span class="title">姓名</span>\
				        <input type="text" name="" v-model="lwb.name"  placeholder="请输入您的姓名">\
	                </div>\
	                <div>\
				    	<span class="title">电话</span>\
				        <input type="text" name="" v-model="lwb.telNumber"  placeholder="请输入您的手机号码">\
	                </div>\
	            </div>\
	            <div class="footer">\
	                <button @click="saveWinnerInfo">提交</button>\
	            </div>\
	        </div>\
	    </div>\
    	<div id="loserPanel" v-show="showLoser">\
	        <div class="main xy-center">\
	            <div class="close" @click="closeBtn_loser"></div>\
	            <div class="header">抽奖结果</div>\
	            <div class="body">\
    				<p>很遗憾这次的抽奖您没有被抽中！</p>\
	            </div>\
	        </div>\
    	</div>\
    </div>\
    ',
    data:function() {
        return {
            gid: groupId,
            rid: GetQueryString('rid'),
            vid: vid,
            showWinner: false,
            showLoser: false,
            lwb: {
                lotId: '',
                userId: '',
                name: '',
                telNumber: '',
            }
        }
    },
    created: function() {
        lottery_winner = this;
    },
    methods: {
    	 checkMobile : function(str) {
    	    if(str==""){
    	        alert("手机号不能为空！");
    	        return false
    	    }
    	    else{
    	        var re = /^1\d{10}$/
    	        if (re.test(str)) {
    	            return true;
    	        } else {
    	            alert("手机号格式错误！");
    	            return false;
    	        }
    	    }
    	},
    	saveWinnerInfo: function() {
        	var that = this;
        	//提交中奖用户信息
        	if(that.checkMobile(that.lwb.telNumber)){
        		var data = "lwb.lotId="+ that.lwb.lotId +"&lwb.userId="+ that.lwb.userId +"&lwb.name="+ that.lwb.name +"&lwb.telNumber="+ that.lwb.telNumber;
            	$.ajax({
                    type: "post",
                    url: "ajx/saveWinnerInfo.do",
                    data: data,
                    dataType: "json",
                    success: function(response) {
                    	if(response.result == "success"){
                    		alert("提交成功！");
                    		that.showWinner = false;
                            $("#pop").fadeOut(400);
                    	}
                    }
                });
        	}
        },
        showSendLotteryWinner: function() {
            var that = this;
            $("#pop").show();
        },
        closeBtn_winner: function() {
            var that = this;
            that.showWinner = false;
            $("#pop").fadeOut(400);
        },
        closeBtn_loser: function(){
        	 var that = this;
             that.showLoser = false;
             $("#pop").fadeOut(400);
        }
    },
});
new Vue({
    el: '#vtcLottery_winner'
});