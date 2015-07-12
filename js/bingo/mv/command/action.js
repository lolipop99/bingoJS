
(function (bingo) {
    /*
        使用方法:
        bg-action="function($view){}"   //直接绑定一个function
        bg-action="ctrl/system/user"    //绑定到一个url
    */
    bingo.command('bg-action', function () {

        return {
            //优先级, 越大越前, 默认50
            priority: 1000,
            //模板
            tmpl: '',
            //外部模板
            tmplUrl: '',
            //是否替换节点, 默认为false
            replace: false,
            //是否indclude, 默认为false, 模板内容要包函bg-include
            include: false,
            //是否新view, 默认为false
            view: true,
            //是否编译子节点, 默认为true
            compileChild: false,
            //编译前, 没有$viewnode和$attr注入, 即可以用不依懒$domnode和$attr的所有注入, 如$view/node/$node/$ajax...
            //如果view == true , 注入的view属于上层, 原因是新view还没解释出来, 还处于分析
            compilePre: null,
            //action
            action: null,
            //link
            link: null,
            //编译, (compilePre编译前-->action初始数据-->compile编译-->link连接command)
            compile: ['$view', '$compile', '$node', '$attr', function ($view, $compile, $node, $attr) {
                /// <param name="$view" value="bingo.view.viewClass()"></param>
                /// <param name="$compile" value="function(){return bingo.compile();}"></param>
                /// <param name="$attr" value="bingo.view.viewnodeAttrClass()"></param>
                /// <param name="$node" value="$([])"></param>

                var attrVal = $attr.$prop(), val = null;
                if (!bingo.isNullEmpty(attrVal)) {
                    val = $attr.$results();
                    //如果没有取父域
                    if (!val) val = bingo.datavalue($view.$parentView(), attrVal);
                }

                if (bingo.isNullEmpty(attrVal)
                    || bingo.isFunction(val) || bingo.isArray(val)) {
                    //如果是function或数组, 直接当action, 或是空值时

                    //添加action
                    val && $view.$addAction(val);
                    //编译
                    $compile().fromNode($node[0].childNodes).compile();
                } else {
                    //使用url方式, 异步加载action, 走mvc开发模式
                    var url = attrVal;

                    var routeContext = bingo.routeContext(url);
                    var actionContext = routeContext.actionContext();

                    if (actionContext.action) {
                        //如果acion不为空, 即已经定义action

                        //设置module
                        $view.$setModule(actionContext.module);
                        //添加action
                        $view.$addAction(actionContext.action);
                        //编译
                        $compile().fromNode($node[0].childNodes).compile();
                    } else {
                        //如果找不到acion, 加载js

                        //加载js后再断续解释
                        //$using有同步view启动作用, ready之后， 没有作用
                        $view.$using(url, function () {

                            var actionContext = routeContext.actionContext();
                            if (actionContext.action) {
                                //设置module
                                $view.$setModule(actionContext.module);
                                //添加action
                                $view.$addAction(actionContext.action);
                                //编译
                                $compile().fromNode($node[0].childNodes).compile();
                            }
                        });
                    }
                }
            }]
        };
    });
})(bingo);
