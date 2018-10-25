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

综上可知，不管是比特币，以太坊还是 EOSIO，他们在生成钱包和账户之前都必须要先生成一对 key, 只不过他们生成的算法可能个有差异。
所以秘钥是区块链账户体系的核心。

不过大家可能也发现了，EOS 的账户体系明显比 BTC 和 ETH 的账户体系复杂很多。

下面贴上一张 EOS 账户和钱包的关系图

<img class="img-view" data-src="/images/2018/09/account.webp" src="/images/1px.png" />


EOS 账户权限控制
========

下面我们一起来看看 EOS 是如何实现复杂的权限控制模型的。在了解账户权限之前我们先要了解 什么是 EOS 的智能合约。

我们先看看官方对 EOSIO 的智能合约的定义

> The combination of Actions and automated action handlers is how EOS.IO defines smart contracts.

由此可见，EOS.IO 的智能合约其实就是，一系列的动作以及对这些动作的自动处理的组合。

从编程的角度上看，__动作(Action)就是接口, 处理(Handler) 就是实现(程序)__ 那其实这跟以太坊的智能合约也是很相似的。所以在 EOS 中其实账户(Account) 也
只是某种特殊的合约而已，也是由 Actions 和 Handlers 组成。

回归到 EOS 账号的权限控制，EOS 是通过以下三步去实现对账户权限的精准和灵活的控制的。

* 对账户权限分级
* 对智能合约的Action(动作)分组
* 将用户权限和智能合约的 Action 之间做映射

### 1.账户权限的的分级

EOS 把账户(Account)权限分为以下几级
1. Owner : 最高权限，可以修改其他级别的权限
2. Active : 合约权限，可以执行合约层面的所有权限
3. Recovery : 用于恢复账户使用权。
4. Others: 其他自定义的权限级别。

下面是 EOS 白皮书上对 EOS 账户权限级别的示意图

<img class="img-view" data-src="/images/2018/09/permission-group-1.png" style="max-width:500px;" src="/images/1px.png" />

你可以在 Active 下面再新建自己的自定义权限分组，比如 FAMILY 和 LAWYER, FAMILY 下面又分了 FRIEND 权限组...

需要注意的是 EOS 权限级别具有从属关系，低等级是高等级的子集，比如说 Active 具有 FAMILY 的所有权限，而 FAMILY 又具有 FRIEND 所有权限, 以此类推。

EOS 采用权限阈值来判断某个操作是否满足权限要求，如下表所示：

<img class="img-view" data-src="/images/2018/09/permission-group-2.png" src="/images/1px.png" />

对这张图我做个简单的讲解，首先我们可以看到 EOS 为每个权限组都设定了阈值，也就是说阈值，当一个操作(Action)获取的权限(在 EOSIO 系统中表示为签名的个数)
满足了某个权限组(如 Active) 的阈值要求，则表示该操作是被授权成功的。

> 已上图为例子，比如 Owner 的权限阈值是 2，Owner 权限组下有两个账户 @user1 和 @user2, 他们所占的权限权重分别都是1，以为要想获取 Owner 的授权，必须同时
获得 @user1 和 @user2 的签名。

> 同样的 Active 的权限阀值是 1, 而 @user1 和 @user2 在 Active 组中所占的权重分别都为 1, 他们两任何一个人都具备单独获取 Active 权限的能力。

> 对于 Recovery 权限组, 它的权限阀值是 2, @user1, @user2, @user3 所占的权重均为 1, 意味者如果想要恢复账户，必须获得他们中三分之二的人同意才行。

> 下面还有一个交易权限组 Trade, 同理，如果想要获取交易权限，有两种方法，一种是获取 @user1 的同意(签名)，因为它的权重是 3, 而 Trade 的权限阀值也是 3, 
刚好满足，而 @user2 和 @user3 的权重都小于三。另一种方法是同时获取 @user2 和 @user3 的同意(签名), 这样 @user2 的权重为1，@user3 的权重为2，
1+2 = 3 也刚好满足 Trade 的权重阀值。

由此可见，EOS 的权限配置可以十分精准和灵活，实现很小的颗粒度控制。

### 2.智能合约 Action 的分组

同样的，我们还是先来看看 EOS 官方白皮书上的一张图：

<img class="img-view" data-src="/images/2018/09/action-group.png" style="max-width:500px;" src="/images/1px.png" />

这个图非常容易看懂，就是把合约里面定义的 Actions 分组，比如这个合约总共定义了 4 个动作(Action)

* 提现操作
* 买入操作
* 卖出操作
* 取消交易操作

我们可以把 买入, 卖出, 取消交易这三个操作划分到一个交易组(Trade Group), 把提现单独分一组，然后把他们映射到不同的权限级别下面。

### 3.用户权限与智能合约 Action 之间的映射

在对账户 Permision 分级以对及智能合约的 Action 进行分组以后，我们需要把对应的操作(Action)需要什么权限(Permission)给映射出来, 这样才能对账户的权限进行
控制。这里我们还是从 EOS 官方白皮书给出的图来分析

<img class="img-view" data-src="/images/2018/09/user-permission-mapping.png" src="/images/1px.png" />

从图上可以看出，合约做了两组权限映射：

1. 把整个合约的所有 Action(@EXCHANGE.CONTRACT) 都映射到 @user / FAMILY 权限级别下面
2. 将 @EXCHANGE.contracts/WITHDRAW(提现) 的权限映射到了 @user/LAWYER 下面.

这样 @user/LAWYER 就可以提现，但是不能交易，而 @user/FAMILY 既可以提现也可以交易。

需要注意的是对于某个 Action 的权限的映射判断也是自下而上的，比如我要判断 @user/FAMILY 是否有 @EXCHANGE.CONTRACT/BUY 权限，判断看流程如下：

1. 查看 @EXCHANGE.CONTRACT/BUY 有没有映射到 @user/FAMILY 或者 @user/FAMILY/FRIEND
2. 如果 1 返回 false, 则继续查看 @EXCHANGE.CONTRACT.TRADE 组是否有映射到 @user/FAMILY 或者 @user/FAMILY/FRIEND 
3. 如果 2 返回 false，则继续查找 @EXCHANGE.CONTRACT 有没有映射到 @user/FAMILY 或者 @user/FAMILY/FRIEND 
4. 如果还是没有找到，则说明没有权限

至此我们就把 EOS 的账户权限，以及钱包，秘钥，账户之间的关系梳理清楚了，当然这些都是个人理解，如有不同的理解，欢迎不吝赐教，邮件交流。

yangjian102621@gmail.com 


