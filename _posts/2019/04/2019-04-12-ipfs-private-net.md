---
layout: post
title: IPFS系列03-搭建 IPFS 私有网络
categories: [IPFS]
tags: [IPFS]
status: publish
type: post
published: true
author: blackfox
permalink: /20190412/ipfs-private-net.html
keyword: 
desc: 搭建 IPFS 私有网络
---

本文讲述如何使用 IPFS 搭建自己的私有存储网络，如果你对 IPFS 还了解的话，建议你先看看下面两篇文章

* [IPFS系列01-IPFS 前世今生](/20180906/ipfs-01-summary.html)
* [IPFS系列02-IPFS 与 web3.0](/20190409/ipfs-and-web3.0.html)

文章导读：
* TOC
{:toc}

# 安装 IPFS

有两种安装方式，一种是 clone [源码](https://github.com/ipfs/go-ipfs) 编译安装（前提是你已经安装了 Go 语言的运行环境）：

```bash
git clone https://github.com/ipfs/go-ipfs.git 

cd go-ipfs
make install
```

项目源码依赖较多，编译需要一定的时间，请耐心等待。另一种方法非常简单，直接下载官方编译好的可执行文件，[最新稳定版下载地址](https://github.com/ipfs/go-ipfs/releases)

官方提供各种系统发行版的下载包，我下载的是 Linux 64 位版本

![](/images/1px.png){:class="img-view" data-src="http://blog.img.r9it.com/image-79ff9674e962a52bb3b28f6afd22c98a.png"}

下载后直接解压安装

```bash
tar xzf go-ipfs_v0.4.19_linux-amd64.tar.gz

cd go-ipfs
sudo ./install.sh
```

# 启动 IPFS 节点

首先初始化节点

```bash
ipfs init

initializing IPFS node at /home/rock/.ipfs
generating 2048-bit RSA keypair...done
peer identity: QmTrA1w1ux7jW55eqC8Vu7DCRyTMqdpHA5iAZUTRt7snuN
to get started, enter:

	ipfs cat /ipfs/QmS4ustL54uo8FzR9455qaxZwuMiUhyvMcX9Ba8nUH4uVv/readme
```
初始化主要是生成节点 ID 以及生成初始的配置文档和节点数据

接下来，启动守护进程

```bash
ipfs daemon 

Initializing daemon...
go-ipfs version: 0.4.19-
Repo version: 7
System version: amd64/linux
Golang version: go1.11.5
Swarm listening on /ip4/127.0.0.1/tcp/4001
Swarm listening on /ip4/172.17.0.1/tcp/4001
Swarm listening on /ip4/192.168.0.110/tcp/4001
Swarm listening on /ip4/192.168.56.1/tcp/4001
Swarm listening on /ip6/::1/tcp/4001
Swarm listening on /p2p-circuit
Swarm announcing /ip4/127.0.0.1/tcp/4001
Swarm announcing /ip4/172.17.0.1/tcp/4001
Swarm announcing /ip4/192.168.0.110/tcp/4001
Swarm announcing /ip4/192.168.56.1/tcp/4001
Swarm announcing /ip6/::1/tcp/4001
API server listening on /ip4/127.0.0.1/tcp/5001
WebUI: http://127.0.0.1:5001/webui
Gateway (readonly) server listening on /ip4/127.0.0.1/tcp/8080
Daemon is ready
```
启动守护进程后会默认会在你的 Home 目录下创建一个 `.ipfs` 文件夹
并输出一些你的节点的配置信息，比如节点连接地址，文件访问网关，并内置提供了一个 webui 管理系统。
你通过浏览器访问 [http://127.0.0.1:5001/webui](http://127.0.0.1:5001/webui) 就可以看到管理界面。

![](/images/1px.png){:class="img-view" data-src="http://blog.img.r9it.com/image-0b2a89b86e9f1e914cee28994fb0825f.png"}

现在你就可以使用 IPFS 的客户端命令行工具来管理你的节点了。比如你可以使用下面的命令查看你节点的 `README` 文件

```bash
ipfs cat /ipfs/QmTrA1w1ux7jW55eqC8Vu7DCRyTMqdpHA5iAZUTRt7snuN/readme
```

# 搭建私有网络



# 测试

