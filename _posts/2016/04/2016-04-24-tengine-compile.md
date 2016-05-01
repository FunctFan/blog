---
layout: post
title: ubuntu编译安装tengine
date: 2016-04-24
categories: [linux]
tags: [linux,ubuntu,tengine]
status: publish
type: post
published: true
author: blackfox
permalink: /2016-04-27/tengine-compile.html
description: ubuntu 编译安装tengine
---

安装依赖
=====

> sudo apt-get install build-essential gcc g++ libssl-dev libpcre3-dev


下载软件
=======

> wget http://tengine.taobao.org/download/tengine-2.1.0.tar.gz


编译&安装
========

> tar xvpzf tengine-2.1.0.tar.gz <br />
cd tengine/ <br />
./configure --prefix=/usr/local/tengine --user=www-data --group=www-data <br />


