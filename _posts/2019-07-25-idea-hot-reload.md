---
layout: post
title: idea 配置 SpringBoot 项目热启动
categories: [Java,SpringBoot]
tags: [spring-boot,热启动]
status: publish
type: post
published: true
author: blackfox
permalink: /20190725/idea-hot-reload.html
keyword: SpringBoot,idea 热启动
desc: idea 配置 SpringBoot 热启动
--- 

# 1、添加 spring-boot-devtools 依赖包

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <optional>true</optional>
</dependency>
```

# 2、修改 spring-boot-maven-plugin 插件

```xml
<plugin>
   <groupId>org.springframework.boot</groupId>
   <artifactId>spring-boot-maven-plugin</artifactId>
   <configuration>
       <fork>true</fork>
   </configuration>
</plugin>
```

# 3、关闭 thymeleaf 模板缓存功能

在 `application.properties` 文件中添加下面配置，不过你不用模板引擎的话，这一步跳过。

```properties
spring.thymeleaf.cache=false
```

如果是使用 mvn 插件启动，即使用 `mvn spring-boot:run` 命令启动，不管你是直接使用命令行还是在 idea 中添加（如下图所示）：

![](/images/1px.png){:data-src="http://blog.img.r9it.com/image-bd54230728b6923119020de44507c1ba.png" class="img-view"}

则已经可以正常使用热启动功能了。

但是如果你使用的是直接启动 `SpringBootAppication` 的 `main()` 方法的话，上述配置可能还无法实现热启动，以为我们上面的配置都是针对 maven 插件的。
idea 有自己的类加载机制，所以还需要继续添加额外的设置。

# 4、热启动失效解决方案

> 1、找到 Setting --> Compiler 设置（也可以快捷键：`Ctrl+Alt+S`），勾选 `"Build project automatically"`

![](/images/1px.png){:data-src="http://blog.img.r9it.com/image-86e6211b14cfa0a838a081afb3efd1b6.png" class="img-view"}

> 2、点击快捷键 `Alt+Ctrl+shift+a+/`，（如果不行，就点击`Alt+shift+a`）选择 `Registry`，打开界面。

![](/images/1px.png){:data-src="http://blog.img.r9it.com/image-f64b7ddcc8665b808354b76310b4bee6.png" class="img-view"}

3、打开界面，勾选 `compiler.automake.allow.when.app.running` 即可，如果没有这个选项，重置一下idea即可找到。

![](/images/1px.png){:data-src="http://blog.img.r9it.com/image-1b5e36884521c783a571e8c2fabf008b.png" class="img-view"}

如果还没有生效，重启 idea。

# 参考链接

* https://blog.csdn.net/qq_38762237/article/details/81094425

