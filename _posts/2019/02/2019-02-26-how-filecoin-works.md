---
layout: post
title: IPFS 系列02-Filecon 工作原理
categories: [IPFS]
tags: [IPFS, Filecon]
status: publish
type: post
published: true
author: blackfox
permalink: /20190226/how-filecoin-work.html
keyword: Filecon, IPFS
desc: Filecon 工作原理, How filecoin work
---

本文简单介绍一下 Filecoin 的工作原理以及工作流程，让读者可以对整个 Filecoin 去中心化存储解决方案有个大概的认知。如果想要详细深入了解细节的，
请阅读 Filecoin 和 IPFS 白皮书(在文末参考文献中有链接)。另外，本文为作者完全原创，转载请注明来源，谢谢。

文章导读:

* TOC
{:toc}

# 什么是 Filecoin

Filecoin 是一个去中心化的存储网络，简称 DSN(下面我们称之为 Filecoin 网络), 她将全球的闲置的存储资源转变为一个存储算法市场，
其最终目标是创建一个永久的，安全的，不受监管的新一代存储网络。

在 Filecoin 的网络里，矿工通过提供存储或者检索资源来赚钱 Token(FIL), 客户付钱给矿工存储或检索数据。

### Filecoin 与 IPFS 之间的联系

Filecoin 和 IPFS 都是 IPFS 协议实验室提出的，他们属于同门师兄弟，Filecoin 是 IPFS 的补充协议。IPFS 作为一个开源项目已经被很多系统在使用，
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

任何节点都可以同时扮演这四个角色，但也可以选择仅扮演其中某一个或者几个角色。

### Filecoin 作为区块链
区块链是一个公开的分布式账本，不依赖中央权威机构，而是由成千上万个自由节点组成的网络，每个节点都参与网络并通过特定的共识协议来达成决策。
Filecoin 作为一条公链，它记录整个 DSN 网络中所有的交易订单，复制证明，时空证明等重要的交易凭证，所有这些数据不可篡改，作为用户和矿工维权的证明。

在共识协议上 Filecoin 采用的是 POS(Proof-of-Storage) 共识算法，注意这个并不是以太坊的 POS(Proof of Stake)，前者是基于存储证明，后者是基于权益证明。
__这也说明作为 Filecoin 矿工，如果你的存储能力越强，你挖到区块的概率就会越高。__

> 值得一提的是，Filecoin 主链的架构跟以太坊设计的很相似，Filecoin 中的 message 大致相当于以太坊交易，而 Filecoin actor 与以太坊智能合约类似。
甚至还引入了以太坊中 Gas 这个概念。

这里可能有同学对 Filecoin 中的 `message` 和 `actor` 有点懵逼，这里简单解释一下，其实 message 你可以把它理解成一条信息，比如 A 向 B 转一笔账，
然后 Filecoin 就往区块链上记录一条 message, 就像以太坊上发送一笔交易(send a transaction) 一样。

Actor 比较难解释，我们先看 Filecoin 项目中源码是怎么定义 actor 的：

```go
// Actor is the central abstraction of entities in the system.
//
// Both individual accounts, as well as contracts (user & system level) are
// represented as actors. An actor has the following core functionality implemented on a system level:
// - track a Filecoin balance, using the `Balance` field
// - execute code stored in the `Code` field
// - read & write memory
// - replay protection, using the `Nonce` field
//
// Value sent to a non-existent address will be tracked as an empty actor that has a Balance but
// nil Code and Memory. You must nil check Code cids before comparing them.
//
// More specific capabilities for individual accounts or contract specific must be implemented
// inside the code.
//
// Not safe for concurrent access.
type Actor struct {
	Code    cid.Cid `refmt:",omitempty"`
	Head    cid.Cid `refmt:",omitempty"`
	Nonce   types.Uint64
	Balance *types.AttoFIL
}
```

代码注释写的很清楚，它其实就是整个区块链系统中涉及到的实体的一个抽象，学过面向对象编程的同学可以把它理解成一个基类，就像 Java 中的 Object，
它是所有其他实体的父类。这些实体包括 `Accounts`(账户), `Contracts`(智能合约)等。

`Actor` 定义一些基础字段：

* Code: 待执行的智能合约代码
* Head: 目前本人没有完全明白 Head 的作用，估计是用于通用的内存读写
* Nonce: 这个跟以太坊一样，用来对抗重放攻击
* Balance: 账户余额

> 从 `Actor` 的数据结构我们可以看出，__合约账户也是有余额的，也就是说我们也可以往合约中转入 FIL 代币，__
这个跟以太坊是一模一样，所以预测 Filecoin 的智能
合约功能应该也是比较强大的，开发者可以基于它开发强大的第三方去中心化存储的 DAPP。

# Filecoin 工作流程

接下来讲(敲)重(黑)点(板)了，不了解 Filecoin 挖矿流程的矿工不是好的程序员。毕竟假如 Filecoin 这个 DSN 网络真能稳定跑起来，
那么理论上是人人都可以是矿工的。

在讲工作流程之前我们简单介绍一下 Filecoin 中几个基本的数据结构，这对我们理解下面的挖矿流程很有帮助。

> * `Pieces:` 数据单元，是 Filecoin 网络中最小存储单位，每个 Pieces 大小为 512KB， Filecoin 会把大文件拆分成很多个 Pieces,
	交给不同的矿工存储。
* `Sectors:` 扇区，矿工提供存储空间的最小单元，也就是说在我们创建矿工的时候抵押存储空间大小必须是 Sector
的整数倍(这个后面我们在介绍如何创建矿工的时候会细讲，这里略过)。目前测试网络一个 Sector 的大小是 256MB
* `AllocationTable:` 数据分配追踪表，它记录了每个 Pieces 和 Sector 的对应关系，如某个 Pieces 存储在了哪个 Sector.
当某个 Sector 被存满(Fill)了之后，系统将会把该 Sector 封存(Sealing the Sector)，然后生成存储证明，这是一个缓慢的操作(slow, sequential operation)。
* `Orders:` 订单，系统中有两种订单，一种是竞价订单(bid order), 由客户发起，另一种是要价订单(ask order), 由矿工发起。
* `Orderbook:` 订单簿，也就是订单列表，包括 bid order 和 ask order，系统根据订单列表进行自动撮合匹配交易。
* `Pledge:` 抵押，矿工必须需要向 Filecoin 网络抵押 FIL 代币才能才能开始接受存储市场的订单。

理解一个复杂的概念最好的办法就是把它拆解成多个简单易懂的简单概念。首先我们看下 Filecoin 白皮书上提供的一张关于 DSN 网络工作流程的图片。

<img class="img-view" data-src="http://blog.img.r9it.com/image-4f4804f5c74f3a418b1a20af50208d73.png" src="/images/1px.png" />

通过这张图我们可以从横向(操作)和纵向(角色)来了解整个流程。我们对文件的操作无非就两种，存(Put)和取(Get), 而这两种操作分别对应两种角色，客户和矿工。
外加一个区块链网络和市场管理者(Manage), 这就构成了整个 Filecoin 的 `DSN` 网络，具体交易流程如下。

> （1）客户和矿工分别发送一个竞价订单和出价订单到交易市场(Market)，这里需要注意的是，如果是 bid order,
	需要注明你这个文件的存储时间(比如三个月), 以及需要备份的数量(比如 3 份)，备份数量越多，文件丢失的概率就越低，当然价格也就更高一些。

>（2）交易网络管理中心(Manage)分别验证订单是否合法，如果是竞价订单，系统会锁定客户资金，如果是出价订单，系统会锁定矿工的存储空间。

> （3）分别执行 Put.MatchOrders 和 Get.MatchOrders 进行订单撮合，成功之后会运行 Manage.AssignOrders 来标记该订单为`Deal Orders`(成交订单)，
并在 AllocationTable 中记订单的 Pieces 和 Sector 信息。

> （4）执行文件的 Put 操作，即把文件存储到矿工的硬盘，并生成 PoRep(复制证明)发送给交易网络存储到区块链。

> （5）矿工需要定期(every epoch)需要向交易网络发送PoSt(时空证明)来证明你这段时间确实存储了指定的文件，交易网络在验证之后，支付你相应费用(FIL).

至此，整个存储交易流程就完成了，__矿工需要注意的并不是你存储了数据，交易就会把币打给你，而是通过小额支付(Micro pay)的方式分次支付给你。__

```
比如 Rock 需要把他的照片一共10GB存储一年，出价 12 个 FIL 代币，然后你接了这笔订单，交易网络的 epoch 设置是一个月，那么你每个月都要向交易网络提供
这 10GB 照片的存储时空证明，交易网络验证成功之后会发送给你 1 个 FIL，下个月你还得提交证明，验证通过之后又给你发送一个币...
直到12个月后你才会收到这笔订单的所有资金。
```

__不过检索矿工是服务一次之后就可以收到订单的所有费用，因为一次检索服务执行完之后，整个交易就完成了。__


# 核心概念
整个 Filecoin 最核心的概念某过于复制证明和时空证明了，事实证明，这也是这个系统难点所在，根据 Filecoin 测试网络的测试结果来看，如何快速生成
有效的复制证明和时空证明，将是整个项目最大的挑战。本文只是对这两个概念的定义做下简单说明，如果想要研究其核心算法，请阅读下面的参考文献。

### 复制证明

复制证明（PoRep）是一种新颖的存储证明，它允许服务器（即证明者P）说服用户（即验证者V）某些数据D已被复制到其自己的唯一专用物理存储设备上了。
Filecoin 是通过一个交互协议完成：
1. 首先，证明者(矿工)承诺自己将存储 N 个数据副本到自己的物理存储设备(磁盘)
2. 然后，说服验证者(客户)自己确实存储了这些数据

### 时空证明

复制证明只能证明你当时接单的时候确实存储的用户的文件，但是矿工可能一转身就把数据转移到其他地方去了，这就是 Filecoin 中所说的外包攻击，即你自己并没有
存储客户的数据。那么如何证明你确实在这段时间内实实在在存储了指定的数据呢？ 时空证明(PoSt)就是为了解决这个问题。

简单来说就是要求存储矿工每隔一段时间(例如5分钟)来发送一次存储证明到区块链网络， 但是 Filecoin 每次交互的通信都比较复杂，有各种加密签名，如此频繁的
网络通信将会成为整个系统的瓶颈，所以需要调整 epoch(时间间隔) 的值，使系统达到一个平衡点，或者使用其他的更优的解决方案。

# 总结

不得不说，Filecoin 确实是一个伟大的构想，如果落地了将会是一个很好的去中心化存储网络的解决方案，能降低存储成本和带宽成本，
提升了资源的使用效率。但是它的整个工作流程(相对于传统的中心化存储)有点复杂了一些，还就是从技术的层面，它还有一些问题，
比如 nat 穿透问题(这是 IPFS 的问题)，PoSt 的算法也需要进一步优化才能应用到工程层面。
Filecoin 社区发展还比较快，开发者也比较活跃，说明业界对它的关注度还是
比较高的。目前开发者都在积极的帮助测试和优化项目，据说新的复制证明的生成算法已经将效率提高了接近一倍。

所以个人觉得整个项目的前途是光明的，只是通往光明的道路从来都是曲折的。

# 参考文献

* [IPFS 白皮书](https://ipfs.io/ipfs/QmR7GSQM93Cx5eAg6a6yRzNde1FQv7uL6X1o4k7zrJa3LX/ipfs.draft3.pdf)
* [Filecoin 白皮书](https://filecoin.io/filecoin.pdf)
* [How-Filecoin-Works](https://github.com/filecoin-project/go-filecoin/wiki/How-Filecoin-Works)
* [Filecoin Proofs](https://github.com/filecoin-project/specs/blob/master/proofs.md)
* [The Filecoin Storage Market](https://github.com/filecoin-project/specs/blob/master/storage-market.md)

# 其他相关博文
* [IPFS系列01-IPFS 前世今生](/20180906/ipfs-01-summary.html)
* [IPFS系列03-搭建 FILECOIN 挖矿节点](/20190227/getstart-with-filecoin.html)
* [IPFS系列04-FILECOIN 挖矿](/20190301/minering-filecoin.html)
* [区块链技术指南一](/20171218/block-chain-1.html)
* [区块链技术指南二](/20171218/block-chain-2.html)
