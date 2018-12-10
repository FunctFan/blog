---
layout: post
title: Jenkins 搭建持续集成环境 
categories: [系统运维]
tags: [jenkins]
status: publish
type: post
published: true
author: blackfox
permalink: /20181210/install-jenkins.html 
keyword: Jenkins 安装
desc: Ubuntu 安装 Jenkins
---

Jenkins是基于Java开发的一种持续集成工具，功能非常强大，可以让程序员从繁杂的项目部署的工作中抽离出来。

# 1. Jenkins 安装

首先去官网下载安装安装包，下载地址：[https://jenkins.io/download/](https://jenkins.io/download/)

<img class="img-view" data-src="/images/2018/12/jenkins-install-01.png" src="/images/1px.png" />

你会发现，Jenkins 提供了两种不同的版本供你下载，一种是 `Long-term Support`(长期支持版本)，也就是我们常说的 LTS 版本，推荐安装这种，
另一种是周期性更新的版本，Weekly, 这中发行版迭代周期会快一些，但是通常不会很稳定.

Jenkins 针对不同的系统提供了不同的便捷安装方式，比如如果你是 Ubuntu 系统的话，就可以采用如下方式安装：

```shell
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -

sudo echo deb https://pkg.jenkins.io/debian-stable binary/ >> /etc/apt/sources.list 
sudo apt-get update
sudo apt-get install jenkins
```

不过我通常喜欢直接用最简单的方式，直接下载 `Generic Java package (.war)` 来安装。下载完成之后，直接运行：

```shell
nohup java -jar jenkins.war > output.log  &
```

这样就启动了。在浏览器地址栏输入 http://localhost:8080 就可以开始初始化安装。

当然，既然是 war 文件，你也可以直接把它丢到 tomcat 的 webapps 文件下运行。但是那样一则麻烦，二则你访问的地址就要变成
http://localhost:8080/jenkins 了。

# 2. 初始化配置

首先输入初始密码，页面有提示你初始密码的保存位置，打开密码文件，复制粘贴进来就好了。

<img class="img-view" data-src="/images/2018/12/jenkins-install-02.png" src="/images/1px.png" />

输入密码成功之后，会让你选择安装插件，新手就选择左面那个`安装推荐的插件`就OK了

<img class="img-view" data-src="/images/2018/12/jenkins-install-03.png" src="/images/1px.png" />

装完插件之后，会让你选择创建账号，你也可以先用admin，以后需要再创建新账号。

接下来就可以开始配置项目的自动部署了，这些将在下一篇文章中介绍。


