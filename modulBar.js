// $(".extend-model").append("<div id='vtcModulBar'>\
//                                 <modubar></modubar>\
//                             </div>\
//                         ");
Vue.component('modubar', {
    template: '\
    <div id="tabs">\
        <span class="tabs-span">互动</span>\
        <span class="tabs-span">互动</span>\
        <span class="tabs-span">互动</span>\
    </div>\
    ',
    data() {
        return {}
    },
    mounted: function() {},
    created: function() {
        modubar = this;
    },
    methods: {},

});

// new Vue({
//     el: '#vtcModulBar'
// });