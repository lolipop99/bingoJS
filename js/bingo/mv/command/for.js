
(function (bingo) {
    //version 1.0.1
    "use strict";

    var _renderReg = /[ ]*([^ ]+)[ ]+in[ ]+([^ ]+)/g;

    /*
        使用方法:
        bg-render="item in user.list"

        例:
        <select bg-render="item in list">
            ${if item.id == 1}
            <option value="${item.id}">text_${item.text}</option>
            ${else}
            <option value="${item.id}">text_${item.text}eee</option>
            ${/if}
        </select>
    */
    bingo.each(['bg-for', 'bg-render'], function (cmdName) {

        var _cacheObj = {};
        bingo.command(cmdName, function () {
            return {
                priority: 100,
                compileChild: false,
                link: ['$view', '$compile', '$node', '$attr', '$render', '$ajax', function ($view, $compile, $node, $attr, $render, $ajax) {
                    /// <param name="$view" value="bingo.view.viewClass()"></param>
                    /// <param name="$compile" value="function(){return bingo.compile();}"></param>
                    /// <param name="$node" value="$([])"></param>
                    /// <param name="$attr" value="bingo.view.viewnodeAttrClass()"></param>
                    /// <param name="$render" value="function(html){return  bingo.render('');}"></param>
                    /// <param name="$ajax" value="function(url){return bingo.ajax('');}"></param>

                    var code = $attr.$prop();
                    if (bingo.isNullEmpty(code)) return;
                    var _itemName = '', _dataName = '';
                    _renderReg.lastIndex = 0;
                    //分析item名称, 和数据名称
                    code.replace(_renderReg, function () {
                        _itemName = arguments[1];
                        _dataName = arguments[2];
                    });
                    if (bingo.isNullEmpty(_itemName) || bingo.isNullEmpty(_dataName)) return;
                    $attr.$prop(_dataName);

                    var renderObj = null;

                    var getRenderObj = function (html) {
                        //console.log(html);
                        return $render(html);
                    };

                    var _renderSimple = function (datas) {

                        var jElement = $node;
                        var html = '';
                        jElement.html('');
                        //if (!bingo.isArray(datas)) datas = bingo.isNull(datas) ? [] : [datas];
                        var withDataList = [];//收集数据
                        html = renderObj.render(datas, _itemName, null, -1, withDataList);
                        //console.log(withDataList);
                        //使用withDataList进行数组批量编译
                        bingo.isNullEmpty(html) || $compile().fromHtml(html).withDataList(withDataList).appendTo(jElement).compile();
                    };


                    var initTmpl = function () {
                        $attr.$subsResults(function (newValue) {
                            _renderSimple(newValue);
                        }, true);
                        $attr.$initResults(function (value) {
                            _renderSimple(value);
                        });
                    };

                    var tmplUrl = $node.attr('tmpl-url'), tmplNode = null;
                    if (!bingo.isNullEmpty(tmplUrl)) {
                        //从url加载
                        $ajax(tmplUrl).success(function (html) {
                            if (!bingo.isNullEmpty(html)) {
                                renderObj = getRenderObj(html);
                                initTmpl();
                            }
                        }).dataType('text').cacheTo(_cacheObj).cacheMax(50).get();
                    } else {
                        var tmplId = $node.attr('tmpl-id');
                        var html = '';
                        if (bingo.isNullEmpty(tmplId)) {
                            //从dom id加载
                            var jChild = $node.children();
                            if (jChild.size() === 1 && jChild.is('script'))
                                html = jChild.html();
                            else
                                html = $node.html();
                        } else {
                            html = $('#' + tmplId).html();
                        }
                        if (!bingo.isNullEmpty(html)) {
                            renderObj = getRenderObj(html);
                            initTmpl();
                        }
                    }

                }]
            };

        });

    });

})(bingo);

