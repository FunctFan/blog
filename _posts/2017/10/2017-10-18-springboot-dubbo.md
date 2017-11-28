---
layout: post
title: SpringBoot dubbo 整合
categories: [JAVA]
tags: [spring-boot, dubbo]
status: publish
type: post
published: true
author: blackfox
permalink: 20171018/springboot-dubbo.html 
keyword: SpringBoot
desc: springBoot dubbo整合, SpringBoot dubbo 接入
---

最近公司在考虑公司的java项目的分布式架构的技术选型问题，初步讨论之后选择了 SpringCloud，但是在对 SpringCloud 进行一些的组件测试之后发现
一个问题，就是 SpringCloud 的eureka分布式服务在调用的时候还是有些不方便的地方，她主要是采用 http 协议实现 restful API，这样在调用的时候
一个是效率不高，第二是参数的序列化是个问题，经测试发现她目前对远程服务的调用只能接收一个复杂类型的参数，也就是第一个参数可以是复杂类型
的参数，其他参数都要是基本类型的，那就意味着，如果想要传入多个复杂类型参数，比如传入一个 User 类型的和一个 Order 类型，就必须自己手动将
参数打包成一个复杂的参数。这样无端为编码带来了很多额外的工作量。因此架构组在再三考虑之下决定用 dubbo 替换 SpringCloud 
自带的分布式服务框架。

为什么用 dubbo
========
dubbo 是阿里巴巴开源的一款非常优秀的分布式服务框架，致力于提供高性能和透明化的RPC远程服务调用方案，以及SOA服务治理方案。
我们可以非常容易地通过Dubbo来构建分布式服务，并根据自己实际业务应用场景来选择合适的集群容错模式，而且她是 API 零入侵的。
最关键是她经过天猫商城等多个在线的大型项目的实战，每天30亿次的 API 调用，证明她的性能是可靠的，这一点对于技术选型尤其重要，至少我们知道
她一定能够解决我们的问题，因为有实战案例摆在那呢。
想对 dubbo 的架构和使用有进一步的了解，不妨去阅读官方的文档 [dubbo-user-book](https://dubbo.gitbooks.io/dubbo-user-book/)

SpringBoot 整合 dubbo
=======
既然技术选型已经确定，那么接下来就是如何把 dubbo 整合到 SpringBoot中了。 dubbo 官方也开发了一个 [spring-boot-starter-dubbo](https://github.com/alibaba/spring-boot-starter-dubbo)
但是经过我们验证之后发现至少目前都是不可行的。Provider 都可以正常运行，服务可以正常暴露出去，在dubbo-admin 后台上面也是可以发现服务的。
但是在运行 Consumer 之后都出现问题了，以官方的为例，它是通过在Spring Boot Application的上添加 @EnableDubboConfiguration,
表示要开启dubbo功能. 然后通过 @DubboConsumer 注入需要使用的 interface. 我们在 Consuomer 模块的控制器中 使用了 @DubboConsumer 注解来
创建服务实例，结果发现启动 SpringBoot 之后，发现 Controller 的服务无法访问。在调试源码之后我们发现原来是 spring-boot-starter-dubbo 在
扫描 @DubboConsumer 创建实例的时候导致 SpringBoot 无法创建 Controller 的实例。

接下来我们就分别说说这 spring-boot-starter-dubbo 和 xml 这两种接入方式


spring-boot-starter-dubbo 接入方式
=========

### __1. 安装 spring-boot-start-dubbo 到本地仓库__

```bash
## 克隆代码
git clone git@github.com:teaey/spring-boot-starter-dubbo.git

## 编译安装
cd spring-boot-starter-dubbo
mvn clean install
```

### __2. 修改 pom.xml 文件，加入依赖__

```xml

<!-- spring boot dubbo starter -->
<dependency>
	<groupId>io.dubbo.springboot</groupId>
	<artifactId>spring-boot-starter-dubbo</artifactId>
	<version>1.0.0</version>
</dependency>
```


### __3. 发布服务__

先修改 application.properties 文件，设置服务暴露参数

```bash
spring.dubbo.module=provider
spring.dubbo.application.name=provider
spring.dubbo.registry.address=zookeeper://127.0.0.1:2181
spring.dubbo.protocol.name=dubbo
spring.dubbo.protocol.port=20884    
spring.dubbo.scan=com.springboot.dubbo.provider.service
```

在 Spring Application 的 application.properties 中添加 spring.dubbo.scan 即可支持Dubbo服务发布，其中scan表示要扫描的package目录。


__通过注解暴露服务__

```java
import com.alibaba.dubbo.config.annotation.Service;
import com.springboot.dubbo.service.DemoService;

@Service(version = "1.0.0")
public class DemoServiceImpl implements DemoService {

	@Override
	public String hello(String name) {
		return "From Spring-Boot-Starter Provider, Hello "+name+", Fuck it whatever!";
	}
}
```

启动 Provider 项目的 springBoot 应用可以成功将服务发布了。

### __4. 消费服务__

首先同样要在消费项目的 pom.xml 引入 spring-boot-dubbo-starter

然后在需要调用服务的类(Controller) 中使用　@Reference 注解来创建 Bean

```java
package com.springboot.dubbo.consumer.controller;

import com.alibaba.dubbo.config.annotation.Reference;
import com.springboot.dubbo.service.DemoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

	@Reference(version = "1.0.0")
	private DemoService demoService;

	@GetMapping(value = "/hello")
	public String index() {
		return demoService.hello("Xiao Ming");
	}
}
```

启动 Consumer 项目的 springBoot 访问 http://localhost:8001/hello　看看服务是否能正常访问


使用原生的 xml 方式接入
======

分别创建２个　SpringBoot 项目　XmlProvider, XmlConsumer. 分别加入　dubbo 和 zookeeper 依赖

```xml
<dependency>
	<groupId>com.alibaba</groupId>
	<artifactId>dubbo</artifactId>
	<version>2.5.6</version>
</dependency>
<dependency>
	<groupId>org.apache.zookeeper</groupId>
	<artifactId>zookeeper</artifactId>
	<version>3.4.9</version>
</dependency>
<dependency>
	<groupId>com.101tec</groupId>
	<artifactId>zkclient</artifactId>
	<version>0.2</version>
</dependency>
```

### __1. 发布服务__

在　XmlProvider 项目的　resource 目录下新建　dubbo-demo-provider.xml, 配置服务暴露

```xml
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
	http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd">

    <!-- 提供方应用信息，用于计算依赖关系 -->
    <dubbo:application name="demo-provider-xml"/>

    <!-- 使用multicast广播注册中心暴露服务地址 -->
    <dubbo:registry address="zookeeper://127.0.0.1:2181"/>

    <!-- 用dubbo协议在20880端口暴露服务 -->
    <dubbo:protocol name="dubbo" port="20885"/>
    
    <!-- demo service -->
    <dubbo:service version="1.0.1" interface="com.springboot.dubbo.service.DemoService" ref="demoService"/>
    
    <!-- user service -->
    <dubbo:service version="1.0.1" interface="com.springboot.dubbo.service.UserService" ref="userService"/>
    
    <!-- order service -->
    <dubbo:service version="1.0.1" interface="com.springboot.dubbo.service.OrderService" ref="orderService"/>

</beans>
```

__这里尤其需要注意，服务的暴露需要一个一个暴露，不要使用扫描服务包路径的形式一次性暴露__

```html
 <dubbo:annotation package="com.springboot.dubbo.service" />
```
__这样在暴露多个服务的时候，会导致 @Transactional 注解失效__

而且比较坑的是，启动的时候并不会报错，但是你在 dubbo 的后台查看服务的
的时候会发现服务的暴露地址有点奇怪，正常的暴露地址应该是这样的：

<img class="img-view" data-src="/images/2017/11/springboot-dubbo-2.png" src="/images/1px.png" />

而使用扫描包路径暴露的服务却是这样的：

<img class="img-view" data-src="/images/2017/11/springboot-dubbo-1.png" src="/images/1px.png" />

而且所有的服务都是一样的，没有什么区分，返回的都是一个 SpringProxy 代理对象，在调用的时候就出问题的了。

在　SpringBoot 应用入口程序　XmlProviderApplication 导入　dubbo-demo-provider.xml

```java
package com.springboot.dubbo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ImportResource;

@SpringBootApplication
@ImportResource(value = "classpath:dubbo-demo-provider.xml")
public class XmlproviderApplication {

	public static void main(String[] args) {
		SpringApplication.run(XmlproviderApplication.class, args);
	}
}

```
__在服务暴露上也是不相同的，使用的是 Spring 的 @Service 注解，而不是 Dubbo 的 @Service.__

```java 
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * @author yangjian
 * @since 17-10-20.
 */
@Service("userService")
@Transactional(rollbackFor = Exception.class)
public class UserServiceImpl implements UserService {}
```

启动 SpringBoot 应用，服务就可以成功发布了。

### __2. 消费服务__

在 XmlConsumer 项目的 resource 目录下新建　dubbo-demo-consumer.xml


```xml

<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
	http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd">

    <!-- 消费方应用名，用于计算依赖关系，不是匹配条件，不要与提供方一样 -->
    <dubbo:application name="demo-consumer-xml"/>

    <!-- 使用multicast广播注册中心暴露发现服务地址 -->
    <dubbo:registry address="zookeeper://127.0.0.1:2181"/>
    <!-- 要扫描的包路径　使用注解方式创建服务 -->
    <dubbo:annotation package="com.springboot.dubbo.consumer.controller" />
    

</beans>
```

在应用启动的时候加载 dubbo-demo-consumer.xml 

```java
package com.springboot.dubbo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ImportResource;

@SpringBootApplication
@ImportResource(value = "classpath:dubbo-demo-consumer.xml")
public class XmlconsumerApplication {

	public static void main(String[] args) {
		SpringApplication.run(XmlconsumerApplication.class, args);
	}
}
```

使用也跟第一种方法一样，在需要调用远程的服务的地方使用 @Reference 注解创建服务就好了


__总结：__

1. 第一种方式比较简单，方便，可以完全摆脱 xml 文档，但是兼容性有待考证，可能跟其他 SpringBoot 组件有冲突。

2. 第二种方式稍微麻烦一些，需要配置 xml 文档，但是由于是采用原生的方式接入，兼容性会比较好些，可以放心使用。

3. 两种方式的服务发布和消费都是相当方便的，通过注解就可以轻松解决，而且效率要比 SpringCloud 官方提供的分布式服务组件高的多。


项目源码
======
[https://gitee.com/blackfox/springboot-dubbo](https://gitee.com/blackfox/springboot-dubbo)

<strong>《完》</strong>





