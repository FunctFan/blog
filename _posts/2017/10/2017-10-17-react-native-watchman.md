---
layout: post
title: react-native 环境搭建遇到坑
categories: [react-native]
tags: [react-native, genymotion]
status: publish
type: post
published: true
author: blackfox
permalink: 20171017/react-native-watchman.html 
keyword: react-native,watchman,genymotion
desc: react-native 安装 watchman 和 genymotion  报错解决方案 
---

最近由于公司需要开发 App， 所以就折腾了一下 facebook 的 react-native，搭建环境的时候遇到一些坑，记录一下。

__1. watchman运行错误：ERROR: Unknown option --no-pretty__

可能原因：facebook 官方推荐安装由Facebook提供的监视文件系统变更的工具watchman, 但是有可能你的 npm 包下面也有 watchman 工具，导致冲突

解决办法：移除 npm 包下面的 watchman 模块

```bash
npm uninstall -g watchman
```

然后安装 facebook 官方的 watchman， 这里采用在终端中输入以下命令来编译并安装watchman:

```bash
git clone https://github.com/facebook/watchman.git
cd watchman
git checkout v4.5.0  # 这是本文发布时的最新版本
./autogen.sh
./configure --prefix=/usr/local/watchman
make
sudo make install
```

__2. 编译安装 watchman 的时候报错__

```bash
pywatchman/bser.c:31:20: fatal error: Python.h: No such file or directory
compilation terminated.
error: command 'x86_64-linux-gnu-gcc' failed with exit status 1
Makefile:2706: recipe for target 'py-build' failed
```
这是缺少 python 的开发库，安装上就好了

```bash
sudo apt-get install libxml2-dev libxslt1-dev python-dev
```

__3. 运行 genymotion 报错__ 

在安装完 genymotion-2.8.0 模拟器后运行报错：

```bash
genymotion: symbol lookup error: /usr/lib/x86_64-linux-gnu/mesa/libGL.so.1: undefined symbol: drmGetDevice
```
解决办法： 删除 genymotion 安装根目录的 libdrm.so.2 就好了

```bash
rm /opt/genymotion/libdrm.so.2
```

__附上 genymotion-2.8.0 破解版下载地址__

链接: https://pan.baidu.com/s/1hrV0bT6 密码: 8ugu



<strong>《完》</strong>





