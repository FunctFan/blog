---
layout: post
title: spring boot maven 打包不生成可执行 jar 文件
categories: [Java]
tags: [spring-boot]
status: publish
type: post
published: true
author: blackfox
permalink: /20190726/spring-boot-not-package.html
desc: spring boot maven 打包不生成可执行 jar 文件 
--- 


> * 问题描述：spring boot 使用 maven 的 package 命令打出来的包，不是可执行 jar 包，因为包含依赖的 ja r包。
* 问题原因：打包时使用了 maven 默认的 maven-jar-plugin 插件，而不是 spring-boot-maven-plugin 插件。

### 解决方法1：pom 中必须配置 spring-boot-maven-plugin 插件，而且必须指定需要执行的目标构建

```xml
<build>
	<plugins>
		<plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.1</version>
            <configuration>
                <source>1.7</source>
                <target>1.7</target>
            </configuration>
        </plugin>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <version>${spring.boot.version}</version>
            <executions>
                <execution>
                    <goals>
                        <goal>repackage</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

### 解决方法2. 使用 spring 的 parent 来进行依赖管理，则不用指定执行构建的目标

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>1.3.6.RELEASE</version>
</parent>

<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.1</version>
            <configuration>
                <source>1.7</source>
                <target>1.7</target>
            </configuration>
        </plugin>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <version>${spring.boot.version}</version>
        </plugin>
    </plugins>
</build>
```

Note: 请避免直接使用 `mvn repackage` 命令，因为 repackage 依赖原生 maven 的 package 命令，直接执行 repackage 无法获取依赖，会导致打包失败。

# 参考连接

* https://segmentfault.com/a/1190000011240138
