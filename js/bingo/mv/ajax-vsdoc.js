﻿
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
        /// <summary>
        /// 
        /// </summary>
        /// <param name="url"></param>
        /// <param name="view">可选, 所属的view</param>
        return _ajaxClass.NewObject(url).view(view);
    };
    bingo.ajaxSync = function (view) {
        /// <summary>
        /// 同步对象
        /// </summary>
        /// <param name="view">可选， 所属的view</param>
        return _ajaxSyncClass.NewObject().view(view).dependent(bingo.noop);
    };
    bingo.ajaxSyncAll = function (p, view) {
        /// <summary>
        /// 全局同步对象
        /// </summary>
        /// <param name="p">可以是function, ajax, ajaxSync</param>
        /// <param name="view">可选， 所属的view</param>
        return _syncAll(p, view);
    };

    var _ajaxBaseClass = bingo.ajax.ajaxBaseClass = bingo.Class(function () {

        this.Define({
            view: function (v) {
                if (arguments.length == 0)
                    return this._view;
                this._view = v;
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
                /// <summary>
                /// 成功事件
                /// </summary>
                /// <param name="callback" type="function(rs)"></param>
                return this;
            },
            error: function (callback) {
                /// <summary>
                /// 失败事件
                /// </summary>
                /// <param name="callback" type="function(rs)"></param>
                return this;
            },
            alway: function (callback) {
                /// <summary>
                /// 无论成功或失败事件
                /// </summary>
                /// <param name="callback" type="function(rs)"></param>
                return this;
            }
        });

    });

    var _ajaxClass = bingo.ajax.ajaxClass = bingo.Class(_ajaxBaseClass, function () {

        this.Prop({
            url: 'a.html',
            //是否异步, 默认true
            async: true,
            //请求类型， 默认json
            dataType: 'json',
            //参数
            param: {},
            //缓存到, 默认为null, 不缓存
            cacheTo: null,
            //缓存数量， 小于等于0, 不限制数据, 默认-1
            cacheMax: -1,
            //是否包函url query部分作为key 缓存数据, 默认true
            cacheQurey:true
        });

        this.Define({
            isCacheData:false,
            addToAjaxSync: function (ajaxSync) {
                /// <summary>
                /// 添加到ajaxSync同步
                /// </summary>
                /// <param name="ajaxSync">可选， 如果空， 添加全局同步</param>
              
                return this;
            },
            post: function () {
                /// <summary>
                /// 使用post方式发关请求
                /// </summary>
                this.post = bingo.noop;
                return this;
            },
            'get': function () {
                /// <summary>
                /// 使用get方式发关请求
                /// </summary>
                this.get = bingo.noop;
                return this;
            }
        });

    });

    var _ajaxSyncClass = bingo.ajax.ajaxaSyncClass = bingo.Class(_ajaxBaseClass, function () {

        this.Static({
            _syncList: [],
            lastSync: function () {
                var syncList = this._syncList;
                var len = syncList.length;
                return len > 0 ? syncList[len - 1] : null;
            }
        });

        this.Define({
            //解决, 马上成功
            resolve: function () {
            },
            //拒绝, 马上失败
            reject: function () {
            },
            dependent: function (p) {
                /// <summary>
                /// 依赖
                /// </summary>
                /// <param name="p">可以是function, ajax, ajaxSync</param>
                return this;
            },
            addCount: function (n) {
                /// <summary>
                /// 添加计数
                /// </summary>
                /// <param name="n">可选， 默认1</param>
                return this;
            },
            //计数减一, 计数为0时, 解决所有
            decCount: function () {
                return this;
            }
        });

    });

    var _syncAll = function (p, view) {
        if (!p) return null;
      
        return _ajaxSyncClass.NewObject().view(view);
    };

})(bingo);
