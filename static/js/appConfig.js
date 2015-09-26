/**
 * Created by xumin on 2015/8/26.
 */
// check if browser support HTML5 local storage
var localStorageSupport = false;

BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_DEFAULT] = '提示';
BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_INFO] = '提示';
BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_PRIMARY] = '提示';
BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_SUCCESS] = '成功';
BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_WARNING] = '警告';
BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_DANGER] = '危险';
BootstrapDialog.DEFAULT_TEXTS['OK'] = '确定';
BootstrapDialog.DEFAULT_TEXTS['CANCEL'] = '取消';
BootstrapDialog.DEFAULT_TEXTS['CONFIRM'] = '确认';


$.jgrid.defaults.width = 780;
$.jgrid.defaults.responsive = true;
$.jgrid.defaults.styleUI = 'Bootstrap';
$.jgrid.styleUI.Bootstrap.base.rowTable = "table table-bordered table-striped";


//手机号校验
jQuery.validator.addMethod("isMobile", function(value, element) {
    if(value.indexOf('-')>0){
        value = value.replace(/\-/g, '');
    }
    var tel = /^[1][0-9][0-9]{9}$/;
    return this.optional(element) || (tel.test(value));
}, '请填写正确的手机号');

//CDKey校验
jQuery.validator.addMethod("isKeyCode", function(value, element) {
    if(value.indexOf('-')>0){
        value = value.replace(/\-/g, '');
    }
    var tel = /^[0-9]{12}$/;
    return this.optional(element) || (tel.test(value));
}, '请填写正确的电子劵号');


// For demo purpose - animation css script
function animationHover(element, animation) {
    element = $(element);
    element.hover(
        function () {
            element.addClass('animated ' + animation);
        },
        function () {
            //wait for animation to finish before removing classes
            window.setTimeout(function () {
                element.removeClass('animated ' + animation);
            }, 2000);
        });
}

/*
var $this = $('#menu'),
    resizeTimer, self = this;

var initCollapse = function(el) {
    if ($(window).width() >= 768) {
        this.find('li').has('ul').children('a').off('click');
    }
};

$(window).resize(function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(self.initCollapse($this), 250);
});
*/

//override - inspinia.js
function SmoothlyMenu() {
    //mini模式下取消click操作，普通模式下如何恢复
    if($('body').hasClass('mini-navbar') && $('body').hasClass('fixed-sidebar')){
        //添加nonclick
        //$('#side-menu').find('li').has('ul').children('a').off('click.metisMenu');
        //$('#side-menu a.nonclick').off('click.metisMenu');
    }else{
        //删除
        //$('#side-menu').find('li').has('ul').children('a').removeClass("nonclick")
    }


    if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
        // Hide menu in order to smoothly turn on when maximize menu
        $('#side-menu').hide();
        // For smoothly turn on menu
        setTimeout(
            function () {
                $('#side-menu').fadeIn(500);
            }, 100);
    } else if ($('body').hasClass('fixed-sidebar')) {
        $('#side-menu').hide();
        setTimeout(
            function () {
                $('#side-menu').fadeIn(500);
            }, 300);
    } else {
        // Remove all inline style from jquery fadeIn function to reset menu state
        $('#side-menu').removeAttr('style');
    }
}

//appconfig
$(document).ready(function () {
    var body = $('body');
    //fixedsidebar
    //body.addClass('fixed-sidebar');
    $('.sidebar-collapse').slimScroll({
        height: '100%',
        railOpacity: 0.6
    });

    //$(".navbar-static-top").removeClass('navbar-static-top').addClass('navbar-fixed-top');
    //body.addClass('fixed-nav');
})