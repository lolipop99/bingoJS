
(function (bingo) {
    //version 1.0.1
    "use strict";

    /*
        bingo.ajax(url, $view)
            .async(true).dataType('json').cache(false)
            .param({})
            .success(function(rs){})
            .error(function(rs){})
            .alway(function(rs){})
            .post() //.get()
    */

    bingo.ajax = function (url, view) {
        return _ajaxClass.NewObject(url).view(view);
    };
    bingo.ajaxSync = function (view) {
        /// <summary>
        /// 
        /// </summary>
        return _ajaxSyncClass.NewObject().view(view).dependent(bingo.noop);
    };
    bingo.ajaxSyncAll = function (p, view) {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="p">可以是function, ajax, ajaxSync</param>
        return _syncAll(p, view);
    };

    var _ajaxBaseClass = bingo.ajax.ajaxBaseClass = bingo.Class(function () {

        this.Define({
            view: function (v) {
                if (arguments.length == 0) return this._view;
                this._view = v;
                //this.disposeByOther(v);
                return this;
            },
            deferred: function () {
                /// <summary>
                /// 
                /// </summary>
                /// <returns value='$.Deferred()'></returns>
                this._dtd || (this._dtd = $.Deferred());
                return this._dtd;
            },
            success: function (callback) {
                this.deferred().done(callback);
                return this;
            },
            error: function (callback) {
                this.deferred().fail(callback);
                return this;
            },
            alway: function (callback) {
                this.deferred().always(callback);
                return this;
            }
        });

    });

    var _ajaxClass = bingo.ajax.ajaxClass = bingo.Class(_ajaxBaseClass, function () {

        this.Static({
            holdServer: function (ajax, response, isSuccess, xhr) {
                return [response, isSuccess, xhr];
            }
        });

        var _disposeEnd = function (servers) {
            if (!servers.isDisposed) return;
            setTimeout(function () {
                servers.dispose();
            }, 1);
        };

        var _loadServer = function (servers, type) {
            /// <param name="servers" value='_ajaxClass.NewObject()'></param>
            var view = servers.view();
            if (servers.isDisposed || (view && view.isDisposed)) { _disposeEnd(servers); return; }
            var datas = bingo.clone(servers.param() || {});

            var holdServer = servers.holdServer() || _ajaxClass.holdServer,
                deferred = servers.deferred();

            var cacheMG = null,
                url = servers.url();
            var cacheTo = servers.cacheTo();
            if (cacheTo) {
                var cKey = servers.cacheQurey() ? url : url.split('?')[0];
                cacheMG = bingo.cacheToObject(cacheTo).max(servers.cacheMax()).key(cKey.toLowerCase());
                if (cacheMG.has()) {
                    var cacheData = cacheMG.get();
                    if (bingo.isObject(cacheData)) cacheData = bingo.clone(cacheData);
                    servers.isCacheData = true;
                    if (servers.async())
                        setTimeout(function () {
                            if (!servers.isDisposed) {
                                (view && view.isDisposed) || deferred.resolveWith(servers, [cacheData]);
                                _disposeEnd(servers);
                            }
                        });
                    else
                        deferred.resolveWith(servers, [cacheData]);
                    _disposeEnd(servers);
                    return;
                }
            }

            var _hold = function (response, status, xhr) {
                if (!servers.isDisposed) {
                    if (!(view && view.isDisposed)) {
                        try {
                            var hL = holdServer(servers, response, status, xhr);
                            response = hL[0], status = hL[1], xhr = hL[2];

                            if (status === true) {
                                cacheMG && cacheMG.set(response)
                                deferred.resolveWith(servers, [response]);
                            } else
                                deferred.rejectWith(servers, [response, false, xhr]);
                        } catch (e) {
                            bingo.trace(e);
                        }
                    }
                    _disposeEnd(servers);
                }
            };

            $.ajax({
                type: type,
                url: url,
                data: datas,
                async: servers.async(),
                cache: false,
                dataType: servers.dataType(),
                success: function (response, status, xhr) {
                    _hold(response, true, xhr);
                },
                error: function (xhr, status, response) {
                    _hold(response, false, xhr);
                }
            });
        };

        this.Prop({
            url: { $set: function (value) { this.value = bingo.route(value); } },
            async: true,
            dataType: 'json',
            param: {},
            //缓存到
            cacheTo: null,
            //缓存数量， 小于等于0, 不限制数据
            cacheMax: -1,
            cacheQurey: true,
            holdServer:null
        });

        this.Define({
            isCacheData: false,
            addToAjaxSync: function (ajaxSync) {
                /// <summary>
                /// 添加到ajaxSync同步
                /// </summary>
                /// <param name="ajaxSync">可选， 如果空， 添加全局同步</param>
                ajaxSync || (ajaxSync = _ajaxSyncClass.lastSync(this.view()));
                if (ajaxSync) {
                    ajaxSync.dependent(this);
                }
                return this;
            },
            post: function () {
                if (this.async()) this.addToAjaxSync();
                _loadServer(this, 'post');
                this.post = bingo.noop;
                return this;
            },
            'get': function () {
                if (this.async()) this.addToAjaxSync();
                _loadServer(this, 'get');
                this.get = bingo.noop;
                return this;
            }
        });

        this.Initialization(function (url) {
            this.url(url);
        });
    });

    var _ajaxSyncClass = bingo.ajax.ajaxaSyncClass = bingo.Class(_ajaxBaseClass, function () {

        this.Static({
            _syncList: [],
            getSyncList: function (view) {
                return (view && view.__syncList_ && (view.__syncList_ = [])) || this._syncList;
            },
            lastSync: function (view) {
                var syncList = this.getSyncList(view);
                var len = syncList.length;
                return len > 0 ? syncList[len - 1] : null;
            }
        });

        this.Define({
            //解决, 马上成功
            resolve: function () {
                this._count = 0;
                this._dtd && this.deferred().resolve();
                this.dispose();
            },
            //拒绝, 马上失败
            reject: function () {
                this._count = 0;
                this._dtd && this.deferred().reject();
                this.dispose();
            },
            dependent: function (p) {
                /// <summary>
                /// 依赖
                /// </summary>
                /// <param name="p">可以是function, ajax, ajaxSync</param>
                this.addCount();
                var $this = this;
                if (bingo.isFunction(p)) {
                    try {
                        p.call(this);
                        setTimeout(function () { !$this.isDisposed && $this.decCount(); }, 1);
                    } catch (e) {
                        bingo.trace(e);
                        this.reject();
                    }
                } else {

                    this.view() || p.view() || p.view(this.view());
                    p.view() || this.view() || this.view(p.view());

                    p.error(function () {
                        setTimeout(function () { !$this.isDisposed && $this.reject(); }, 1);
                    }).success(function () {
                        setTimeout(function () { !$this.isDisposed && $this.decCount(); }, 1);
                    });
                }
                return this;
            },
            _count: 0,
            //计数加一
            addCount: function (n) {
                this._count += arguments.length == 0 ? 1 : n;
                return this;
            },
            //计数减一, 计数为0时, 解决所有
            decCount: function () {
                this._count--;
                this._checkResolve();
                return this;
            },
            _checkResolve: function () {
                if (this._count <= 0) { this.resolve(); }
            }
        });

    });

    var _syncAll = function (p, view) {
        if (!p) return null;
        var syncList = _ajaxSyncClass.getSyncList(view);
        var lastSync = _ajaxSyncClass.lastSync(view);
        var syncObj = _ajaxSyncClass.NewObject();

        lastSync && lastSync.dependent(syncObj);

        syncList.push(syncObj);
        syncObj.view(view).dependent(p);
        syncList.pop();

        return syncObj;
    };

})(bingo);
