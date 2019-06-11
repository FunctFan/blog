---
layout: post
title: "linux 安装 flashplayer"
categories: [Linux]
tags: [linux,flashpalyer]
status: publish
type: post
published: true
author: blackfox
permalink: /20150511/install-flash-player.html
description: 'ubuntu 安装 flashplayer'
---

网上看到很多结果，各种复杂，比如去ubuntu 软件中心安装，或者直接用apt-get 或者yum安装，但是这些对有的系统有用，但是经常不灵

<strong>其实很简单的，就3步就好了</strong>

第一步，去 https://get.adobe.com/cn/flashplayer/?no_redirect 下载 install_flash_player_11_linux.x86_64.tar.gz

第二步，將下载好的包拷到某个目录下并解压,将libflashplayer.so拷到firefox的插件目录/usr/lib/mozilla/plugin/下

```bash
sudo cp libflashplayer.so /usr/lib/mozilla/plugins
```

然后将usr/目录下所有文件拷到/usr下

```bash
sudo cp -r usr/* /usr
```

第三步，重启浏览器，你就可以愉快的看电影和听音乐了。
