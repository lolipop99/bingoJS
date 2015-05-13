//todo:
(function (bingo) {
    //version 1.1.0
    "use strict";

    var _isModel_ = 'isModel1212';
    bingo.isModel = function (p) { return p && p._isModel_ == _isModel_; };
    bingo.modelOf = function (p) { p = bingo.variableOf(p); return bingo.isModel(p) ? p.toObject() : p; };

    var _toObject = function (obj) {
        var o = obj || {}, val;
        bingo.eachProp(this, function (item, n) {
            if (bingo.isVariable(item)) {
                val = item();
                if (bingo.isVariable(o[n]))
                    o[n](val);
                else
                    o[n] = val;
            }
        });
        return o;

    }, _formObject = function (obj) {
        if (obj) {
            bingo.eachProp(obj, bingo.proxy(this, function (item, n) {
                item = this[n];
                if (bingo.isVariable(item)) {
                    item(obj[n]);
                }
            }));
        }
        return this;
    };
    bingo.model = function (p, view) {
        p = bingo.modelOf(p);
        var o = {}, item;
        bingo.eachProp(p, function (item, n) {
            o[n] = bingo.variable(item, o, view);
        });

        o._isModel_ = _isModel_;
        o.toObject = _toObject;
        o.formObject = _formObject;
        return o;
    };

})(bingo);
