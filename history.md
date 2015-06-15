
#### 1.1.0615
1.添加ajaxClass.holdServer
```script
bingo.ajax.ajaxClass.holdServer = function (ajax, response, isSuccess, xhr) {
    //isSuccess: true or false
    //response 可以改变response内容
    return [response, isSuccess, xhr];
}

```

2.处理bingo多版本共存问题, 以下这种方式处理共存问题
(function(bingo){

    bingo.trim('');

})(bingoV1);//bingo或bingoV1或bingoV1_1两种，注意根据版本引用


3.添加支持script标签支持，但只用做模板用，和replace=true本合使用
```html
<script type="text/html" bg-miniTable>
    <columns>
        <item formator="dddd">aaa</item>
        <item formator="dddd" name="bbb" text="aaa">bbb</item>
    </columns>
</script>
```

4. 强化bingo.model
5. 解决ajax请求error时，$view.onReady事件没有发出问题
6. 优化observer
7. 添加事件工
8. 添加clearObject对子object.$clearAuto支持
9. 优化bingo.compile, 并onCompilePre和onCompiled事件传送参数为一个jQuery对象
10. 增强模板指令bg-route与location, location: 添加views方法，修改frame为ownerNode, 将bg-name统一改为bg-name, 将params修改为queryParams), 添加close方法,onCloseBefore和onClosed事件



#### 1.1.0604
1.添加module.action支持即支持下面三种action方式
```script
//定义action1
var action1 = bingo.action(function($view){
});

bingo.module('demo', function(){

    //定义demo/index action
    bingo.action('index', function($view){
    });

    bingo.controller('user', function(){

        //定义demo/user/list action
        bingo.action('list', function($view){
     
        });
    
        //定义demo/user/info action
        bingo.action('info', function($view){
     
        });
    
    });

});

```
