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

# 3. 项目部署

在进行项目部署之前，我们需要确保已经安装了 `Git plugin` 和 `Publish Over SSH` 这两个插件，如果没有安装的话，通过菜单 `系统管理` -> `插件管理`　安装。

<img class="img-view" data-src="/images/2018/12/jenkins-04.png" src="/images/1px.png" />

在插件管理页面通过搜索关键字，找到索要安装的插件，选中安装就可以了

<img class="img-view" data-src="/images/2018/12/jenkins-05.png" src="/images/1px.png" />

由于我们的项目需要通过 `publish Over SSH` 连接服务器发布，所以我们先要配置 `Publish Over SSH`, 进入菜单 `系统管理` -> `系统设置`， 找到 
`Publish Over SSH` 添加你需要发布到的服务器的连接信息。

<img class="img-view" data-src="/images/2018/12/jenkins-06.png" src="/images/1px.png" />

__做完这些之后，记得把部署 jenkins 所在的服务器的公钥放在要部署的目标服务器的 ~/.ssh/authorized_keys 文件中.__

# 4. 添加构建任务

点击`新建任务`， 输入项目名称，选择 `构建自由风格的软件项目`，按照下图配置：

<img class="img-view" data-src="/images/2018/12/jenkins-project.png" src="/images/1px.png" />

配置好之后，在目标服务器的 Jenkins-in 目录下新建一个 xxxx-deloy.sh 也就是上图中最后一栏中填写的的项目部署脚本，这个脚本里你可以编写
任意的 shell 脚本帮你完成项目的部署，非常方便。下面贴出我的一个测试项目的部署脚本，仅供参考：

```bash
#!/bin/bash
export JAVA_HOME=/opt/jdk1.8.0_181
export CLASSPATH=./:$JAVA_HOME/lib/tools.jar:$JAVA_HOME/lib/dt.jar
export JRE_HOME=$JAVA_HOME/jre
export PATH=$PATH:$JAVA_HOME/bin

DIR=/var/www/java/test
JARFILE=test-1.0-SNAPSHOT.jar
# take a backup 
NOW=`date +%Y-%m-%d-%H-%M`

if [ ! -d $DIR/backup ];then
   mkdir -p $DIR/backup
fi

cd $DIR
# stop the service 
ps aux|grep "test"|awk '{print $2}'|xargs kill -9

mv $JARFILE backup/$JARFILE$NOW
mv -f /root/Jenkins-in/$JARFILE .

# start the service
java -jar $JARFILE > out.log &

# waiting 30 secs and print the log
if [ $? = 0 ];then
        sleep 30
        tail -n 100 out.log
fi

# remove backups left 10
cd backup/
ls -lt|awk 'NR>10{print $NF}'|xargs rm -rf

```

接下来就可以执行构建了。
