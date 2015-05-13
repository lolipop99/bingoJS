
(function (bingo, $) {
    //version 1.0.1
    "use strict";

    bingo.factory('$rootView', function () {
        return bingo.rootView();
    });

    bingo.factory('$compile', ['$view', function (view) {
        return function () { return bingo.compile(view); }
    }]);

    bingo.factory('$tmpl', ['$view', function (view) {
        return function (url) { return bingo.tmpl(url, view); }
    }]);

    bingo.factory('$node', ['node', function (node) {
        return $(node);
    }]);

    bingo.factory('$factory', ['$view', function (view) {
        return function (fn) {
            return bingo.factory(fn).view(view);
        };
    }]);

    /*
        //同步syncAll
        $ajax.syncAll(function(){
            
            //第一个请求
            $ajax(url).post()
            //第二个请求, 或更多
            $ajax(url).post()
            .......

        }).success(function(){
	        //所有请求成功后, 
        });
    */

    bingo.factory('$ajax', ['$view', function ($view) {
        var fn = function (url) {
            return bingo.ajax(url, $view);
        };
        fn.syncAll = function (callback) { return bingo.ajaxSyncAll(callback, $view); };
        return fn;
    }]);

    bingo.factory('$filter', ['$view', 'node', '$withData', function ($view, node, $withData) {
        return function (content, withData) {
            return bingo.filter.createFilter(content, $view, node, withData || $withData);
        };
    }]);


    /*
        $view.datas = {
	        userList:$var([{name:'张三'}, {name:'李四'}])
        };

        var list = $view.datas.userList();
        list.push([{name:'王五'}]);
        $view.datas.userList(list);//重新赋值, 会自动更新到$view
        // $view.datas.userList.$setChange();//或调用$setChange强制更新

        //可以观察值(改变时)
        $view.data.userList.onChange(function(value){ console.log('change:', value); });

        //可以观察值(无论有没改变)
        $view.data.userList.onSubs(function(value){ console.log('change:', value); });

    */
    bingo.factory('$var', ['$view', function ($view) {
        return function (p, owner) { return bingo.variable(p, owner, $view); };
    }]);

    /*
        $view.datas = $model({
	        id:'1111',
            name:'张三'
        });

        //设置值, 可以使用链式写法, 并会自动更新到$view
        $view.datas.id('2222').name('张三');
        //获取值
        var id = $view.data.id();

        //可以观察值(改变时)
        $view.data.id.onChange(function(value){ console.log('change:', value); });

        //可以观察值(无论有没改变)
        $view.data.id.onSubs(function(value){ console.log('change:', value); });
    */
    bingo.factory('$model', ['$view', function ($view) {
        return function (p) { return bingo.model(p, $view); };
    }]);


    //绑定内容解释器, var bind = $bindContext('user.id == "1"', document.body); var val = bind.getContext();
    bingo.factory('$bindContext', ['$view', '$viewnode', '$attr', '$withData', function ($view, $viewnode, $attr, $withData) {
        //$viewnode, $attr, $withData为可选
        return function (bindText, node, withData) {
            //node, withData可选
            node || (node = $viewnode && $viewnode.node);
            withData || (withData = $withData);
            return bingo.compile.bind($view, node, bindText, withData);
        };
    }]);


    //绑定属性解释器
    bingo.factory('$nodeContext', ['$view', '$viewnode', '$withData', function ($view, $viewnode, $withData) {
        //$viewnode, $attr, $withData为可选
        return function (node, withData) {
            //withData可选
            node || (node = $viewnode && $viewnode.node);
            withData || (withData = $withData);
            return bingo.compile.bindNode($view, node, withData);
        };
    }]);


    bingo.factory('$observer', ['$view', function ($view) {
        return bingo.observer($view);
    }]);

    /*
        $view.title = '标题';
        $view.text = '';

        $subs('title', function(newValue){
	        $view.text = newValue + '_text';
        });

        ........
        $view.title = '我的标题';
        $view.$update();
    */
    bingo.each(['$subscribe', '$subs'], function (name) {
        bingo.factory(name, ['$observer', '$attr', function ($observer, $attr) {
            return function (p, callback, deep) {
                return $observer.subscribe(p, callback, deep, $attr);
            };
        }]);
    });

    bingo.factory('$module', ['$view', function ($view) {
        return function (name) {
            var module = arguments.length == 0 ? $view.$getModule() : bingo.module(name);
            return !module ? null : {
                $service: function (name) {
                    var service = module.service(name);
                    return !service ? null : bingo.factory(name).view($view).inject();
                },
                $controller: function (name) {
                    var controller = module.controller(name);
                    return !controller ? null : {
                        $action: function (name) {
                            var action = controller.action(name);
                            return !action ? null : bingo.factory(action).view($view).inject();
                        }
                    };
                }
            };
        }
    }]);


    /*
        //1. 添加或设置路由'view'
        bingo.route('view', {
            //路由地址
            url: 'view/{module}/{controller}/{action}',
            //路由转发到地址
            toUrl: 'modules/{module}/views/{controller}/{action}.html',
            //默认值
            defaultValue: { module: '', controller: '', action: '' }
        });

        //2. 根据url生成目标url;
            var url = bingo.route('view/system/user/list');
                返回结果==>'modules/system/views/user/list.html'
    */
    bingo.factory('$route', function () {
        return function (url) {
            return bingo.route(url);
        };
    });

    /*
        //根据url生成routeContext;
        var routeContext = bingo.routeContext('view/system/user/list');
            返回结果==>{
                url:'view/system/user/list',
                toUrl:'modules/system/views/user/list.html',
                params:{ module: 'system', controller: 'user', action: 'list' }
            }
    */
    bingo.factory('$routeContext', function () {
        return function (url) {
            return bingo.routeContext(url);
        };
    });




})(bingo, window.jQuery);
