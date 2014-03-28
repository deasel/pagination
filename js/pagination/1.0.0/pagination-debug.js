/**
 * 分页插件(不支持多组dom同时初始化，即$('.xxxxx').pager({}))
 *
 * @Author      deasel(deasel21@gmail.com)
 * @Date        2014-3-27
 * @Version     1.0.0
 *
 * @Depend      jQuery || Zepto
 */
(function(window, undefined){

    var $ = window.jQuery || window.Zepto,

        math = Math,

        COMP_MARK = 'pagination',
        DISABLE = 'disable',
        SELECTED = 'selected',

        Global = {};

    if(!$)  return false;

    //component init
    function compInit($el){
        domRender($el);
        bindEvents($el);
    }

    //dom init
    function domRender($el){
        var el = $el[0],
            opts = $.data(el, COMP_MARK),
            pageNumber = opts.pageNumber <= 1 ? 1 : opts.pageNumber,
            start = null,
            end = null,
            pageTotal = opts.pageTotal || (pageNumber || 1),
            maxLength = opts.maxLength < 5 ? 5 : opts.maxLength,
            halfLength = (maxLength/2)>>>0,
            isFirst = pageNumber === 1 ? true : false,
            isLast = pageNumber >= pageTotal ? true : false,
            pageDataList = [],
            pageHtml = [];

        pageNumber = isLast ? pageTotal : pageNumber;

        //first button
        //if pageIndex is 0, set disable
        pageDataList.push({
            text : '首页',
            index : 1,
            cls : 'first-btn ' + (isFirst ? DISABLE : '')
        });

        //prev button
        //if pageIndex is 0, set disable
        pageDataList.push({
            text : '上一页',
            index : 'prev',
            cls : 'prev-btn ' + (isFirst ? DISABLE : '')
        });


        //page number list
        if(pageNumber <= halfLength){
            start = 1;
            end = maxLength;
        }else{
            start = pageNumber - halfLength;
        }

        if((pageTotal - pageNumber) <= halfLength ){
            start = pageTotal - maxLength >= 0 ? (pageTotal - maxLength + 1) : pageTotal;
            end = pageTotal;
        }else{
            end = start + maxLength - 1;
        }

        for(var i = start; i <= end; i++){
            pageDataList.push({
                text : i,
                index : i ,
                cls : (i === pageNumber ? SELECTED : '')
            });
        }

        //next button
        //if pageIndex is the last one, set disable
        pageDataList.push({
            text : '下一页',
            index : 'next',
            cls : 'next-btn ' + (isLast ? DISABLE : '')
        });

        //last button
        //if pageIndex is the last one, set disable
        pageDataList.push({
            text : '尾页',
            index : pageTotal,
            cls : 'last-btn ' + (isLast ? DISABLE : '')
        });


        for(var i = 0, len = pageDataList.length, item = null; i < len; i++){
            item = pageDataList[i] || {};
            pageHtml.push('<a href="javascript:;" data-index="' + (item.index || '') + '" class="page-item ' + (item.cls || '') + '">' + (item.text || '') + '</a>');
        }

        //
        pageHtml.push('<input type="text" class="jump-input"></input><button class="jump-btn">前往</button>');

        $el.addClass(COMP_MARK).html(pageHtml.join(''));
    }

    //bind events
    function bindEvents($el){
        var el = $el[0],
            $pageItem = $('a.page-item', el),
            $jumpInput = $('input.jump-input', el),
            $jumpBtn = $('button.jump-btn', el);

        //绑定点击事件
        $pageItem.unbind('.' + COMP_MARK).bind('click.' + COMP_MARK ,function(){

            var $this = $(this);
            if($this.hasClass(DISABLE) || $this.hasClass(SELECTED)) return false;


            var opts = $.data(el, COMP_MARK)
                oPageNumber = opts.pageNumber;

            
            if($this.hasClass('prev-btn')){      
                
                //点击 上一页 按钮 
                opts.pageNumber = --oPageNumber;
            }else if($this.hasClass('next-btn')){

                //点击 下一页 按钮
                opts.pageNumber = ++oPageNumber;
            }else{

                //点击 数字按钮
                opts.pageNumber = parseInt($this.attr('data-index') || oPageNumber);
            }

            $.data(el, COMP_MARK, opts);
            compInit($el);
            if(opts.change){
                opts.change.call(el, opts.pageNumber);
            }
        });

        //pager jump
        $jumpBtn.unbind('.' + COMP_MARK).bind('click.' + COMP_MARK ,function(){
            var opts = $.data(el, COMP_MARK),
                oPageNumber = opts.pageNumber,
                pageTotal = opts.pageTotal,
                val = $jumpInput.val() || '',
                pageNumber = parseInt(val) || oPageNumber;

            // pageNumber = pageNumber >= 1 ? pageNumber : 1;
            // pageNumber = pageNumber <= pageTotal ? pageNumber : pageTotal;
            pageNumber = math.max(1, pageNumber);
            pageNumber = math.min(pageTotal, pageNumber);

            opts.pageNumber = pageNumber;

            $.data(el, COMP_MARK, opts);
            compInit($el);
            if(opts.change){
                opts.change.call(el, opts.pageNumber);
            }
        });
    }

    //程序入口
    $.fn.pagination = function(param, options){
        param = param || {};

        var $el = this,
            el = $el[0];

        if(typeof param === 'string'){
            var result = Global[param] ? Global[param](el, options) : '';
            result = result === undefined ? $el : result;

            return result;
        }else{
            var opts = $.extend({}, Global.options, param);
            $.data(el, COMP_MARK, opts);
            compInit($el);
            return $el;
        }
    };

    Global.Methods = {
        option : function(el, key){
            var options = $.data(el, COMP_MARK);
            return options[(key || '')] || '';
        },
        change : function(el, callback){

        }
    };

    //默认的配置参数
    Global.options = {

        /*
         *  当前显示的页数索引
         *  @type   {Number}
         */
        pageNumber : 0,

        /*
         *  总页数
         *  @type   {Number}
         */
        pageTotal : 10,

        /*
         *  分页列表最大的显示长度
         *  @type   {Number}
         */
        maxLength: 5,

        /*
         *  点击分页按钮的回调函数
         *
         *  @type   {Function}
         *  @param  {Number}    pageIndex   当前点击的分页索引
         */
        change : $.noop
    };
})(window);