---
layout: post
title: 谈谈 EOS 的钱包，账户和权限
categories: [EOS,区块链]
tags: [EOS,钱包,区块链]
status: publish
type: post
published: true
author: blackfox
permalink: /20180919/eos-wallet-account.html
keyword: EOS 钱包, EOS 账户权限
desc: 谈谈 EOS 钱包，账户和公钥私钥之间的关系，以及 EOS 的权限模型
---

本文主要介绍 EOS 的钱包，公私钥，账户之间的关系. 以及深入剖析一下 EOS 的账户权限模型。

> 在介绍 EOS 账户钱包和账户体系之前，我们先来看看 BTC 和 ETH 的账户体系。

比特币的钱包最为简单，它使用的是 Address + privateKey + UTXO 模型

* Address: 钱包地址，由公钥生成，也是钱包的唯一标志，用来对外收款
* privateKey: 钱包私钥，非常重要，拥有私钥就等于拥有了整个钱包的控制权，用户发起交易都需要用私钥签名才能生效。
* UTXO: 未花费的交易输出，在比特币系统中，除了挖矿交易之外，每笔交易都需要有交易输入(来源)和输出(去向)，你可以理解 UTXO 在比特币系统中扮演的角色相当
于银行账户的余额。关于 UTXO 的更多信息，请阅读我的另一篇博客 [比特币中的 UTXO 和智能合约](/20180322/btc-utxo.html)

和比特币的钱包的 UTXO 不同的是，以太坊的钱包是基于账户体系的，这看起来更像我们传统的账户体系，有账户和余额的概念。当然以太坊的钱包中同样有
Address(钱包地址) 以及私钥。值得一提的是，以太坊的账户分为两种，一种是个人账户，一种是合约账户。个人账户又拥有私钥的个人控制，包括转账，发布合约，
调用合约，而合约账户由合约代码控制，你需要通过调用合约代码来对合约账户进行操作，比如向合约充值，将合约资产转出等。

下面我们看看 EOSIO 中对于钱包，账户，公钥私钥之间的关系是怎么定义的：

> 客户端： 也可以叫节点，在任何一台 PC 机上运行 nodeos 程序就自动运行了一个节点，每个节点可以创建多个钱包 

通过下面脚本创建钱包

```bash
cleos wallet creat -n {wallet_name}
```

> 秘钥：分为公钥和私钥，其中私钥用来签名，公钥用来创建账户，一个公钥可以创建多个账户。

```bash
cleos create key 

Private key: 5KUvPZsZHPjvKaakkrHMR36xNXsErPmM1h1nD3NwjCAaCfNDxQj
Public key: EOS5VUHtJb2PTpgvxEhjJ9r6pvgHfFuKeDNPHiwjDu9ZBsgCYnYM8
```

这里需要注意的是 EOS 的公钥都是以 "EOS" 开头

> 钱包： 钱包用来存储账户的私钥，一个钱包可以导入多个私钥，同时钱包自身还有一个密码，用来解锁钱包。没有钱包密码，你就无法解锁钱包，也就无法获取私钥
去操作账户。

通过下面脚本导入私钥到钱包

```bash
cleos wallet import -n {wallet_name} {private_key}
```

> 账户：和比特币，以太坊账户体系不同的是，EOS 账户是由两个公钥生成，分别代表 Owner 权限和 Active 权限。这也是 EOS 账户能够实现复杂的权限控制的原因
（这个我们后面会详细讲解 EOS 账户的权限模型）。需要注意的是，EOS 账户和钱包没有从属关系，它们是平行的，各司其职，账户用来转账，发布和调用合约，
而钱包知识用来存储账户的私钥而已。__钱包是存储在本地节点的，而账户是存储在区块链上的。__

通过下面脚本创建账户

```bash
cleos create account {creater} {account_name} {key_1} {key_2}
```

其中 {creater}  是为这个创建动作支付 EOS 的账户，公钥1和公钥2分别是两个不同权限的密钥对的公钥。

综上可知，不管是比特币，以太坊还是 EOSIO，他们在生成钱包和账户之前都必须要先生成一对 key, 制不管他们生成的算法可能个有差异。
所以秘钥是区块链账户体系的核心。

不过大家可能也发现了，EOS 的账户体系明显比 BTC 和 ETH 的账户体系复杂很多。

下面贴上一张 EOS 账户和钱包的关系图

<img class="img-view" data-src="https://upload-images.jianshu.io/upload_images/2476164-9d5f33c27746c19b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/778/format/webp" src="/images/1px.png" />


EOS 账户权限控制
========

下面我们一起来看看 EOS 是如何实现复杂的权限控制模型的。在了解账户权限之前我们先要了解 什么是 EOS 的智能合约。

我们先看看官方对 EOSIO 的智能合约的定义

> The combination of Actions and automated action handlers is how EOS.IO defines smart contracts.

由此可见，EOS.IO 的智能合约其实就是，一系列的动作以及对这些动作的自动处理的组合。

从编程的角度上看，__动作(Action)就是接口, 处理(Handler) 就是实现(程序)__ 那其实这跟以太坊的智能合约也是很相似的。所以在 EOS 中其实账户(Account) 也
只是某种特殊的合约而已，也是由 Actions 和 Handlers 组成。

### 1.账户权限的的分级

EOS 把账户(Account)权限分为以下几级
1. Owner : 最高权限，可以修改其他级别的权限
2. Active : 合约权限，可以执行合约层面的所有权限
3. Recovery : 用于恢复账户使用权。
4. Others: 其他自定义的权限级别。

这上面4种权限级别具有从属关系，低等级是高等级的子集，也就是说 Owner 具有 Active 的所有权限，而 Active 又具有 Recovery 的所有权限，一次类推

### 2.智能合约 Action 的分组

### 3.用户权限与智能合约 Action 之间的映射



