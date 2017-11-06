---
layout: post
title: ubuntu server中文乱码
categories: [操作系统]
tags: [运维,ubuntu,乱码]
status: publish
type: post
published: true
author: blackfox
permalink: /20160416/ununtu-server-garbled.html
description: ubuntu server 中文乱码
---


安装中文语言包

> sudo apt-get install language-pack-zh-hans

获取语言包支持

> sudo locale-gen zh_CN.UTF-8

添加语言支持

> sudo vim /var/lib/locales/supported.d/local

添加如下内容（如果已经有了就不用再添加）：

> zh_CN.UTF-8 UTF-8 <br />
en_US.UTF-8 UTF-8

重新配置 locales

> sudo dpkg-reconfigure locales

设置默认语言
> vim /etc/environment

在文件末尾添加以下代码

> LANG="zh_CN.UTF-8" <br />
LANGUAGE="zh_CN:zh:en_US:en"


配置vim，解决vim显示中文乱码问题

> vim ~/.vimrc <br />
##添加以下配置 <br />
set fileencodings=utf-8,ucs-bom,gb18030,gbk,gb2312,cp936 <br />
set termencoding=utf-8 <br />
set encoding=utf-8 <br />
