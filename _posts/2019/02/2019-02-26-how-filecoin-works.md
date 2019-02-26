---
layout: post
title: IPFS 系列02-FILECOIN 工作原理
categories: [IPFS]
tags: [IPFS, FILECOIN]
status: publish
type: post
published: true
author: blackfox
permalink: /20190226/how-filecoin-work.html
keyword: FILECOIN, IPFS
desc: FILECOIN 工作原理, How filecoin work
---

# 什么是 Filecoin 

Filecoin 是一个去中心化的存储网络，简称 DSN, 她将全球的闲置的存储资源转变为一个存储算法市场，其最终目标是创建一个永久的，安全的，不受监管的新一代
存储网络，实现 Web3.0 的时代。在 Filecoin 的网络里，矿工通过提供存储或者检索资源来赚钱 Token(FIL), 客户付钱给矿工存储或检索数据。

### Filecoin 与 IPFS 之间的联系

Filecoin 和 IPFS 都是又 IPFS 协议实验室提出的，他们属于同门师兄弟，Filecoin 是 IPFS 的补充协议。IPFS 作为一个开源项目已经被很多系统在使用，
它允许节点之间相互请求，传输，和存储可验证的数据，但是节点之间并没有形成一个统一的网络，各个节点都是各自存储自己认为重要的数据，
没有简单的方法可以激励他人加入网络或存储特定数据。

Filecoin 的出现就是为了解决这一关键问题，它旨在提供一个可以用来持久存储的系统，作为 IPFS 的激励层。
至于 Filecoin 是如何解决这个问题的，我们会在后面详细讲解。

# Filecoin 架构概述

Filecoin 的架构可以简单拆分成两个模块，**一个去中心化存储市场，一个是区块链**

### 去中心化的存储市场
Filecoin 的 DSN 主要包含 4 个角色：

* 存储矿工: 类似传统的 http 网站中的服务器，他们存储数据，不过在 Filecoin 中，普通的家用主机也可以用来做存储矿工。
* 检索矿工: 检索矿工可以获取数据并将其提供给客户端，类似传统的 CDN
* 存储客户端: 想要存储数据的用户
* 检索客户端: 想要获取数据的用户

任何节点都可以同时扮演这四个角色，但也可以选择仅扮演其中某几个角色。

### Filecoin 作为区块链



### 区块链

# Filecoin 工作流程

# 核心概念

# 总结

# 参考文献
* [https://filecoin.io/filecoin.pdf](https://filecoin.io/filecoin.pdf)
* [https://github.com/filecoin-project/go-filecoin/wiki/How-Filecoin-Works](https://github.com/filecoin-project/go-filecoin/wiki/How-Filecoin-Works)

