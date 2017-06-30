// 注册多选
Vue.component('multiple-select', {
	props: ['optionsdata','selecteddata'],
	data: function() {
		var data = {
            originOptions: [],
            displayOptions: [],
            show: false,
            search: '',
            selectedList: [],
            selectedIdList: []
		}
		return data
	},
	ready: function(){
		window.addEventListener('click',this.blur)
	},
    watch: {
        optionsdata: function (val, oldVal) {
            this.show = false;
            this.originOptions = val;
        },
        selecteddata: function(val, oldVal){
            this.selectedList = val;
            this.selectedIdList = [];
            // 赋值selectedList
            for (var i=0;i<this.selectedList.length;i++){
                var item = this.selectedList[i];
                this.selectedIdList.push(item.userId); 
            }
        }

    },
	methods:{
        multipleFocus: function(){
            if (!this.show){
                document.body.click();
                console.log('multiple show');
                this.show = true;
                this.multipleSearch();
                this.searchInputFocus();
            }
            else{
                this.blur();
            }
        },
        searchInputFocus: function(){
            var searchInput = this.$el.getElementsByClassName('search-input')[0];

            this.$nextTick(function(){
                searchInput.focus();
            })

        },
        multipleSelect: function(id){
            var mySelf = this;
            var displayOptions = mySelf.originOptions;
            var selectedList = mySelf.selectedList;
            var selectedIdList = mySelf.selectedIdList;
            //在原始数组里找 找到后1.添加到selectedList
            //若selectedIdList存在 则删除
            if (selectedIdList.indexOf(id)!=-1){
                mySelf.multipleRemove(id);
                return;
            }

            for (var i=0;i<displayOptions.length;i++){
                var item = displayOptions[i]
                if (item.userId == id){
                    selectedList.push(item);
                    selectedIdList.push(id);
                    mySelf.multipleInitSearch();
                    mySelf.multipleSearch();
                    mySelf.dispatchData();
                    mySelf.searchInputFocus();
                }
            }
        },
        dispatchData: function(){
        	var eventName = "selected";
        	var params = this.selectedList;
        	this.$emit(eventName, params);
        },
        multipleRemove: function(id){
            console.log('删除！' + id)
            var mySelf = this;
            var selectedList = mySelf.selectedList;
            var selectedIdList = mySelf.selectedIdList;
            for (var i=0;i<selectedList.length;i++){
                var item = selectedList[i]
                if (item.userId == id){
                    //1.从selectedList中删除 2.从selectedIdList中删除
                    selectedList.splice(i,1);
                    var index = selectedIdList.indexOf(item.userId)
                    selectedIdList.splice(index,1)
                    mySelf.multipleInitSearch();
                    mySelf.multipleSearch();
                    mySelf.dispatchData();
                    mySelf.searchInputFocus();
                    return;
                }
            }
        },
        multipleSearch: function(event){
            var mySelf = this;
            var search = mySelf.search;
            var REG_RULE = new RegExp(search,"i") //根据用户输入值做正则
            
            var originOptions = mySelf.originOptions;
            var displayOptions = mySelf.displayOptions;

            // 通过回车键 添加
            if (event && event.keyCode==13 && search!=''){
                console.log('回车！');
                console.log('通过回车添加的值' + search);

                for (var i=0;i<originOptions.length;i++){
                    var item = originOptions[i]
                    if (item.nickName == search){
                        mySelf.multipleSelect(item.userId);
                        return;
                    }
                    else if(i == (originOptions.length-1)){
                        alert('不存在的选项！');
                        return;
                    }
                }
            }

            //将展示列表置空 然后用正则去原始列表中匹配
            mySelf.displayOptions = [];
            //正则表达 匹配搜索字符
            for (var i=0;i<originOptions.length;i++){
                var item = originOptions[i]
                if (REG_RULE.test(item.nickName)){
                    mySelf.displayOptions.push(item)
                }
            }
        },
        multipleInitSearch: function(){
            var mySelf = this;
            //重置搜索框 1.清空搜索数据 2.下拉框展示全量
            mySelf.search = '';
        },
        blur: function(){
            console.log('hide multiple！！')
            this.show = false;
            this.search = '';
        }

	},
	template: 
        '<div class="functional-select-wrapper" v-on:click.stop="multipleFocus()">' +
            '<label class="display-container multiple-select-container clearfix" v-bind:class="(show)?\'single-selected-focus\':\'\'">' +
                '<p v-show="selectedList.length == 0 ">' +
                    '<span v-if="originOptions.length != 0 ">请选择</span>' +
                    '<span v-else>没有选项</span>' +
                '</p>' +
                '<p class="multiple-selected-item" v-for="item in selectedList" track-by="$index">{{ item.nickName }}<i v-on:click.stop.prevent="multipleRemove(item.userId)">×</i></p>' +
                '<i class="drop" v-bind:class="(show)?\'drop-up\':\'\'">▼</i>' +
            '</label>' +
            '<div class="options-container" v-show="show">' +
                '<div class="search-container">' +
                    '<input placeholder="search here" class="search-input" v-model="search" v-on:keyup="multipleSearch($event)" v-on:click.stop />' +
                '</div>' +
                '<ul class="options-ul-list">' +
                    '<li v-show="displayOptions.length == 0">没有查询到数据</li>' +
                    '<li v-for="item in displayOptions" v-on:click.stop.prevent="multipleSelect(item.userId)" v-bind:class=" selectedIdList.indexOf(item.userId)!=-1?\'selected_vip\':\'\' ">{{ item.nickName }}</li>' +
                '</ul>' +
            '</div>' +
        '</div>'
})

Vue.component('lottery', {
    template: '\
    <div>\
    <div id="sendLottery" v-show="isShow">\
        <div class="main xy-center">\
            <div class="close" @click="closeBtn_lottery"></div>\
            <div class="header">发起抽奖</div>\
            <div class="body">\
                <div>\
                    <span class="title">参与抽奖人员</span> \
			    	<select class="select_type" v-model="selected">\
			    	  <option value ="1">全体在线人员</option>\
			    	  <option value ="2">参与问卷人员</option>\
			    	  <option value ="3">参与签到人员</option>\
			    	</select>\
                    <span class="tip">有{{memberCount}}人可以参与抽奖，已中奖用户不再参与抽奖</span>\
                </div>\
                <div>\
                    <span class="title">中奖人数</span>\
                    <input type="number" name="" v-model="lb.count"  placeholder="请输入中奖人数">\
                </div>\
                <div>\
                    <span class="title" style="display:none">预设中奖</span>\
    				<multiple-select  v-bind:optionsdata="memberList" v-bind:selecteddata="lb.vipList" v-on:selected="multipleCallback">\
    				</multiple-select>\
    			</div>\
            </div>\
            <div class="footer">\
                <button @click="sendLottery">开始抽奖</button>\
            </div>\
        </div>\
    </div>\
    <div id="winnerList" v-show="showWinnerList">\
    	<div class="main xy-center">\
	    	 <div class="close" @click="closeBtn_winnerList"></div>\
	         <div class="header">中奖者名单</div>\
	    	 <div class="body">\
		    	<ul>\
		    	 	<li v-for="item in winnerList">\
	    				{{item.nickName}}\
		    		</li>\
		    	</ul>\
	    	 </div>\
	    	<div class="footer">\
	    	</div>\
    	</div>\
    </div>\
    </div>\
    ',
    data:function() {
        return {
        	selected:"1",
            gid: groupId,
            rid: GetQueryString('rid'),
            vid: vid,
            groupName: group_name,
            isShow: false,
            showWinnerList:false,
            memberList: [],
            memberCount:'',
            winnerList:[],
            lb: {
                type: 1,
                count: '',
                vipList: [],
                flag:0
            }
        }
    },
    mounted: function() {
        var that = this;
    },
    created: function() {
        lottery = this;
    },
    watch: {
        selected: function(val) {
        	var that = this;
        	that.lb.type = val;
        	switch(val){
	         	case "1": that.queryMemberListOnline();
	         	break;
	         	case "2": that.queryMemberListFromQuestionnaire();
	         	break;
	         	case "3": that.queryMemberListFromSign();
	         	break;
        	}
        }
    },
    methods: {
    	multipleCallback: function(data){
    		var that = this;
            that.lb.vipList = data;
            console.log(JSON.stringify(data));
        },
        queryMemberListOnline: function() {
        	//查询在线人员列表
            var that = this;
            that.type = 1;
            $.ajax({
                type: "post",
                url: "ajx/queryMemberList.do",
                data: "vid="+ that.vid +"&rid="+ that.rid+"&lb.flag="+ that.lb.flag,
                dataType: "json",
                success: function(response) {
                    that.memberCount = response.memberList == null ? 0 : response.memberList.length;
                    if(that.memberCount > 0){
                    	that.memberList = response.memberList;
                    }
                    //that.memberList = [{"userId":"1","nickName":"lemon"},{"userId":"2","nickName":"mike"},{"userId":"3","nickName":"lara"},{"userId":"4","nickName":"zoe"},{"userId":"5","nickName":"steve"},{"userId":"6","nickName":"nolan"},{"userId":"7","nickName":"dev"},{"userId":"8","nickName":"lucy"}];
                    //that.memberCount =  that.memberList.length;
                }
            });
        },
        queryMemberListFromQuestionnaire: function() {
        	//查询参与问卷的人员列表
            var that = this;
            that.type = 2;
            $.ajax({
                type: "post",
                url: "ajx/queryMemberListFromQuestionnaire.do",
                data: "rid="+ that.rid+"&lb.flag="+ that.lb.flag,
                dataType: "json",
                success: function(response) {
                    that.memberCount = response.memberList == null ? 0 : response.memberList.length;
                    if(that.memberCount > 0){
                    	that.memberList = response.memberList;
                    }else{
                    	that.memberList = [];
                    }
                }
            });
        },
        queryMemberListFromSign: function() {
        	//查询参与签到的人员列表
            var that = this;
            that.type = 3;
            $.ajax({
                type: "post",
                url: "ajx/queryMemberListFromSign.do",
                data: "vid="+ that.vid+"&rid="+ that.rid +"&lb.flag="+ that.lb.flag,
                dataType: "json",
                success: function(response) {
                    that.memberCount = response.memberList == null ? 0 : response.memberList.length;
                    if(that.memberCount > 0){
                    	that.memberList = response.memberList;
                    }else{
                    	that.memberList = [];
                    }
                }
            });
        },
        sendLottery: function() {
        	var that = this;
        	//发起抽奖
        	var vipListStr = JSON.stringify(that.lb.vipList);
        	var memberListStr = JSON.stringify(that.memberList);
        	var data = "groupName="+ that.groupName +"&lb.groupId="+ that.gid +"&lb.rid="+ that.rid +"&lb.type="+ that.lb.type +"&lb.count="+ that.lb.count +"&lb.flag="+ that.lb.flag +"&vipListStr="+ vipListStr +"&memberListStr="+ memberListStr; 
            console.log(data);
            $.ajax({
                type: "post",
                url: "ajx/startLottery.do",
                data: data,
                dataType: "json",
                success: function(response) {
                    that.winnerList = response.winnerList;
                    that.isShow = false;
                    that.showWinnerList = true;
                    that.lb.count = '';
                    that.lb.vipList = [];
                    that.lb.type = 1;
                    that.selected = "1";
                }
            });
        },
        showSendLottery: function() {
            var that = this;
            $("#pop").show();
            this.queryMemberListOnline();
        },
        closeBtn_lottery: function() {
            var that = this;
            that.isShow = false;
            $("#pop").fadeOut(400);
        },
        closeBtn_winnerList: function(){
        	 var that = this;
             that.showWinnerList = false;
             $("#pop").fadeOut(400);
        }
    },

});

new Vue({
    el: '#vtcLottery'
});