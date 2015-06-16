参考文档：[http://bingojs.mydoc.io/](http://bingojs.mydoc.io/)

库包下载：[https://git.oschina.net/bingoJS/bingoJS/blob/master/bingo.zip?dir=0&filepath=bingo.zip](https://git.oschina.net/bingoJS/bingoJS/blob/master/bingo.zip)

三种开发规划方式(开发模式)Demo:[https://git.oschina.net/bingoJS/bingoJS/tree/master/demo](https://git.oschina.net/bingoJS/bingoJS/tree/master/demo)

更新记录:[http://git.oschina.net/bingoJS/bingoJS/blob/master/history.md](http://git.oschina.net/bingoJS/bingoJS/blob/master/history.md)

QQ交流群:172982805


####1、关于bingoJS
bingoJS是一个前端MV*开发框架， 提供了前端框架所需基础要素，目前已经支持模块化开发、按需动态加载、完善的双向绑定、依赖注入等；让你在开发只关注业务代码的实现。


####2、提供MV*开发模式
框架提供前端MV和前端MVC两种开发方式，可以实现轻APP和重APP前端搭建。在轻业务的场景里我们可以使用前端MV实现html和JS分离开发，这样让APP管理会变更清晰更简单；而在重业务的场景里我们需要更进一步细分和规划代码，这时就要使用前端MVC方式开发了，还可能要用到service对数据与业务进一步分离。
`总之前端MV*只是一个代码组织和规划方式，能让以后代码管理（迭代，重构）方便`

MV开发模式大概分工：
- M层：数据业务层，主要负责与后端数据互交， 提供常用方法，处理常用数据（过滤，组装）业务逻辑，这里只需要用到action；
- V层：主要处理html以双向绑定语法，跟action数据连接


MVC开发模式大概分工：
- M层：数据业务层，主要负责与后端数据互交， 提供常用方法，处理常用数据（过滤，组装）业务逻辑；
- C层：控制器, 主要管理action跟V层一一对应， 根据V层显示处理相应的数据
- V层：主要处理html以双向绑定语法，跟C层的action数据连接

![MVC关系](https://static.oschina.net/uploads/img/201505/15225353_hp0I.png "MVC关系")

####3、双向绑定(数据绑定)
如果MVC是一种开发模式，可以对开发规范和思维的统一，对前端工程交付变得更容易。那双向绑定就是一种手段，可以让html与JS分离开来，而不用直接操作dom层，让JS专心处理业务代码（组装显示业务数据）。总之双向绑定只是一种手段，直接操作DOM也是一种手段，在合适场景使用合适手段。

####4、按需加载
- 在这里，框架是认为前端资源与后端代码是可以完全分离，即restful+前端
- 首先统一前端开发动态加载的资源是什么，本框架指js文件和view模板资源（css有些人认为是，但它动态加载严重影响体验）
- 框架所有动态加载资源都是通过route（路由）进行前端资源url design
- 载模块提供一种最单纯加载机制，就是只负责加载（route转发后的地址加载资源）， 因此是兼容所有现有的JS库，如果要合并打包也就最低限度设置即可。

####5、兼容性
在JS方面可以说完全兼容到IE6；在dom管理方除了核心编译部分用了原生外，其它都几乎依赖jQuery写的，所以取决于jQuery版本的兼容;