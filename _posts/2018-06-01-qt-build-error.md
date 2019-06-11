---
layout: post
title: Qt5构建出错问题解决办法
categories: [C/C++]
tags: [Qt5]
status: publish
type: post
published: true
author: blackfox
permalink: /20180601/qt-build-error.html
keyword: Qt5, C++
desc: Qt5构建出错问题解决办法 
---

&emsp;&emsp;最近由于项目需求，要从 Qt5.10 版本切换到 Qt5.3， 而且还需要使用windows的编译环境，由于好多年没有用windows的开发环境了，
在搭建 Qt5.3 编译环境的时候，碰到一个比较奇怪的坑, 在项目编译的时候报了一个这样的错:

```
无法启动进程 "C:\Qt\Qt5.3.2\5.3\mingw482_32\bin\qmake.exe" E:\Qt_Data\untitled\untitled.pro -r -spec win32-g++ "CONFIG+=debug"
Error while building/deploying project untitled (kit: Desktop Qt 5.3 MinGW 32bit)
When executing step 'qmake'
```

google, 百度搜了一大通，找到了一个相关的解决方案，说是编译的路径不对，也就是 build path 路劲不对:

<img class="img-view" data-src="/images/2018/06/qt-build-config.png" src="/images/1px.png" />

可是由于之前安装了 Qt5.10 的问题，我编译路径还真的是之前 Qt5.10 的路径，喜出望外的赶紧点击后面的 reset 按钮重置了 build path(如果是灰色的说明已经是重置过了)

结果已编译，还是同样的错误。

&emsp;&emsp;可能是长期使用 Linux 系统的原因, 我第一反应觉得应该可能是权限的问题，应该是 Qt 没有权限在我项目的目录创建 build directory.

果断手动创建了一个 build 目录，然后直接指定编译目录为 "build" 目录， 如下图所示，红框后面的 browse, 选择刚刚创建好的目录就 OK 了.

<img class="img-view" data-src="/images/2018/06/qt-build-config02.png" src="/images/1px.png" />

替换好之后，再次点击 build 按钮，发现问题解决了。




