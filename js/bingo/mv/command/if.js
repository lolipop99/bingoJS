
bingo.command('bg-if', function () {
    return {
        compileChild: false,
        compile: ['$attr', '$node', '$compile', function($attr, $node, $compile) {
            /// <param name="$compile" value="function(){return bingo.compile();}"></param>
            /// <param name="$attr" value="bingo.view.viewnodeAttrClass()"></param>
            /// <param name="$node" value="$([])"></param>

            var jo = $($node);
            var html = jo.html();
            jo.html(''); jo = null;
            $attr.$subsResults(function (newValue) {
                if (newValue) {
                    $node.show();
                    $compile().fromHtml(html).appendTo($node).compile();
                } else
                    $node.html('').hide();
                //console.log('if ', newValue, html);
            });

        }]
    };
});
