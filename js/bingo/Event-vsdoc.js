
(function (bingo) {

    bingo.Event = function (owner) {
        /// <summary>
        /// 创建事件
        /// </summary>
        /// <param name="owner"></param>

        var fn = function (callback) {
            /// <summary>
            /// 绑定事件
            /// </summary>
            /// <param name="callback">可选, 绑定事件</param>
            callback && fn.on(callback);
            callback && intellisense.setCallContext(callback, { thisArg: fn._this() });
            return arguments.length == 0 ? fn : this;
        };

        fn.__bg_isEvent__ = true;
        fn.__eventList__ = eList || [];
        bingo.extend(fn, _eventDefine);
        fn.owner(owner);

        return fn;
    };
    bingo.isEvent = function (ev) {
        /// <summary>
        /// 是否Event
        /// </summary>
        /// <param name="ev"></param>
        return ev && ev.__bg_isEvent__ === true;
    };

    var _eventDefine = {
        _end: false,
        _endArg: undefined,
        //设置或获取owner
        owner: function (owner) {
            if (arguments.length == 0)
                return this.__owner__;
            else {
                this.__owner__ = owner;
                return this;
            }
        },
        _this: function () { return this.owner() || this; },
        on: function (callback) {
            /// <summary>
            /// 绑定事件
            /// </summary>
            /// <param name="callback" type="function()"></param>
            callback && intellisense.setCallContext(callback, { thisArg: this._this() });
            return this;
        },
        one: function (callback) {
            /// <summary>
            /// 绑定事件
            /// </summary>
            /// <param name="callback" type="function()"></param>
            callback && intellisense.setCallContext(callback, { thisArg: this._this() });
            return this;
        },
        off: function (callback) {
            /// <summary>
            /// 解除绑定事件
            /// </summary>
            /// <param name="callback">可选, 默认清除所有事件callback</param>
            return this;
        },
        end: function (args) {
            /// <summary>
            /// end([arg1, arg2, ....]), 结束事件, 先解除绑定事件, 以后绑定事件马上自动确发, 用于ready之类的场景
            /// </summary>
            /// <param name="args">可选, 传送参数, [arg1, arg2,...]</param>
            return this;
        },
        trigger: function () {
            /// <summary>
            /// 触发事件, 返回最后一个事件值, 事件返回false时, 中断事件
            /// trigger([arg1, arg2, ....])
            /// </summary>
            /// <returns value='{}'></returns>
        },
        triggerHandler: function () {
            /// <summary>
            /// 触发第一事件, 并返回值, var b = triggerHandler([arg1, arg2, ....])
            /// </summary>
            /// <returns value='{}'></returns>
        },
        clone: function (owner) {
            /// <summary>
            /// 复制
            /// </summary>
            /// <param name="owner">新的owner</param>
            return bingo.Event(owner || this.owner(), []);
        },
        //绑定事件数量
        size: function () { return 1; }
    };

})(bingo);
