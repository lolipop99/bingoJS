
(function (bingo) {

    //bg-html="'<br />'" | bg-html="datas.html"
    bingo.command('bg-html', function () {
        return ['$attr', '$node', function ($attr, $node) {
            /// <param name="$attr" value="bingo.view.viewnodeAttrClass()"></param>
            /// <param name="$node" value="$([])"></param>
            var _set = function (val) {
                $node.html(bingo.toStr(val));
            };
            $attr.$subsResults(function (newValue) {
                _set(newValue);
            });
            $attr.$initResults(function (value) {
                _set(value);
            });

        }];
    });

})(bingo);
