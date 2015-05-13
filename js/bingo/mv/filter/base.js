
(function (bingo) {
    //version 1.1.0
    "use strict";

    ////支持注入$view与node
    //bingo.filter('eq', function ($view, node) {
    //    return function (value, para) {
    //        return value == para;
    //    };
    //});

    bingo.filter('eq', function () {
        return function (value, para) {
            return value == para;
        };
    });

    bingo.filter('neq', function () {
        return function (value, para) {
            return value != para;
        };
    });

    bingo.filter('not', function () {
        return function (value, para) {
            return !value;
        };
    });

    bingo.filter('gt', function () {
        return function (value, para) {
            return value > para;
        };
    });

    bingo.filter('gte', function () {
        return function (value, para) {
            return value >= para;
        };
    });

    bingo.filter('lt', function () {
        return function (value, para) {
            return value < para;
        };
    });

    bingo.filter('lte', function () {
        return function (value, para) {
            return value <= para;
        };
    });

    bingo.filter('len', function () {
        return function (value, para) {
            return value ? bingo.isUndefined(value.length) ? 0 : value.length : 0;
        };
    });

    bingo.filter('text', function () {
        return function (value, para) {
            return bingo.htmlEncode(value);
        };
    });

    //sw:[0, 'active', ''] //true?'active':''
    bingo.filter('sw', function () {
        return function (value, para) {

            var len = para.length;
            var hasElse = (len % 2) == 1; //如果单数, 有else值
            var elseVal = hasElse ? para[len - 1] : '';
            hasElse && (len--);

            //sw:[1, '男', 2, '女', '保密'], '保密'为else值
            var r = null, ok = false, item;
            for (var i = 0; i < len; i += 2) {
                item = para[i];
                if (value == item) {
                    r = para[i + 1], ok = true;
                    break;
                }
            }
            return ok ? r : elseVal;
        };
    });

})(bingo);
