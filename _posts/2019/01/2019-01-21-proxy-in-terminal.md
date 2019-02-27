---
layout: post
title: Linux 实现终端代理
categories: [系统运维]
tags: [terminal, proxy]
status: publish
type: post
published: true
author: blackfox
permalink: /20190121/proxy-in-terminal.html
keyword: 终端代理, terminal proxy 
desc: Ubuntu 实现终端代理

---

最近在折腾 Go 语言的时候，经常需要使用 go get 来下载和安装第三方库或软件。
经常会碰到 go get 无法访问，之前在编译 EOS 主网项目的时候也常常因为无法 `clone` Github 上的一些开源项目(如 MongoDB) 而导致编译失败，
因为这些第三方库或软件或项目对应的网站在国内无法访问。所以终端代理就变得非常有必要了。

很多人都是用 shadowsocks 来翻墙（本人也是），但是 shadowsocks 是基于 socks5 协议的。
而 `go get` 和 `git clone` 都是使用 http 协议。所以我们需要一个中间代理，把 socks5 协议转为 http 协议。

在 Github 上找到一个牛人开发的项目 [cow](https://github.com/cyfdecyf/cow/), 安装之后简单配置就可以使用了。

COW 的设计目标是自动化，理想情况下用户无需关心哪些网站无法访问，可直连网站也不会因为使用二级代理而降低访问速度。

* 作为 HTTP 代理，可提供给移动设备使用；若部署在国内服务器上，可作为 APN 代理，__可使用多个二级代理，支持简单的负载均衡__
* 支持 HTTP, SOCKS5, shadowsocks 和 cow 自身作为二级代理
* 自动检测网站是否被墙，仅对被墙网站使用二级代理
* 自动生成包含直连网站的 PAC，访问这些网站时可绕过 COW 

安装方式非常简单, Linux 和 OSX 系统直接执行下面的命令：

```bash
curl -L git.io/cow | bash 
```

修改配置文档 `vim ~/.cow/rc` 

```bash
#开头的行是注释，会被忽略
# 本地 HTTP 代理地址
# 配置 HTTP 和 HTTPS 代理时请填入该地址
# 若配置代理时有对所有协议使用该代理的选项，且你不清楚此选项的含义，请勾选
# 或者在自动代理配置中填入 http://127.0.0.1:7777/pac

listen = http://127.0.0.1:7777
# SOCKS5 二级代理
proxy = socks5://127.0.0.1:1080

# HTTP 二级代理
#proxy = http://127.0.0.1:8080
#proxy = http://user:password@127.0.0.1:8080
# shadowsocks 二级代理
#proxy = ss://aes-128-cfb:password@1.2.3.4:8388
# cow 二级代理
#proxy = cow://aes-128-cfb:password@1.2.3.4:8388

```

修改终端配置 `vim ~/.bashrc`，在文件末尾加上下面代码，导出环境变量

```bash
http_proxy=http://127.0.0.1:7777
https_proxy=http://127.0.0.1:7777
```

然后启动你的 shadowsocks 代理软件。

至此，恭喜你，你的终端可以畅通无阻了。



