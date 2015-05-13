
bingo.command('bg-text', function () {

    return ['$attr', '$node', function ($attr, $node) {
        /// <param name="$attr" value="bingo.view.viewnodeAttrClass()"></param>
        /// <param name="$node" value="$([])"></param>
        
        var _set = function (val) {
            $node.text(bingo.toStr(val));
        };

        $attr.$subsResults(function (newValue) {
            _set(newValue);
        });

        $attr.$initResults(function (value) {
            _set(value);
        });

    }];
});
