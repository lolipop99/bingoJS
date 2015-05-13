
var fnDef = function ($view, $node, $withData) {
    with ($view) {
        with ($withData) {
            return bingo.proxy($node, function (event) {
                try {
                } catch (e) {
                    if (bingo.isDebug) bingo.trace(e);
                }
            });
        }
    }
};

(function () {
    //version 1.0.1
    "use strict";

    bingo.command('hello', function () {
        return {
            priority: 10,
            tmpl: '<div>bbc{{text}}<div bg-include></div></div>',
            replace: true,
            include: true,
            view: false,
            compileChild: true,
            compilePre: null,
            controller: function ($view) { $view.text = 'test'; },
            link: null,
            compile: ['$view', '$tmpl', '$node', '$attr', function ($view, $tmpl, $node, $attr) {
                //$view.text = 'test';
                //$node.html('ok');
            }]
        };
    });

    window.ctrl1 = function ($view) {
        console.log('ctrl1');
        $view.text = 'ctrl1';

        $view.on('ready', function () {
            //aCls.NewObject().disposeByOther($view);
        });

        $view.onDispose(function () {
            console.log('dispose');
        });
    };


})();

var aCls = bingo.Class(function () {

    this.Prop({
        vv:1
    });

    this.Define({
        _a: 1,
        datas: { a: 1, b: 1 },
        fn: function () {
            this._a = 1;
        }
    });

    this.Initialization(function (p) {
        this._a = 22 + p;
    });

});

var bCls = bingo.Class(aCls, function () {

    this.Define({
        //bbbb
        _b: 1,
        //dddd
        dataB: { bbb: 1 },
        //testt
        fnB: function () {
        }
    });

    this.Initialization(function (p) {
        this.base(p);
        this._bb = 22 + p;
    });

});


var cCls = bingo.Class(bCls, function () {
    this.Define({
        _c: 1,
        dataC: { cccc: 1 },
        fnC: function () {
        }
    });

    this.Initialization(function (p) {
        this.base(p);
        this._ccc = 22 + p;
    });
});

var a = aCls.NewObject(1),
    b = bCls.NewObject(2),
    c = cCls.NewObject(3);

c.pp()

//var list = bingo.linq([1, 2]).where(function (item) { return item; }).first();

//bingo.proxy(c, function () {
//    //this.data
//});

//bingo.variable.extend({
//    val:bingo.variable.simple(''),
//    test: function () { return this.value; }
//})

var v = bingo.variable('1111')
    .$get(function () { return this.value; })
    //.$set(function (value) {
    //    this.value = value + "AA";
    //})
    .$subs(function (value) { console.log('$subs', value, this.$get()); })
    .$assign(function (value) { console.log('$assign', value, this.$get()); });
var v1 =v.clone()
console.log(v(), v1());


var obj = { v: v };

bingo.Class.Define({
    $base: aCls,
    $prop: {
        vT: 1
    },
    $init: function () {
    },
    $dispose: function () {
    },
    $static: {
        a: 1,
        fn: function () { }
    },
    fn: function () { }
});
