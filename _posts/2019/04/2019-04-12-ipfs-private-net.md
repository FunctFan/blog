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

再比如添加文件

```bash
echo "hello world" > hello.txt
ipfs add hello.txt
added QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o hello.txt
 12 B / 12 B [===========================================================================================================================] 100.00%
```

# 搭建私有网络

IPFS 默认是通过一些种子连接到全球网络，但是我们现在是要搭建私有网络，所以需要先把种子节点连接信息删除。

有两种方式可以删除种子节点连接信息，一种是标准操作，直接执行命令：

```bash
ipfs bootstrap rm --all
```

另一种是暴力操作，直接从配置文档中删除 bootstrap 连接信息， `vim ~/.ipfs/config`， 找到 `bootstrap` 

```javascript
"Bootstrap": [
	"/dnsaddr/bootstrap.libp2p.io/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
	"/dnsaddr/bootstrap.libp2p.io/ipfs/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
	"/dnsaddr/bootstrap.libp2p.io/ipfs/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
	"/dnsaddr/bootstrap.libp2p.io/ipfs/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
	"/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
	"/ip4/104.236.179.241/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM",
	"/ip4/128.199.219.111/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu",
	"/ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64",
	"/ip4/178.62.158.247/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
	"/ip6/2604:a880:1:20::203:d001/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM",
	"/ip6/2400:6180:0:d0::151:6001/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu",
	"/ip6/2604:a880:800:10::4a:5001/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64",
	"/ip6/2a03:b0c0:0:1010::23:1001/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd"
],
```
直接把里面的节点全部删除就好了。这样你再重启节点之后你就是一个孤立的节点了。

接下来我们开始来搭建私有网络，我们需要启动三个节点，不管你是用三台物理机器还是虚拟机还是[新建三个容器](/20190410/run-ipfs-with-docker.html)。

假设名称分别为 ipfs-master, ipfs-node1, ipfs-node2，其中 master 为主节点(种子节点)，node1, node2 均为普通节点。

# 测试

