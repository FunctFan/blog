---
layout: post
title: IPFS系列04-搭建 IPFS 私有网络
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

> Note: 以下操作我们默认你已经初始化三个节点，并删除了他们的 bootstrap 种子节点。

第一步，我们需要在主节点生成私有网络共享的 key，作为其他节点加入私有网络的准入凭证，没有共享 key 的节点不允许加入私有网络。

我们需要使用 [go-ipfs-swarm-key-gen](https://github.com/Kubuxu/go-ipfs-swarm-key-gen) 工具来创建共享 key。安装方式很简单：

```bash
go get -u github.com/Kubuxu/go-ipfs-swarm-key-gen/ipfs-swarm-key-gen
```

第二步，在 master 节点生成共享 key 

```bash
ipfs-swarm-key-gen > ~/.ipfs/swarm.key
```

第三部，分别拷贝 `swarm.key` 到 node1, node2 节点的 `~/.ipfs/ `目录下，然后你需要获取 master 节点的连接地址：

```bash
~$ ipfs id
{
	"ID": "QmeXkxzGxUrChcYJbuQQfw34Ze5bmQhmegTNDLtANKHWLP",
	"PublicKey": "CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCxNWcsgcNlD6DrYHLLNLeJt2y0x0mqaruSse6hhM11tcPocdJq7z03WL9Elu/sPoBZ0SfG6SKgS9xrXewNrJKIGR85qlJcv43c7/6xjP41liOpY5Gtw4UWQlEZ4gV40OZceILQFD5bnpym+bQh/3zDduvASwDOBOpNS+3liIDXpR4fDh8EWoIi4pFBqDinsIs6lkd0dJBchHnUgPT83ZKpTj1pWf+52MxNDMQq8bmI7ZioojhncZb+Qp5yrgD80XR21WtbUIfVrZyF9e5Yo+DUV1WTEWG+955Cl+3FmXP0IEkZBPZL0g5DGibS+p0XQFXqJd4rcPPw1J0Gq0fWv9VrAgMBAAE=",
	"Addresses": [
		"/ip4/127.0.0.1/tcp/4001/ipfs/QmeXkxzGxUrChcYJbuQQfw34Ze5bmQhmegTNDLtANKHWLP",
		"/ip4/192.168.1.5/tcp/4001/ipfs/QmeXkxzGxUrChcYJbuQQfw34Ze5bmQhmegTNDLtANKHWLP",
		"/ip4/192.168.1.2/tcp/4001/ipfs/QmeXkxzGxUrChcYJbuQQfw34Ze5bmQhmegTNDLtANKHWLP",
		"/ip4/172.17.0.1/tcp/4001/ipfs/QmeXkxzGxUrChcYJbuQQfw34Ze5bmQhmegTNDLtANKHWLP",
		"/ip6/::1/tcp/4001/ipfs/QmeXkxzGxUrChcYJbuQQfw34Ze5bmQhmegTNDLtANKHWLP",
		"/ip6/240e:fa:ff02:6900:dea:2285:6549:3ce0/tcp/4001/ipfs/QmeXkxzGxUrChcYJbuQQfw34Ze5bmQhmegTNDLtANKHWLP",
		"/ip6/240e:fa:ff02:6900:9bbf:20ba:9f76:5a1/tcp/4001/ipfs/QmeXkxzGxUrChcYJbuQQfw34Ze5bmQhmegTNDLtANKHWLP",
		"/ip6/240e:fa:ff85:a100::1/tcp/4001/ipfs/QmeXkxzGxUrChcYJbuQQfw34Ze5bmQhmegTNDLtANKHWLP",
		"/ip6/240e:fa:fffc:2500:dea:2285:6549:3ce0/tcp/4001/ipfs/QmeXkxzGxUrChcYJbuQQfw34Ze5bmQhmegTNDLtANKHWLP",
		"/ip6/240e:fa:fffc:2500:1702:d952:9dec:84fa/tcp/4001/ipfs/QmeXkxzGxUrChcYJbuQQfw34Ze5bmQhmegTNDLtANKHWLP",
		"/ip6/240e:fa:ff02:6900:45ce:6b27:8eae:62fb/tcp/4001/ipfs/QmeXkxzGxUrChcYJbuQQfw34Ze5bmQhmegTNDLtANKHWLP",
		"/ip6/240e:fa:ff02:6900:6ea2:555d:866e:4445/tcp/4001/ipfs/QmeXkxzGxUrChcYJbuQQfw34Ze5bmQhmegTNDLtANKHWLP"
	],
	"AgentVersion": "go-ipfs/0.4.20/",
	"ProtocolVersion": "ipfs/0.1.0"
}
```
这里你需要选择局域网的那个连接地址，一般是 `192.168` 开头，因为我的机器上有两个网卡，所以我这里有两个 IP. 随便选一个就可以了。

假设我们选择 `"/ip4/192.168.1.5/tcp/4001/ipfs/QmeXkxzGxUrChcYJbuQQfw34Ze5bmQhmegTNDLtANKHWLP"`

前面我们删除了 node1 和 node2 的种子节点，那么现在他们是孤立的节点，所以我们需要把我们的 master 节点设置成他们的种子节点，设置的方法也
有两种，一种是分别在 node1 和 node2 上执行：

```bash
ipfs bootstrap add /ip4/192.168.1.5/tcp/4001/ipfs/QmeXkxzGxUrChcYJbuQQfw34Ze5bmQhmegTNDLtANKHWLP

added /ip4/192.168.1.5/tcp/4001/ipfs/QmeXkxzGxUrChcYJbuQQfw34Ze5bmQhmegTNDLtANKHWLP
```

或者采取我们前面的粗暴的方法，直接修改 node1 和 node2 的配置文档，修改 Bootstrap 选项的值。

我们还可以在各个节点添加环境变量来使得节点启动的时候强制连接私有网络：

```bash
export LIBP2P_FORCE_PNET=1
```

设置好以后重启各个节点，你会发现在输出的日志中多了这么 2 条：

```bash
Swarm is limited to private network of peers with the swarm key
Swarm key fingerprint: c2fc00b19ee671210674155a5cf76ee8
```

说明节点现在连接的是私有网络。

# 测试

接下来我们开始测试，分别在三个节点添加文件，然后看能否在在另外两个节点下载到文件，下面我直接说下我的测试结果。

1. 在网络中的任意节点添加文件，均能在其他任意节点下载到该文件。
2. 超过 256KB 大小的文件会自动分片存储，但是并没有像我们想象中的那样会将同一个文件的分片存储到不同的节点上去，事实上不管你添加多大的文件，
即使这个文件最后被分成 100 个 piece, 最终这 100 个 piece 也只是存储在了进行添加操作的节点上，其他节点的 `.ipfs` 目录大小并没有明显的改变，
估计只有那张分布式哈希表(DHT)被同步了。
3. 其他节点在第一访问文件的时候会自动下载一份完整的文件缓存到本地节点，但是如果存储文件的那个节点停止服务，那么从其他节点将无法下载到文件。
4. 上传到 ipfs 节点的文件将被永久存储，无法删除，只要知道文件 hash，用户可以通过节点守护进程提供的网关服务访问存储的文件，访问地址为：
http://127.0.0.1:8080/ipfs/{hash} 

# 对外服务

默认 ipfs 节点提供的服务都是在本机的，如果你想要自己的节点对外提供服务(局域网或者公网)，需要修改配置文件，不要绑定本地 IP，
把 `127.0.0.1` 修改成 `0.0.0.0`

```json
"Addresses": {
  "API": "/ip4/0.0.0.0/tcp/5001",
  "Announce": [],
  "Gateway": "/ip4/0.0.0.0/tcp/8080",
  "NoAnnounce": [],
  "Swarm": [
	"/ip4/0.0.0.0/tcp/4001",
  "/ip6/::/tcp/4001"
  ]
},

```
	
如果你想要给前端调用的话，还需要配置跨域设置。

```json
"API": {
  "HTTPHeaders": {
    "Access-Control-Allow-Methods": [
      "PUT",
      "GET",
      "POST"
    ],
    "Access-Control-Allow-Origin": [
      "*"
    ]
  }
}

```

如果你想要把整个网络作为一个集群对外提供服务的话，你可以再用一个负载均衡将所有的节点罩住，简单点的用 Nginx，如果你熟悉 LVS 配置的话更好。



