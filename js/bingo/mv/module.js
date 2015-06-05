
(function (bingo) {
    //version 1.1.0
    "use strict";

    /*
        //定义action与service:
    
        //定义system/user/list 和 system/user/form 两个action
        bingo.module('system', function () {
    
            //控制器user
            bingo.controller('user', function () {
    
                //action list
                bingo.action('list', function ($view) {
                    //这里开始写业务代码
                    $view.on('ready', function () {
                    });
    
                });
    
                //action form
                bingo.action('form', function ($view) {
                });
            });

             //定义system 的 userService
            bingo.service('userService', function ($ajax) {
                //这里写服务代码
            });

            //定义system 的 factory1
            bingo.factory('factory1', function($view){});

            //定义system 的 command1
            bingo.command('command1', function(){ return function($view){}});

            //定义system 的 filter1
            bingo.filter('filter1', function($view){ return function(value, params){ return value; }});
    
        });
    
        //定义system/userService服务
        bingo.module('system', function () {
    
            //userService
            bingo.service('userService', function ($ajax) {
                //这里写服务代码
            });
    
        });
    
    */

    var _makeCommandOpt = function (fn) {
        var opt = {
            priority: 50,
            tmpl: '',
            tmplUrl: '',
            replace: false,
            include: false,
            view: false,
            compileChild: true
            //action: null,
            //compilePre: null,
            //compile: null,
            //link: null
        };
        fn = fn();
        if (bingo.isFunction(fn) || bingo.isArray(fn)) {
            opt.link = fn;
        } else
            opt = bingo.extend(opt, fn);
        return opt;
    }, _commandFn = function (name, fn) {
        if (bingo.isNullEmpty(name)) return;
        name = name.toLowerCase();
        if (arguments.length == 1)
            return _getModuleValue.call(this, '_commands', name);
        else {
            return this._commands[name] = _makeCommandOpt(fn);
        }
    }, _filterFn = function (name, fn) {
        if (bingo.isNullEmpty(name)) return null;
        if (arguments.length == 1)
            return _getModuleValue.call(this, '_filters', name);
        else
            return this._filters[name] = fn;
    }, _factoryFn = function (name, fn) {
        var len = arguments.length;
        if (len == 0)
            return this._factorys;
        else if (len == 1) {
            var fn = bingo.isString(name) ? _getModuleValue.call(this, '_factorys', name) : name;
            if (!fn) return null;
            return bingo.factory.factoryClass.NewObject().setFactory(fn);
        } else
            return this._factorys[name] = fn;

    }, _serviceFn = function (name, fn) {
        if (bingo.isNullEmpty(name)) return;
        if (arguments.length == 1)
            return _getModuleValue.call(this, '_services', name);
        else {
            fn.$owner = { module: this };
            return this._services[name] = fn;
        }
    }, _controllerFn = function (name, fn) {
        if (bingo.isNullEmpty(name)) return;
        var conroller = this._controllers[name];
        if (!conroller)
            conroller = this._controllers[name] = {
                module: this,
                name: name, _actions: {},
                action: _actionFn
            };
        if (bingo.isFunction(fn)) {
            var hasLM = _lastModule;
            !hasLM && (_lastModule = this);
            _lastContoller = conroller;
            fn.call(conroller);
            _lastContoller = null;
            !hasLM && (_lastModule = null);
        }
        return conroller;
    }, _actionFn = function (name, fn) {
        if (arguments.length == 1)
            return this._actions[name];
        else {
            fn.$owner = { conroller: this, module: this.module };
            return this._actions[name] = fn;
        }
    }, _actionMDFn = function (name, fn) {
        if (arguments.length == 1)
            return this._actions[name];
        else {
            fn.$owner = { conroller: null, module: this };
            return this._actions[name] = fn;
        }
    }, _getLastModule = function () {
        return _lastModule || _defaultModule;
    }, _getModuleValue = function (prop, name) {
        return this[prop][name] || (this != _defaultModule ? _defaultModule[prop][name] : null);
    };

    var _module = {}, _lastModule = null, _lastContoller = null;
    bingo.extend({
        defaultModule: function () {
            return _defaultModule;
        },
        getModuleByView: function (view) { return view ? view.$getModule() : bingo.defaultModule(); },
        //定义或获取模块
        module: function (name, fn) {
            if (this.isNullEmpty(name)) return null;
            //if (arguments.length == 1)
            //    return _module[name];

            var module = _module[name];

            if (!module)
                module = _module[name] = {
                    name: name, _services: {}, _controllers: {},
                    _commands: {}, _filters: {}, _factorys: {},
                    _actions: {}, action: _actionMDFn,
                    service: _serviceFn,
                    controller: _controllerFn,
                    command: _commandFn,
                    filter: _filterFn,
                    factory: _factoryFn
                };

            if (bingo.isFunction(fn)) {
                _lastModule = module;
                fn.call(module);
                _lastModule = null;
            }
            return module;
        },
        service: function (name, fn) {
            var lm = _lastModule || _defaultModule;
            return lm.service.apply(lm, arguments);
        },
        controller: function (name, fn) {
            var lm = _lastModule || _defaultModule;
            return lm.controller.apply(lm, arguments);
        },
        action: function (name, fn) {
            if (bingo.isFunction(name) || bingo.isArray(name)) {
                return name;
            } else if (_lastContoller)
                return _lastContoller.action.apply(_lastContoller, arguments);
            else {
                var lm = _lastModule || _defaultModule;
                return lm.action.apply(lm, arguments);
            }

        },
        command: function (name, fn) {
            var lm = _lastModule || _defaultModule;
            return lm.command.apply(lm, arguments);
        },
        filter: function (name, fn) {
            var lm = _lastModule || _defaultModule;
            return lm.filter.apply(lm, arguments);
        },
        factory: function (name, fn) {
            var lm = _lastModule || _defaultModule;
            return lm.factory.apply(lm, arguments);
        }
    });

    var _defaultModule = bingo.module('_$defaultModule$_');

})(bingo);
