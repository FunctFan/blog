---
layout: post
title: SpringBoot dubbo 整合
categories: [springBoot]
tags: [spring-boot]
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

第三方的组件虽然可以正常暴露和消费服务，但是 issue 说会有导致事务注解失效的情况

<strong>《完》</strong>





