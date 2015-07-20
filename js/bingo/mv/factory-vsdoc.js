
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
                var node = document.body,
                    view = bingo.view(),
                    viewnode = view.$viewnode(),
                    attr = bingo.view.viewnodeAttrClass.NewObject(view, viewnode, 'text', '', '$view', null);

                return {
                    node: node,
                    $view: view,
                    $viewnode: viewnode,
                    $attr: attr,
                    $withData: {},
                    $command: null,
                    $injectParam:this.params()
                };
            },
            //注入
            inject: function (owner) {
                /// <summary>
                /// 
                /// </summary>
                /// <param name="owner">默认attr||viewnode||view</param>

                //var fn = this.fn();
                var injectObj = this._newInjectObj();
                //intellisenseSetCallContext(fn, this, [injectObj.$view])
                //return;
                return this._inject(owner || injectObj.$view,
                    this.name(), injectObj, true);
            },
            //注入
            _inject: function (owner, name, injectObj, isFirst) {
                var fn = this.fn();
                var $injects = fn.$injects;
                var injectParams = [], $this = this;
                //isFirst && intellisenseLogMessage('injectParams begin', JSON.stringify($injects), fn.toString());
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
                if (isFirst) {
                    //intellisenseLogMessage('injectParams', JSON.stringify($injects), fn.toString());
                    intellisenseSetCallContext(fn, fn.$owner || owner, injectParams);
                    //intellisenseLogMessage('injectParams', JSON.stringify($injects), JSON.stringify(injectParams));
                } else
                    injectObj[name] = ret;

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
                    var hasMN = name.indexOf('$') > 0, moduleName = '', nameT = name;
                    if (hasMN) {
                        moduleName = name.split('$');
                        nameT = moduleName[1];
                        moduleName = moduleName[0];
                    }

                    var appI = bingo.getAppByView(this.view());

                    var moduleI = hasMN ? appI.module(moduleName) : bingo.getModuleByView(this.view());


                    fn = _getInjectFn(appI, moduleI, nameT);
                    fn && (fn = _makeInjectAttrs(fn));
                }
                this.name(name).fn(fn);
                //this.inject();
                //intellisenseSetCallContext(fn, this, [{}]);

                return this;
            }

        });

    });

    var _getInjectFn = function (appI, moduleI, nameT) {
        var moduleDefault = bingo.defaultModule(appI);
        var factorys = moduleI.factory();
        var factorys2 = moduleDefault == moduleI ? null : moduleDefault.factory();

        var fn = factorys[nameT] || (factorys2 && factorys2[nameT]) || moduleI.service(nameT) || (moduleDefault == moduleI ? null : moduleDefault.service(nameT));
        if (fn)
            return fn;
        else
            return _getInjectFn(bingo.defaultApp(), bingo.defaultApp().defaultModule(), nameT);
    }

    bingo.factory.factoryClass = _factoryClass;

    var _injectNoop = function () { };
    _injectNoop.$injects = [];

    var _makeInjectAttrRegx = /^\s*function[^(]*?\(([^)]+?)\)/i,
    _makeInjectAttrs = function (p) {
        if (p && (p.$injects || p.$fn)) return p.$fn || p;

        var fn = _injectNoop;
        if (bingo.isArray(p)) {
            var list = bingo.clone(p, false);
            fn = list.pop();
            fn.$injects = list;
            fn.$owner = p.$owner;
            //intellisenseLogMessage('$injects', JSON.stringify(list), fn.toString());
        } else if (bingo.isFunction(p)) {
            fn = p;
            var s = fn.toString();
            var list = [], fL =null;
            s.replace(_makeInjectAttrRegx, function (findText, find0) {
                if (find0) {
                    fL = find0.split(',');
                    for (var i = 0, len = fL.length; i < len; i++) {
                        list.push(bingo.trim(fL[i]));
                    }
                    //intellisenseLogMessage('find0', find0, list);
                }
            });
            fn.$injects = list;
            //intellisenseLogMessage(JSON.stringify(list), s);
        }
        //intellisenseLogMessage('$injects', JSON.stringify(fn.$injects), fn.toString());
        return fn;
    };

})(bingo);
