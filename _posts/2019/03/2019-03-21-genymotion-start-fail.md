---
layout: post
title: Genymotion 启动报错 undefined symbol
categories: [系统运维, 小工具]
tags: [Genymotion, Android 模拟器]
status: publish
type: post
published: true
author: blackfox
permalink: /20190321/genymotion-start-fail.html
keyword: Genymotion 启动报错,undefined symbol, xcb_wait_for_reply64, libX11.so.6
desc: Genymotion 启动报错 undefined symbol xcb_wait_for_reply64, libX11.so.6
---

Genymotion 一款优秀的 Android模拟器 工具，它体积小，启动快，配置简单，功能强大，能快速构建出各种 Android 版本的模拟器。

本人在使用 Genymotion 创建 Android 开发终端模拟器的时候，经常会遇到启动报错：

`symbol lookup error: /usr/lib/x86_64-linux-gnu/libX11.so.6: undefined symbol: xcb_wait_for_reply64`

几次折腾无果，最后找到一个比较好的解决方案，直接删除 Genymotion 安装目录的下面的 `libxcb.so.1` 库文件就 OK 了。

```bash
cd /opt/genymotion # 本人 Genymotion 安装目录，请根据自己的具体情况更改目录
sudo mv libxcb.so.1.back libxcb.so.1 # 这里不直接删除，以免删除后无法运行还可以恢复文件
```

# 参考文献

[https://unix.stackexchange.com/questions/316787/problem-with-libx11-so-6-undefined-symbol-xcb-wait-for-reply64](https://unix.stackexchange.com/questions/316787/problem-with-libx11-so-6-undefined-symbol-xcb-wait-for-reply64)
