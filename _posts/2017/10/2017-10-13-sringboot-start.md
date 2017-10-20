---
layout: post
title: SpringBoot 的三种启动方式
categories: [SpringBoot]
tags: [spring-boot]
status: publish
type: post
published: true
author: blackfox
permalink: 20171013/springboot-start.html 
keyword: SpringBoot
desc: spring-boot 项目启动方式，spring-boot:run 带参数启动
---

Spring Boot 是什么
=======
Spring Boot是由Pivotal团队提供的全新框架，其设计目的是用来简化新Spring应用的初始搭建以及开发过程。
该框架使用了特定的方式来进行配置，从而使开发人员不再需要定义样板化的配置。

我简单学习了一下 Spring Boot 的感触就是：简单，方便，快速。

使用 Spring Boot 只需要简单的几行配置，就可以快速搭建一套web项目，或者构建一套微服务。从此抛弃繁杂的 xml 配置文档，各种注解扫描，
,各种数据库链接，Spring 事物配置，各种日志配置... 这些通通可以省略，极大提高开发效率，让你有更多的时间装逼和陪女朋友逛街。

哦，一说就停不下来，忘记今天的主题是讲 SpringBoot项目的启动方式了。

Spring Boot 的三种启动方式
=======
Spring Boot 的另一优势就是她的项目启动也是非常简单，她本身内置了 web 服务器插件，默认是 tomcat 的，不过你也可以很轻易的把他改成 jetty.
目前来说Spring Boot 有三种比较方便的启动方式，下面我们分别来介绍一下。

### 1. 直接运行 Application 类的 main 方法
<img class="img-view" data-src="/images/2017/10/spring-boot-start-1.png" src="/images/1px.png" />

### 2. 打包之后使用 java -jar 运行
首先将项目打包，执行

```bash
mvn clean package -Dmaven.test.skip,
```
然后运行打包的后的 jar 文件

```bash
java -jar xxxx.jar > error.log &
```
也可以传入运行参数，比如需要加载不同的配置文档，在生产环境你可以这样运行

```bash
java -jar xxx.jar --spring.profiles.active=prod > error.log &
```

### 3. 使用 mvn spring-boot:run 命令运行
在项目的根目录运行

```bash 
mvn spring-boot:run 
```
这里也可以传入运行参数：

```bash
mvn spring-boot:run -Drun.arguments="--spring.profiles.active=prod" > error.log &
```

还有就是，我在线上环境的测试中发现使用 java -jar 运行的项目不是很稳定，经常莫名奇妙的挂掉了。用 mvn spring-boot:run 却没有发现这个情况
目前还不知道什么原因，也许是参数问题。

另外，我在码云提交了一个 spring-boot-demo 项目，里面整合了一个快速开发后台的框架，有兴趣的同学可以去参考一下。

<img class="img-view" data-src="/images/2017/10/spring-boot-start-2.png" src="/images/1px.png" />

### 预览地址：[http://demo.r9it.com](http://demo.r9it.com)

### git 地址：[https://gitee.com/blackfox/spring-boot-demo](https://gitee.com/blackfox/spring-boot-demo)


<strong>《完》</strong>





