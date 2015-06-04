
/*
    与bg-route同用, 取bg-route的url等相关
    $location.href('view/system/user/list');
    var href = $location.href();
    var params = $location.params();


    $location.onChange请参考bg-route定义
*/

bingo.location = function (node) {
    /// <param name="node">可选， 默认document.documentElement</param>
    var $node = $(node || document.documentElement);
    var frameName = 'bg-route';
    return {
        params: function () {
            var url = this.href();
            var routeContext = bingo.routeContext(url);
            return routeContext.params;
        },
        href: function (url, target) {
            var frame = bingo.isNullEmpty(target) ? this.frame() : $('[' + frameName + '][' + frameName + '-name="' + target + '"]');
            if (frame.size() > 0) {
                frame.attr(frameName, url).trigger(frameName + '-change', [url]);
            }
        },
        reload: function (target) {
            this.href(this.url(), target);
        },
        onChange: function (callback) {
            callback && this.frame().on(frameName + '-change', function (e, url) {
                callback.call(this, url);
            });
        },
        onLoaded: function (callback) {
            callback && this.frame().on(frameName + '-loaded', function (e, url) {
                callback.call(this, url);
            });
        },
        frame: function () { return $node.closest('[' + frameName + ']'); },
        url: function () {
            var frame = this.frame();
            if (frame.size() > 0)
                return frame.attr(frameName);
            else
                return window.location + '';
        },
        toString: function () {
            return this.url();
        }
    };
};

bingo.factory('$location', ['node', function (node) {

    return bingo.location(node);

}]);
