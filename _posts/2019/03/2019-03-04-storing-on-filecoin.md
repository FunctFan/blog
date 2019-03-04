---
layout: post
title:  IPFS 系列05-存储数据到 Filecoin 网络
categories: [IPFS,区块链]
tags: [Filecoin,区块链,IPFS,分布式存储]
status: publish
type: post
published: true
author: blackfox
permalink: /20190304/storing-on-filecoin.html
keyword: Filecoin 存储数据, Filecoin 挖矿
desc: 如何存储数据到 Filecoin 网络
---

本文将向你展示如何通过与存储矿工进行存储交易来存储数据到 Filecoin 存储网络。

文章导读：

* TOC
{:toc}

Filecoin 是一个去中心化的存储市场，客户端把数据存储到满足他们要求的矿工的矿机上。客户发送存储订单 ，矿工可以选择接单或者拒绝节点(假如觉得不划算)。

一旦矿工接收了订单，客户端就开始发送数据，整个存储交易就开始了。

> 注：在开始存储数据之前，你先得确保你的计算机上已经安装了 Filecoin 并且运行了守护进程。否则请先阅读我们之前的文章： 
[IPFS 系列03-搭建 FILECOIN 挖矿节点](/20190227/getstart-with-filecoin.html)


# 下载测试数据

官方的 GitHub 有个项目专门提供了各种测试数据供用户测试，直接打包下载下来即可:

[https://github.com/filecoin-project/sample-data/archive/master.zip](https://github.com/filecoin-project/sample-data/archive/master.zip)

我这里直接下载到我的 home 目录

```bash
wget https://github.com/filecoin-project/sample-data/archive/master.zip # 下载
unzip master.zip # 解压
```

# 导入数据到 Filecoin 本地实例

这里我们随便导入一张图片：

```bash
export CID=`go-filecoin client import ~/sample-data-master/camel.jpg`
```

然后我们验证是否导入成功，查看一下：

```bash
go-filecoin client cat $CID > image.png
```
打开 image.png, 如果跟导入之前一样，就说明导入成功了。

# 发送存储交易

导入数据后，你可以查看矿工提供的可用订单。__目前官方没有提供自动撮合交易服务，你需要自己手动选择存储在哪个矿工那里。__

我们先查看所有可用订单(`ask order`):

```bash
go-filecoin client list-asks --enc=json | jq
```

或者你也可以指定获取某个矿工发布的订单，比如我的矿工 ID 是 `fcqdzp28x8vnph7aedzw3pwlpwrnxjh77zayx75c5`

```bash
go-filecoin client list-asks --enc=json |grep "fcqdzp28x8vnph7aedzw3pwlpwrnxjh77zayx75c5" |jq
```

上述命令返回的是一个列表，列表元素的数据结构是 JSON 对象，我们用 jq 工具把格式化成可读性较高的格式：

```javascript
{
  "Miner": "fcqdzp28x8vnph7aedzw3pwlpwrnxjh77zayx75c5",
  "Price": "0.000000001",
  "Expiry": 36257,
  "ID": 1,
  "Error": null
}
```

你只需从列表中随便选择一个交易就 OK 了，__目前不同矿工之前唯一不同的特征就是价格，将来矿工将具有其他特征。__

创建矿工你需要传入 4 个参数：

参数名称 | 参数说明
--------|--------
{miner} | 矿工地址
{data} | 导入数据的 CID
{ask} | 订单 ID，通常为 0，但是我这里创建过两个订单，所以 ID 是1

```bash
go-filecoin client propose-storage-deal fcqdzp28x8vnph7aedzw3pwlpwrnxjh77zayx75c5 $CID 1 2880
```

如果成功则会返回 `Status: accepted` 以及 {dealID}。

> 这里需要注意的是，如果你的矿工是部署在阿里云服务器上，切记要要把 6000 端口打开，否则会出现客户端与矿工无法通信的问题。
还有就是如果你自己部署的矿工节点的节点 ID 没有在你本地的节点列表，那么你需要手动连接矿工节点。

举个栗子：我的矿工节点是部署在阿里云的，我在本地查找节点列表确实没有包含我的矿工节点，也就是说他们两目前是没有通过 P2P 连接的，所以我肯定无法把数据
存储到我的矿工节点上。那么该怎么处理呢：

1\. 在矿工节点运行 `go-filecoin id` 你可以看到该节点的 ID 详细信息

<img class="img-view" data-src="http://blog.img.r9it.com/image-6d008d1db4e2b490fc46f67973a44254.png" src="/images/1px.png" />

2\. 然后在你的客户端节点运行 `go-filecoin swarm connect {ID}` {ID} 为你的矿机节点的 ID

3\. 运行 `go-filecoin ping {ID}` 来测试两个节点是否可以通信。

<img class="img-view" data-src="http://blog.img.r9it.com/image-e3db27aa5188d026af2ebcb337492bf5.png" src="/images/1px.png" />

还有一个需要说明的是，发布存储订单的时候，大部分时候都会返回一个 `Error: error creating payment: context deadline exceeded` 的错误。

<img class="img-view" data-src="http://blog.img.r9it.com/image-1f2571674ef9a5e106549f6cd50c8efd.png" src="/images/1px.png" />

这是一个 Bug 截止本分发布为止还没有解决。有很多人提了 Bug，这里贴出一个关注度比较高的，有兴趣的同学可以了解一下：

[https://github.com/filecoin-project/go-filecoin/issues/1965](https://github.com/filecoin-project/go-filecoin/issues/1965){:target="_blank"}


# 发送数据并支付矿工

当你的存储订单提交成功的同时，`propose-storage-deal` 命令将自动将支付交易所需的资金转移到存储矿工的支付渠道(钱包地址)。__这笔资金将在整个交易生命
周期内定期分次支付给矿工。__

# 检索你的数据

# 参考文献

* [Storing-on-Filecoin](https://github.com/filecoin-project/go-filecoin/wiki/Storing-on-Filecoin)


