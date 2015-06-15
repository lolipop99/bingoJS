
(function (bingo) {

    /*
        使用方法:
        bg-route="view/system/user/list"
    
        连接到view/system/user/list, 目标:main
        <a href="#view/system/user/list" bg-target="main">在main加载连接</a>
        设置frame:'main'
        <div bg-route="" bg-name="main"></div>
    */
    bingo.command('bg-route', function () {
        return {
            priority: 1000,
            replace: false,
            view: true,
            compileChild: false,
            compile: ['$compile', '$node', '$attr', '$location', function ($compile, $node, $attr, $location) {
                /// <param name="$compile" value="function(){return bingo.compile();}"></param>
                /// <param name="$attr" value="bingo.view.viewnodeAttrClass()"></param>
                /// <param name="$node" value="$([])"></param>

                //只要最后一次，防止连续点击链接
                var _last = null;
                $location.onChange(function (url) {
                    _last && _last.stop();
                    _last = $compile().fromUrl(url).appendTo($node).onCompilePre(function () {
                        $node.html('');
                    }).onCompiled(function () {
                        _last = null;
                        $node.trigger('bg-location-loaded', [url]);
                    }).compile();
                });

                $attr.$init(function () {
                    return $attr.$prop();
                }, function (value) {
                    value && $location.href(value);
                });
            }]
        };
    });

    $(function () {
        $(document.documentElement).on('click', '[href]', function () {
            if (!bingo.location) return;
            var jo = $(this);
            var href = jo.attr('href');
            if (href.indexOf('#') >= 0) {
                var $location = bingo.location(this);
                var target = jo.attr('bg-target');
                href = href.split('#');
                href = href[href.length - 1];
                $location.href(href, target);
            }
        });
    });

})(bingo);
