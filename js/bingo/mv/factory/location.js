
(function (bingo) {

    /*
        与bg-route同用, 取bg-route的url等相关
        $location.href('view/system/user/list');
        var href = $location.href();
        var params = $location.params();
    
    
        $location.onChange请参考bg-route定义
    */
    var _routeCmdName = 'bg-route',
        _dataKey = '_bg_location_';

    //bingo.location('main') 或 bingo.location($('#id')) 或 bingo.location(docuemnt.body)

    bingo.location = function (p) {
        /// <param name="p">可选，可以是字串、jquery和dom node, 默认document.documentElement</param>
        bingo.isString(p) && (p = '[bg-name="' + p + '"]');
        var $node = $(p || document.documentElement).closest('[' + _routeCmdName + ']');
        var o = $node.data(_dataKey);
        if (!o) {
            o = _locationClass.NewObject().ownerNode($node).linkToDom($node);
            $node.data(_dataKey, o);
        }
        return o;
    };

    var _locationClass = bingo.location.Class = bingo.Class(bingo.linkToDom.LinkToDomClass, function () {

        this.Prop({
            ownerNode: null
        });

        this.Define({
            queryParams: function () {
                var url = this.url();
                var routeContext = bingo.routeContext(url);
                return routeContext.params;
            },
            href: function (url, target) {
                var frame = bingo.isNullEmpty(target) ? this.ownerNode() : $('[' + _routeCmdName + '][bg-name="' + target + '"]');
                if (frame.size() > 0) {
                    frame.attr(_routeCmdName, url).trigger('bg-location-change', [url]);
                }
                return this;
            },
            reload: function (target) {
                return this.href(this.url(), target);
            },
            onChange: function (callback) {
                callback && this.ownerNode().on('bg-location-change', function (e, url) {
                    callback.call(this, url);
                });
            },
            onLoaded: function (callback) {
                callback && this.ownerNode().on('bg-location-loaded', function (e, url) {
                    callback.call(this, url);
                });
            },
            url: function () {
                if (this.ownerNode().size() > 0)
                    return this.ownerNode().attr(_routeCmdName);
                else
                    return window.location + '';
            },
            toString: function () {
                return this.url();
            },
            views: function () {
                return bingo.view(this.ownerNode()).$children;
            },
            close: function () {
                if (this.trigger('onCloseBefore') === false) return;
                this.ownerNode().remove();
            },
            onCloseBefore: function (callback) {
                return this.on('onCloseBefore', callback);
            },
            onClosed: function (callback) {
                if (this.__closeed !== true) {
                    this.__closeed = true;
                    this.onDispose(function () {
                        this.trigger('onClosed');
                    });
                }
                return this.on('onClosed', callback);
            }
        });

    });

    bingo.factory('$location', ['node', function (node) {

        return bingo.location(node);

    }]);

})(bingo);
