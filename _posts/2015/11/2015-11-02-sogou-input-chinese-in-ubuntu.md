---
layout: post
title: 解决搜狗输入法在linux系统不能输入中文
categories: [Linux]
tags: [ubuntu, fcitx, idea, phpstrom]
status: publish
type: post
published: true
author: blackfox
permalink: /20151102/sogou-input-chinese.html
description: 解决搜狗输入法在linux系统不能输入中文,idea phpstorm 无法出入中文
---

今天期待已久的搜狗输入法linux版上线了，对于我们这种之前用习惯了搜狗输入法的屌丝来说是个不错的消息，于是赶紧去官网下载了一个装上了。迫不及待的试了一下，很不错，很流畅。
打中文的速度一下子快起来了。但是当我打开 idea, phpstorm, sublime 这些软件之后傻眼了，发现输入不了中文，虽然习惯了coding的时候写英文注释，但是有些复杂的逻辑还是需要
 用中文来解释会好些。于是到google搜索半天，终于找到了靠谱，简单的解决方法，在此记录一下以便后期查看

（一）如果你用 KDM, GDM, LightDM 等显示管理器，请在 ~/.xprofile 中加入以下代码；如果您用 startx 或者 Slim 启动，即使用 .xinitrc 的场合，则改在 ~/.xinitrc 中加入：

```bash
 export GTK_IM_MODULE=fcitx
 export QT_IM_MODULE=fcitx
 export XMODIFIERS="@im=fcitx"
```

 加上这些之后在gedit这些文本编辑器中可以输入中文了

（二）如果是IDE不能输入中文，比如 java-idea phpstorm等，需要在启动脚本中，idea.sh 或 phpstrom.sh 中加入

```bash
XMODIFIERS="@im=fcitx"
export XMODIFIERS
```
