﻿
(function (bingo, $) {
    //version 1.1.0
    "use strict";

    var _rootView = null,
        _command = {};

    bingo.extend({
        compile: function (view) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="view">可选， 默认bingo.rootView()</param>
            return _compileClass.NewObject().view(view || _rootView);
        },
        tmpl: function (url, view) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="url"></param>
            /// <param name="view">可选</param>
            return _tmplClass.NewObject().url(url).view(view);
        },
        rootView: function () {
            return bingo.view();
        }
    });

    bingo.compile.removeNode = function (jqSelector) {
        /// <summary>
        /// 删除节点
        /// </summary>
        /// <param name="jqSelector"></param>
    };


    var _tmplClass = bingo.compile.tmplClass = bingo.Class(bingo.ajax.ajaxClass, function () {

        this.Initialization(function () {
            this.base();
        });
    });

    //模板==负责编译======================
    var _compileClass = bingo.compile.templateClass = bingo.Class(function () {

        this.Static({
            cacheMax:100
        });

        this.Prop({
            action: null,
            fromUrl: '',
            //withData作用空间, 单个时用
            withData: null,
            //作用空间， 批量时用
            withDataList: null,
            //是否停止
            stop: false,
            view:null
        });

        this.Define({
            action: function (fn) {
                /// <summary>
                /// 给下一级新的View注入action
                /// </summary>
                /// <param name="fn" type="function(inject...)"></param>
                if (arguments.length == 0) {
                    return this._action;
                } else {
                    fn && bingo.factory(fn);
                    return this;
                }
            },
            fromJquery: function (jqSelector) {
                return this;
            },
            appendTo: function (jqSelector) {
                return this;
            },
            fromNode: function (node) {
                return this;
            },
            fromHtml: function (html) {
                return this;
            },
            onCompilePre: function (callback) {
                /// <summary>
                /// 
                /// </summary>
                /// <param name="callback" value='function(node)'></param>
                callback && intellisenseSetCallContext(callback, this, [document.body]);
                return this;
            },
            //编译前执行， function
            onCompiled: function (callback) {
                /// <summary>
                /// 
                /// </summary>
                /// <param name="callback" value='function(node)'></param>
                callback && intellisenseSetCallContext(callback, this, [document.body]);
                return this;
            },
            compile: function () {
                return this;
            }
        });

    });

    //绑定内容解释器==========================
    var _bindClass = bingo.compile.bindClass = bingo.Class(function () {

        //viewnode, viewnodeAttr
        this.Prop({
            view: null,
            node: null,
            viewnode:null,
            //属性原值
            $prop: '1'
        });

        this.Define({
            $eval: function (event) {
                /// <summary>
                /// 执行内容, 根据执行返回结果, 会报出错误
                /// </summary>
                /// <param name="event">可选, 事件</param>
                return {};
            },
            $results: function (event) {
                /// <summary>
                /// 执行内容, 一定会返回结果, 不会报出错误
                /// </summary>
                /// <param name="event">可选, 事件</param>
                return {};
            },
            //返回withData/$view/window属性值
            $value: function (value) {
                
                if (arguments.length > 0) {
                    return this;
                } else {
                    return {};
                }

            },
            $filter: function (val) {
                return {};
            },
            getWithData: function () {
                /// <summary>
                /// withData只在编译时能设置, 之后不能变动<br />
                /// 只有一个withData, 如果要多层， 请用{item:{}, item2:{}}这种方式
                /// </summary>
                return this._withData;
            }
        });

        this.Initialization(function (view, node, content, withData) {
            /// <param name="view"></param>
            /// <param name="node"></param>
            /// <param name="content"></param>
            /// <param name="withData">可选</param>

            this._withData = withData;
            this.view(view).node(node);
            this.$prop(content);

        });
    });

    bingo.compile.bind = function (view, node, content, withData) {
        return _bindClass.NewObject(view, node, content, withData);
    };


    //node绑定内容解释器==========================
    var _nodeBindClass = bingo.compile.nodeBindClass = bingo.Class(bingo.linkToDom.LinkToDomClass, function () {

        this.Define({
            $getAttr: function (name) {
                return bingo.compile.bind(this.view(), this.node(), '111', this.withData());
            },
            $prop: function (name, p) {
                if (arguments.length == 1) {
                    return '1111';
                } else {
                    return this;
                }
            },
            //执行内容, 不会报出错误
            $eval: function (name, event, view) {
                return {};
            },
            //执行内容, 并返回结果, 不会报出错误
            $results: function (name, event, view) {
                return {};
            },
            //返回withData/$view/window属性值
            $value: function (name, value) {
                if (!attr) return;
                if (arguments.length == 1)
                    return {};
                else
                    return this;
            }
        });

        this.Prop({
            view: null,
            node: null,
            withData:null
        });

        this.Initialization(function (view, node, withData) {
            /// <param name="view"></param>
            /// <param name="node"></param>
            /// <param name="withData可选</param>
            this.base();
            this.withData(withData).view(view).node(node);
            this.linkToDom(node);

        });
    });

    bingo.compile.bindNode = function (view, node, withData) {
        return _nodeBindClass.NewObject(view, node, withData);
    };

})(bingo, window.jQuery);
