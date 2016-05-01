---
layout: post
title: docker学习笔记（二）
date: 2016-05-02
categories: [linux,服务器运维]
tags: [linux,docker, dockerfile]
status: publish
type: post
published: true
author: blackfox
permalink: /2016-05-02/docker-study-2.html
description: docker 入门学习笔记（二）
---

最近在研究docker，发现dockerfile很强大，初步学习了一下，这里贴上一个自己的写dockerfile

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

