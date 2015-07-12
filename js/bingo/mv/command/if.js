(function (bingo) {

    bingo.command('bg-if', function () {
        return {
            compileChild: false,
            compile: ['$attr', '$node', '$compile', function ($attr, $node, $compile) {
                /// <param name="$compile" value="function(){return bingo.compile();}"></param>
                /// <param name="$attr" value="bingo.view.viewnodeAttrClass()"></param>
                /// <param name="$node" value="$([])"></param>

                var html = $node.html();

                var _set = function (value) {
                    $node.html('');
                    if (value) {
                        $node.show();
                        $compile().fromHtml(html).appendTo($node).compile();
                    } else
                        $node.hide();
                };

                $attr.$subsResults(function (newValue) {
                    _set(newValue);
                });

                $attr.$initResults(function (value) {
                    _set(value);
                });

            }]
        };
    });

})(bingo);
