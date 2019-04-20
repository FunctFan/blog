---
layout: post
title: 解决网易云音乐需要 root 权限才能打开的问题
categories: [系统运维,小工具]
tags: [网易云音乐]
status: publish
type: post
published: true
author: blackfox
permalink: /20190419/neteasy-cloud-music-run-as-root.html
desc: ubuntu 18.04 不显示系统托盘图标, 网易云音乐需要 root 权限
---

今天发现升级到 ubuntu-18.04 之后碰到的又一个坑：网易云音乐程序无法打开了，必须通过运行超级管理员运行 `netease-cloud-music` 才能打开。
而且也无法最小化到系统托盘了。

最终解决方法如下：

> 第一步，修改 `/etc/sudoers` 文件，在最后面加一行

```bash
{user} ALL = NOPASSWD: /usr/bin/netease-cloud-music
```

这里的 `{user}` 就是你当前登录系统的用户，如果不知道请在终端运行 `whoami` 命令

**这一步修改 `sudoers` 文件要非常慎重，修改之前请先设置 root 密码，否则改错了你会非常麻烦，有 root 密码的话改错了还可以再改回来。**

> 第二步，sudo vim /usr/share/applications/netease-cloud-music.desktop

修改 `Exec=netease-cloud-music %U` 为 `Exec=sudo netease-cloud-music %U`

然后你就可以通过点击网易云音乐的图片打开播放器软件了。

# 添加系统托盘图标

接下来就是解决如何让网易云音乐的图标显示在系统托盘上，否则你一不小心关闭窗口之后不知道从哪能唤醒它。

这个也非常简单，安装一个 [TopIcons](https://extensions.gnome.org/extension/495/topicons/) 的 `GNOME` 扩展就可以解决。
不知道怎么安装的请阅读 [Ubuntu 18.04 Gnome 桌面优化](/20190418/ubuntu-18.04-gnome-optimize.html)。

安装之后在 `gnome-tweaks` 工具软件中启用该扩展就可以了。

# 参考链接

* [JoyNop's Blog](https://www.joynop.com/75.html)


