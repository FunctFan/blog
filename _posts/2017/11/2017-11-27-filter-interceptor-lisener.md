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
尤其是过滤器和拦截器，在很多时候几乎可以相互替代的解决方案。花了一个下午的时间查找资料和思考，得出一些理解，记录下来。

过滤器
=====
&emsp;&emsp; 过滤是 Servlet 容器中的一个组件，主要负责处理请求和响应，具体来说是负责对请求(HttpServletRequest)进行预处理，
以及对响应（HttpServletResponse）进行后处理。所以它是依赖与 Servlet 容器的。
__THE END__