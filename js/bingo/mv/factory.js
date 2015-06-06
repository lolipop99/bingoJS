
(function (bingo) {
    //version 1.1.0
    "use strict";

    /*
        //定义factory
        bingo.factory('name', function ($view) {
            return $view;
        });

        //定义factory方法二
        bingo.factory('name', ['$view', function (v) {
            return v;
        }]);


        //factory的注入
        bingo.factory('name').view(view).inject();

        //factory的注入方法二
        bingo.factory(function($view){ return $view;}).view(view).inject();

         //factory的注入方法三
        bingo.factory(['$view', function(v){ return v;}]).view(view).inject();
  
    */

    var _factoryClass = bingo.Class(function () {

        this.Prop({
            name: '',
            view: null,
            viewnode: null,
            viewnodeAttr:null,
            widthData: null,
            node: null,
            //定义内容
            fn: null,
            //其它参数
            params:null
        });

        this.Define({
            //重置参数
            reset: function () {
               this.view(null).viewnode(null).viewnodeAttr(null)
                    .widthData(null).node(null).params(null);
               return this;
            },
            _newInjectObj: function () {
                //新建一个InjectObj
                var attr = this.viewnodeAttr(),
                    viewnode = this.viewnode() || (attr && attr.viewnode()),
                    view = this.view() || (viewnode && viewnode.view()) || bingo.rootView(),
                    node = this.node() || (viewnode && viewnode.node() )|| view.$node(),
                    withData = this.widthData() || (viewnode && viewnode.getWithData());
                return {
                    node: node,
                    $view: view,
                    $viewnode: viewnode,
                    $attr: attr,
                    $withData: withData,
                    $command: attr && attr.command,
                    $injectParam:this.params()
                };
            },
            //注入
            inject: function (owner) {
                /// <summary>
                /// 
                /// </summary>
                /// <param name="owner">默认attr||viewnode||view</param>
                var fn = this.fn();
                var $injects = fn.$injects;
                var injectObj = $injects && $injects.length > 0 ? this._newInjectObj() : {};
                return this._inject(owner || this.viewnodeAttr() || this.viewnode() || this.view(),
                    this.name(), injectObj, true);
            },
            //注入
            _inject: function (owner, name, injectObj, isFirst) {
                var fn = this.fn();
                if (!fn) throw new Error('not find factory: ' + name);
                var $injects = fn.$injects;
                var injectParams = [], $this = this;
                if ($injects && $injects.length > 0) {
                    var pTemp = null;
                    bingo.each($injects, function (item) {
                        if (item in injectObj) {
                            pTemp = injectObj[item];
                        } else {
                            //注意, 有循环引用问题
                            pTemp = injectObj[item] = $this.setFactory(item)._inject(owner, item, injectObj, false);
                        }
                        injectParams.push(pTemp);
                    });
                }

                var ret = fn.apply(fn.$owner || owner, injectParams) || {};
                !isFirst && (injectObj[name] = ret);

                return ret;
            },
            setFactory: function (name) {
                var fn = null;
                if (bingo.isFunction(name) || bingo.isArray(name)) {
                    //支持用法：factory(function(){})
                    fn = _makeInjectAttrs(name);
                    name = '';
                }
                else {
                    var moduleI = bingo.getModuleByView(this.view());
                    var moduleDefault = bingo.defaultModule();
                    var factorys = moduleI.factory();
                    var factorys2 = moduleDefault == moduleI ? null : moduleDefault.factory();

                    fn = factorys[name] || (factorys2 && factorys2[name]) || moduleI.service(name) || (moduleDefault == moduleI ? null : moduleDefault.service(name));
                    fn && (fn = _makeInjectAttrs(fn));
                    //_makeInjectAttrs
                }
                return this.name(name).fn(fn);
            }

        });

    });

    //var _factory = {};//, _factoryObj = _factoryClass.NewObject();
    //bingo.extend({
    //    factory: function (name, fn) {
    //            //return _factoryObj.reset().setFactory(arguments[0]);
    //        if (arguments.length == 1)
    //            return _factoryClass.NewObject().setFactory(arguments[0]);
    //        else
    //            _factory[name] = _makeInjectAttrs(fn);
    //    }
    //});
    bingo.factory.factoryClass = _factoryClass;

    var _injectNoop = function () { };
    _injectNoop.$injects = [];

    var _makeInjectAttrRegx = /^\s*function[^(]*?\(([^)]+?)\)/i,
    _makeInjectAttrs = function (p) {
        if (p && (p.$injects || p.$fn)) return p.$fn || p;

        var fn = _injectNoop;
        if (bingo.isArray(p)) {
            var list = bingo.clone(p, false);
            fn = p.$fn = list.pop();
            fn.$injects = list;
            fn.$owner = p.$owner;
        } else if (bingo.isFunction(p)) {
            fn = p;
            var s = fn.toString();
            var list = [];
            s.replace(_makeInjectAttrRegx, function (findText, find0) {
                if (find0) {
                    bingo.each(find0.split(','), function (item) {
                        item = bingo.trim(item);
                        item && list.push(item);
                    });
                }
            });
            fn.$injects = list;
        }
        return fn;
    };

})(bingo);
