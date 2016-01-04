/// <reference path="../service/userService.js" />

bingo.using('service/userService');

(function () {
    'use strict';

    //bg-render-sync
    (function () {

        var _renderReg = /[ ]*([^ ]+)[ ]+in[ ]+(?:(.+)[ ]+tmpl[ ]*=[ ]*(.+)|(.+))/;

        /*
            注意：只同步第一层的数据的顺序，删除和新增；
                不同步每一项render内容， 但可以用bg-指令绑定同步数据项内容

            使用方法:
            bg-render-sync="item in user.list"
    
            例:
            <select bg-render-sync="item in list">
                {{if item.id == 1}}
                <option value="{{: item.id}}">text_{{: item.text | text}}</option>
                {{else}}
                <option value="{{: item.id}}">text_{{: item.text | text}}eee</option>
                {{/if}}
            </select>
        */

        //bg-render-sync
        //bg-render-sync="datas"  ==等效==> bg-render="item in datas"
        //bg-render-sync="item in datas"
        //bg-render-sync="item in datas tmpl=#tmplid"    //tmpl以#开头认为ID
        //bg-render-sync="item in datas tmpl=view/user/listtmpl"  //tmpl不以#开头认为url, 将会异步加载
        //bg-render-sync="item in datas | asc"
        //bg-render-sync="item in datas | asc tmpl=#tmplid"
        bingo.each(['bg-for-sync', 'bg-render-sync'], function (cmdName) {

            bingo.command(cmdName, function () {
                return {
                    priority: 100,
                    compileChild: false,
                    link: ['$view', '$compile', '$node', '$attr', '$render', '$tmpl', function ($view, $compile, $node, $attr, $render, $tmpl) {

                        var attrData = _makeBindContext($node, $attr);
                        $node.html('');
                        //console.log(attrData);

                        if (!attrData) return;
                        var _itemName = attrData.itemName,
                            _tmpl = attrData.tmpl;


                        var _backupDatas = [];//上一次render结果

                        var _renderSimple = function (datas) {

                            var jElement = $node;
                            var html = '';
                            if (!bingo.isArray(datas)) datas = bingo.isNull(datas) ? [] : [datas];
                            var withDataList = [];//收集数据
                            var parenData = $attr.getWithData();
                            var parenDataIndex = parenData ? parenData.$index : -1;

                            if (datas.length == 0) {
                                //如果数据为空， 重置backupDatas, 直接render
                                jElement.html('');
                                _backupDatas = [];
                                html = renderObj.render(datas, _itemName, parenData, parenDataIndex, withDataList);
                                bingo.isNullEmpty(html) || $compile().fromHtml(html).withDataList(withDataList).appendTo(jElement).compile();
                            } else {
                                //如果数据不为空

                                if (_backupDatas.length == 0) {

                                    //如果backupDatas为空，不用同步，render并生成新的backupDatas
                                    jElement.html('');
                                    var time = bingo.makeAutoId(), preBackupDatas = [];
                                    //render数据， 并用<!--rs-.....-->html<!--rse-.....-->分隔dom与数据对应起来
                                    html = renderObj.render(datas, _itemName, parenData, parenDataIndex, withDataList, function (s, role, item, index) {
                                        if (role === 'body') {
                                            var id = [time, '_', index].join('');
                                            s = ['<!--rs-', id, '-->', s].join('');
                                            s = [s, '<!--rse-', id, '-->'].join('');
                                            preBackupDatas.push({
                                                id: id,
                                                index: index,
                                                datas: item,
                                                withDatas: null
                                            });
                                        }
                                        return s;
                                    });
                                    //提取withData到备份
                                    _makeWithDatas(preBackupDatas, withDataList, _itemName);
                                    _backupDatas = preBackupDatas;
                                    //编译
                                    bingo.isNullEmpty(html) || $compile().fromHtml(html).withDataList(withDataList).appendTo(jElement).compile();

                                } else { //else _backupDatas.length == 0
                                    //如果backupDatas为空，需要同步，render并生成新的backupDatas

                                    //同步删除数据
                                    var removeDatas = _getRemoveData(_backupDatas, datas);
                                    var ids = _getBackupIds(removeDatas);
                                    _backupDatas = _removeByBackupData(_backupDatas, removeDatas);
                                    var nodes = _getItemNodes(jElement[0], ids);
                                    (nodes && nodes.length > 0) && $(nodes).remove();

                                    //同步新增的数据
                                    var newDatas = _getNewData(_backupDatas, datas);
                                    if (newDatas.length > 0) {

                                        var time = bingo.makeAutoId(), preBackupDatas = [];
                                        //render数据， 并用<!--rs-.....-->html<!--rse-.....-->分隔dom与数据对应起来
                                        html = renderObj.render(newDatas, _itemName, parenData, parenDataIndex, withDataList, function (s, role, item, index) {
                                            if (role === 'body') {
                                                var id = [time, '_', index].join('');
                                                s = ['<!--rs-', id, '-->', s].join('');
                                                s = [s, '<!--rse-', id, '-->'].join('');
                                                preBackupDatas.push({
                                                    id: id,
                                                    datas: item,
                                                    withDatas: null
                                                });
                                            }
                                            return s;
                                        });
                                        //提取withData到备份
                                        _makeWithDatas(preBackupDatas, withDataList, _itemName);
                                        _backupDatas = _backupDatas.concat(preBackupDatas);
                                        //编译
                                        bingo.isNullEmpty(html) || $compile().fromHtml(html).withDataList(withDataList).appendTo(jElement).compile();

                                    } //end newDatas.length > 0

                                    //数据与node顺序同步， 并返回新的备份数据， 现实方法简单粗爆
                                    _backupDatas = _syncNodes(jElement[0], _backupDatas, datas, _itemName);

                                } //end _backupDatas.length == 0

                            } //end datas.length == 0

                        }; //end _renderSimple


                        var initTmpl = function (tmpl) {
                            renderObj = $render(tmpl);
                            $attr.$subsResults(function (newValue) {
                                _renderSimple(newValue);
                            }, true);
                            $attr.$initResults(function (value) {
                                _renderSimple(value);
                            });
                        };


                        var html = '', renderObj = null;

                        if (bingo.isNullEmpty(_tmpl)) {
                            html = attrData.html;
                        } else {
                            var isPath = (_tmpl.indexOf('#') != 0);
                            if (isPath) {
                                //从url加载
                                $tmpl(_tmpl).success(function (html) {
                                    if (!bingo.isNullEmpty(html)) {
                                        initTmpl(html);
                                    }
                                }).get();
                            } else {
                                //从ID加载
                                html = $(_tmpl).html();
                            }
                        }

                        if (!bingo.isNullEmpty(html)) {
                            initTmpl(html);
                        }

                    }]//end link
                };

            }); //end command

        });// end each command

        //分析render语法内容
        var _makeBindContext = function ($node, $attr) {
            //取得$attr原始内容， 包括filter部分
            var code = $attr.content;
            //如果值为空
            if (bingo.isNullEmpty(code))
                code = 'item in {}';

            //如果值没有item in ...
            if (!_renderReg.test(code)) {
                code = ['item in ', code].join('');
            }
            var _itemName = '', _dataName = '', _tmpl = '';
            //分析item名称, 和数据名称
            code.replace(_renderReg, function () {
                _itemName = arguments[1];
                _dataName = arguments[2];
                _tmpl = bingo.trim(arguments[3]);

                if (bingo.isNullEmpty(_dataName))
                    _dataName = arguments[4];

            });

            //重新设置value
            $attr.$attrValue(_dataName);

            return {
                itemName: _itemName,
                dataName: _dataName,
                tmpl: _tmpl,
                html: _tmpl ? '' : bingo.compile.getNodeContentTmpl($node)
            }
        };

        //提取widthDatas
        var _makeWithDatas = function (backupDatas, withDatas, itemName) {
            bingo.each(backupDatas, function () {
                var t = this.datas;
                var w = bingo.linq(withDatas).where(function () { return this[itemName] === t; }).first();
                this.withDatas = w;
            });
        };

        var _getIdByNode = function (node) {
            //取得node对应的Id
            return (node.nodeType === 8 && node.nodeValue
                && node.nodeValue.indexOf('rs-') === 0) ?
                node.nodeValue.replace('rs-', '') : '';
        }, _isEndNode = function (node) {
            //是还结束node
            return node.nodeType === 8 && node.nodeValue
                && node.nodeValue.indexOf('rse-') === 0;
        }, _getItemNodes = function (contentNode, ids) {
            //根据一组id, 返回对应的nodes
            ids = bingo.clone(ids, false, true);
            var next = contentNode.firstChild, nodes = [], curId = '';
            if (next) {
                do {
                    var id = _getIdByNode(next);
                    if (!bingo.isNullEmpty(id)) {
                        if (bingo.inArray(id, ids) >= 0) {
                            curId = id;
                            nodes.push(next);
                        } else {
                            curId = '';
                        }
                    } else {
                        if (!bingo.isNullEmpty(curId)) {
                            nodes.push(next); //添加node和end节点
                            if (_isEndNode(next)) {
                                ids = bingo.removeArrayItem(curId, ids);
                                curId = '';
                            }
                        }
                    }
                } while ((next = next.nextSibling) && ids.length > 0);
            } // end next
            return nodes;
        };

        var _getRemoveData = function (backupDatas, datas) {
            //backupDatas与datas比较， 提取删除数据

            return bingo.linq(backupDatas).where(function () {
                return bingo.inArray(this.datas, datas) < 0;
            }).toArray();
        }, _removeByBackupData = function (backupDatas, removeDatas) {
            //从backupDatas删除removeDatas里的数据

            return bingo.linq(backupDatas).where(function () {
                return bingo.inArray(this, removeDatas) < 0;
            }).toArray();
        }, _getBackupIds = function (backupDatas) {
            //返回backupDatas里的所有ID
            return bingo.linq(backupDatas).select('id').toArray()
        }, _getNewData = function (backupDatas, datas) {
            //backupDatas与datas比较， 提取新数据

            return bingo.linq(datas).where(function (item) {
                return !bingo.linq(backupDatas).where(function () {
                    return this.datas == item;
                }).contain();
            }).toArray();
        }, _syncNodes = function (contentNode, backupDatas, datas, itemName) {
            //dom的顺序与数据的顺序同步, 可以优化， 现在简单现实

            //新的backupDatas
            var _newBackupDatas = [];
            //newBackupDatas与datas顺序同步
            bingo.each(datas, function (item) {
                var d = bingo.linq(backupDatas).where(function () { return this.datas == item; }).first();
                if (d) _newBackupDatas.push(d);
            });

            //以上提取newBackupDatas数据对应该的nodes
            var next = contentNode.firstChild,
                nodes = [], curId = '';

            var headerNodes = [], footerNodes = [], role = 0;;
            if (next) {
                do {
                    var id = _getIdByNode(next);
                    if (!bingo.isNullEmpty(id)) {
                        curId = id;
                        role = 1;
                        nodes.push(next);
                    } else {
                        if (!bingo.isNullEmpty(curId)) {
                            nodes.push(next); //添加node和end节点
                            if (_isEndNode(next)) {
                                var d = bingo.linq(_newBackupDatas).where(function () { return this.id == curId; }).first();
                                d.jNode = $(nodes);

                                nodes = [];
                                curId = '';
                            }
                        } else {
                            if (role == 0)
                                headerNodes.push(next);
                            else
                                footerNodes.push(next);
                        }
                    }
                } while (next = next.nextSibling);
            } // end next


            //将提取的nodes重appendTo contentNode
            $(headerNodes).appendTo(contentNode);

            var count = _newBackupDatas.length;
            bingo.each(_newBackupDatas, function (item, index) {

                this.jNode.appendTo(contentNode);
                this.jNode = null;

                _resetWithData(this.withDatas, itemName, count, index);

            }); //end each

            $(footerNodes).appendTo(contentNode);

            //返回新的备份数据
            return _newBackupDatas;

        }, _resetWithData = function (withData, itemName, count, itemIndex) {
            //重置withData

            var obj = withData;
            obj[[itemName, 'index'].join('_')] = obj.$index = itemIndex;
            obj[[itemName, 'count'].join('_')] = obj.$count = count;
            obj[[itemName, 'first'].join('_')] = obj.$first = (itemIndex == 0);
            obj[[itemName, 'last'].join('_')] = obj.$last = (itemIndex == count - 1);
            var isOdd = (itemIndex % 2 == 0);//单
            obj[[itemName, 'odd'].join('_')] = obj.$odd = isOdd;
            obj[[itemName, 'even'].join('_')] = obj.$even = !isOdd;
        };

    })(); //end bg-render-sync

    bingo.module('test').controller('command', function () {

        bingo.action('renderSync', function ($view, $var) {
            window.$viewRenderSync = $view;

            $view.cNode = null;

            $view.onReady(function () {
                $view.$getNode().css('visibility', 'visible');

                

                //$($view.cNode).bind('DOMNodeInsertedIntoDocument', function () {
                //    console.log('DOMNodeInsertedIntoDocument', this, arguments);
                //});

                //console.log($view.cNode, $($view.cNode).size());
            });

            var ol = [{
                id: '111',
                text: 'text1'
            }, {
                id: '222',
                text: 'text2'
            }];

            var _list = $view.list = $var(bingo.clone(ol));

            $view.ccc = function (dom, item, index) {
                console.log(index, $(dom).text(), item);
                
            };

            $view.add = function () {
                var list = _list();
                var id = bingo.makeAutoId();
                list.push({
                    id: id,
                    text: 'text' + id
                });
                _list.$setChange();
            };

            $view.remove = function (item) {
                var list = _list();
                list = bingo.removeArrayItem(item, list);
                _list(list);
            };

            $view.up = function (item) {
                var list = _list();
                var index = bingo.inArray(item, list);
                if (index > 0) {
                    var t = list[index - 1];
                    list[index - 1] = item;
                    list[index] = t;
                }
                _list.$setChange();
            };

        }); //end action renderSync

    }); //end controller

})();

$(function () {
    //测试IE9以上， 可以通过
    $(document.documentElement).bind('DOMNodeRemoved', function (e) {
        var node = this, target = e.target;
        setTimeout(function () {
            var parentNode = target ? target.parentNode : null;
            //console.log('DOMNodeRemoved', node, target, parentNode);
            if (!parentNode) {
                console.log('DOMNodeRemoved', target);
            }
        });
    });
});
