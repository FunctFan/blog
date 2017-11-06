---
layout: post
title: docker学习笔记（二）
categories: [操作系统]
tags: [linux,docker, dockerfile]
status: publish
type: post
published: true
author: blackfox
permalink: /20160502/docker-study-2.html
description: docker 入门学习笔记（二）
---

Dockerfile是用来自动化创建容器的语法命令，你可以先把你要创建的容器的脚本写成dockerfile,比如创建容器，然后执行一些初始化的命令，安装初始化的的软件等等，其实就是相当一个
录播功能，你先把你要做的操作用dockerfile记录下来，不用每次创建容器都要敲一大堆的命令，省事。

Dockerfile包含创建镜像所需要的全部指令。基于在Dockerfile中的指令，我们可以使用<code>Docker build</code>命令来创建镜像。通过减少镜像和容器的创建过程来简化部署。
Dockerfile指令不区分大小写。但是，命名约定为全部大写。

这里贴上一个自己的写dockerfile

```bash
#选择镜像源
FROM ubuntu:14.04

#设置作者信息
MAINTAINER yangjian <yangjian102621@gmail.com>

#设置ubuntu源，使用阿里云的源
RUN cp /etc/apt/sources.list /etc/apt/sources.list.bak
RUN echo "deb http://mirrors.aliyun.com/ubuntu/ trusty main restricted universe multiverse" > /etc/apt/sources.list
RUN echo "deb http://mirrors.aliyun.com/ubuntu/ trusty-security main restricted universe multiverse" >> /etc/apt/sources.list 
RUN echo "deb http://mirrors.aliyun.com/ubuntu/ trusty-updates main restricted universe multiverse" >> /etc/apt/sources.list
RUN echo "deb http://mirrors.aliyun.com/ubuntu/ trusty-proposed main restricted universe multiverse" >> /etc/apt/sources.list
RUN echo "deb http://mirrors.aliyun.com/ubuntu/ trusty-backports main restricted universe multiverse" >> /etc/apt/sources.list
RUN echo "deb-src http://mirrors.aliyun.com/ubuntu/ trusty main restricted universe multiverse" >> /etc/apt/sources.list
RUN echo "deb-src http://mirrors.aliyun.com/ubuntu/ trusty-security main restricted universe multiverse" >> /etc/apt/sources.list
RUN echo "deb-src http://mirrors.aliyun.com/ubuntu/ trusty-updates main restricted universe multiverse" >> /etc/apt/sources.list
RUN echo "deb-src http://mirrors.aliyun.com/ubuntu/ trusty-proposed main restricted universe multiverse" >> /etc/apt/sources.list
RUN echo "deb-src http://mirrors.aliyun.com/ubuntu/ trusty-backports main restricted universe multiverse" >> /etc/apt/sources.list

#安装软件包
RUN apt-get update
RUN apt-get install -y openssh-server vim
RUN mkdir -p /var/run/sshd 
RUN mkdir -p /root/.ssh

RUN locale-gen zh_CN.UTF-8
RUN echo "zh_CN.UTF-8 UTF-8" >> /var/lib/locales/supported.d/local
RUN echo "en_US.UTF-8 UTF-8" >> /var/lib/locales/supported.d/local 
RUN apt-get install -y language-pack-zh-hans

#开放对外端口
EXPOSE 80 22 9000 8080

#添加文件
ADD run.sh /run.sh
ADD authorized_keys /root/.ssh/authorized_keys
ADD vimrc /root/.vimrc
RUN chmod 755 /run.sh

#解决语言包引起的perl报错
RUN echo "export LC_ALL=C" >> /root/.profile

#执行初始化命令
CMD ["/run.sh"]
```

