﻿//todo:
(function (bingo) {
    //version 1.1.0
    "use strict";

    var _isModel_ = 'isModel1212';
    bingo.isModel = function (p) {
        /// <summary>
        /// 是否model
        /// </summary>
        /// <param name="p"></param>
        return p && p._isModel_ == _isModel_;
    };
    bingo.modelOf = function (p) {
        /// <summary>
        /// 将model转成普通object
        /// </summary>
        /// <param name="p">可以任何参数</param>
        p = bingo.variableOf(p); return bingo.isModel(p) ? p.toObject() : p;
    };

    var _toObject = function (obj) {
        var o = obj || {}, val;
        bingo.eachProp(this, function (item, n) {
            if (bingo.isVariable(o[n]))
                o[n](item);
            else if (n != '_isModel_' && n != 'toObject' && n != 'fromObject' && n != '_p_')
                o[n] = bingo.variableOf(item);
        });
        return o;

    }, _fromObject = function (obj, extend) {
        if (obj) {
            bingo.eachProp(obj, bingo.proxy(this, function (item, n) {
                if (n in this) {
                    if (bingo.isVariable(this[n])) {
                        this[n](item);
                    } else
                        this[n] = bingo.variableOf(item);
                } else if (extend) {
                    this[n] = bingo.variable(item);
                }
            }));
        }
        return this;
    }, _toDefault = function () {
        this.fromObject(this._p_);
    };
    bingo.model = function (p, view) {
        /// <summary>
        /// 定义model
        /// </summary>
        /// <param name="p">可以model或object</param>
        /// <param name="view"></param>

        p = bingo.modelOf(p);
        var o = {}, item;
        bingo.eachProp(p, function (item, n) {
            o[n] = bingo.variable(item, o, view);
        });

        intellisenseAnnotate(o, p);

        o._isModel_ = _isModel_;
        o._p_ = p;
        o.toObject = _toObject;
        o.fromObject = _fromObject;
        o.toDefault = _toDefault;
        return o;
    };

})(bingo);
