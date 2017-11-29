---
layout: post
title: 过滤器，拦截器，监听器
categories: [理解编程]
tags: [过滤器,拦截器,监听器]
status: publish
type: post
published: true
author: blackfox
permalink: /20171127/filter-interceptor-lisener.html
keyword: 过滤器,拦截器,监听器
desc: 过滤器,拦截器,监听器之间的区别
---

&emsp;&emsp; 学习 Java Web 编程之后，一直对过滤器，拦截器，监听器这三个概念很纠结，感觉他们很显然是有区别的，但是又说不出有多明显的区别，
尤其是过滤器和拦截器，在很多时候几乎可以相互替代的解决方案。花了几个时间查找资料和思考，得出一些理解，记录下来。

过滤器(Filter)
=====
&emsp;&emsp; 过滤是 Servlet 容器中的一个组件，主要负责处理请求和响应，具体来说是负责对请求(HttpServletRequest)进行预处理，
以及对响应（HttpServletResponse）进行后处理，所以它是依赖 Servlet 容器的。

通过 Filter 可以实现以下操作：
* 在 HttpServletRequest 到达 Servlet 之前，拦截客户的 HttpServletRequest， 并可以根据需要修改 HttpServletRequest 的头信息
和数据（比如参数）
* 在 HttpServletResponse 到达客户端之前，拦截 HttpServletResponse，并可以根据需要修改 HttpServletResponse 的
头和数据

多个过滤器之间是链式调用的，过滤器 A 会把处理后的 HttpServletRequest，HttpServletResponse 传递给过滤器 B, 过滤器 B
又会把过滤的结果传给过滤器 C，这样依次执行下去。

过滤器随 web 应用启动而启动的，只初始化一次，以后就可以拦截相关请求，当 web 应用停止的时候它销毁。

拦截器(Interceptor)
=====
&emsp;&emsp; 拦截器是 Spring 中的概念，也许是 Spring 开发团队觉得 Servlet 的过滤器的定义不够明确，因为它其实
既可以过滤，也是可以拦截的。所以他们就定义了拦截器(Interceptor), 拦截器的功能其实跟过滤器差不多，
只不过它的定义更明确清晰了：就是为了拦截操作的。由于它不受限于
Servlet 容器，所以它更灵活一些，功能更强大，使用也更方便。比如一个拦截器可以一次拦截多条 url 规则，
而一个过滤器只能拦截一条规则，如果想要拦截多条规则，比如 admin/user/* 和 admin/order/* 就必须添加两个过滤器。

拦截器的典型应用就是 AOP，将某些功能以独立切面的形式插入现有的业务流程当中，能够大大减少 Action 的代码。

监听器(Lisener)
====
&emsp;&emsp; 监听在很多模式下用到，监听器更是以后相比过滤器，拦截器来说，常见的多的概念，我们在 Javascrpit 中和 NodeJS
中是经常提到。监听器是采用观察者模式实现的，和过滤器和拦截器可以拦截或者中断流程不同的是，监听器只是负责监听，收集信息(事件)，
但是监听器并不会干预这个流程，因为有些事件都是异步监听的，比如消息订阅这些，你只能收到"消息"，根本无法干涉业务流程的进程。

Filter 和 Interceptor 的区别
======
* Filter 是基于函数回调的，而Interceptor则是基于Java反射的。
* Filter 依赖于Servlet容器，而Interceptor不依赖于Servlet容器。
* Filter 对几乎所有的请求起作用，而Interceptor只能对action请求起作用。
* Interceptor 可以访问 Action 的上下文，值栈里的对象，而Filter不能。
* 在 action 的生命周期里，Interceptor可以被多次调用，而Filter只能在容器初始化时调用一次。

> Filter 和 Interceptor 的执行顺序： <br />
过滤前-拦截前-action执行-拦截后-过滤后

使用场景
=====
* 过滤器（Filter）：当你有一堆东西的时候，你只希望选择符合你要求的某一些东西。定义这些要求的工具，就是过滤器。
比如过滤非法的 url，过滤敏感词，设置字符编码等。
* 拦截器（Interceptor）：在一个流程正在进行的时候，你希望干预它的进展，甚至终止它进行，这是拦截器做的事情。
比如判断登录，验证权限，记录日志等
* 监听器（Listener）：当一个事件发生的时候，你希望获得这个事件发生的详细信息，而并不想干预这个事件本身的进程，这就要用到监听器。
比如一些联动的操作，比如当注册一个用户的时候自动给他生成一个店铺，或者删除一篇文章之后自动删除它的图片这些。

__本质上说，个人认为过滤器和拦截器没有什么区别，因为过滤器的定义里面并没有说不能终止流程，
它完全可以像拦截器一样终止操作，只是在语义上，拦截器更适合做这件事情。__

__THE END__