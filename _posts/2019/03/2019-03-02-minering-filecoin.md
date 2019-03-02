---
layout: post
title: IPFS 系列03-加入 Filecoin 测试网络挖矿
categories: [IPFS,区块链]
tags: [IPFS, FILECOIN, 区块链, 挖矿]
status: publish
type: post
published: true
author: blackfox
permalink: /20190302/minering-filecoin.html
keyword: Filecoin 挖矿, 加入Filecoin测试网络
desc: 如何加入 Filecoin 测试网络挖矿
---

本文我们主要介绍如何加入 Filecoin 测试网络进行挖矿。

文章导读：

* TOC
{:toc}

# 什么是 Filecoin 矿工？

在 Filecoin 没有出来之前，我们所说的矿工一般都是只区块链中的出块的矿工，也就是通过参与某个区块链网络，
与其他节点达成某种共识(比如说 POW, POS, DPOS 等)，他们负责保持区块链的有效性和安全性。__说白就是一个参与记账和执行智能合约的节点。__ 
比特币，以太坊，EOS 的矿工都是如此。

而 Filecoin 的矿工有很多种，除了上述的出块的矿工之外，还有下面几种重要的矿工：

* 存储矿工
* 检索矿工
* 修复矿工

__存储矿工__ 是filecoin网络的基础，需要硬件（矿机）和储存空间（硬盘）的支持，而且还需要抵押FIL TOKEN，通过价格策略、网络稳定性、
存储需求的网络位置等条件从存储市场抢单获取收益；同时形成的有效存储为算力获得打包区块的权利得到TOKEN奖励。
但是若矿工无法提供时空证明和复制证明就会被惩罚，扣除相应的抵押 TOKEN。所以，稳定的矿机和网络、电力等因素是存储矿工必须慎重考虑的点。

__检索矿工__ 主要是宽带资源的投入，不需要抵押，可通过为用户检索资源获取 TOKEN。

__修复矿工__ 这个在白皮书中没有怎么提及，只是在一张流程图中有标注，他们的主要工作是 `RepairOrders`

<img class="img-view" data-src="http://blog.img.r9it.com/image-4f4804f5c74f3a418b1a20af50208d73.png" src="/images/1px.png" />

更多关于矿工的工作原理我们在前面的文章 [IPFS 系列02-FILECOIN 工作原理](/20190226/how-filecoin-work.html) 中有详细的讲解，这里不在赘述。

> 注：在目前的测试网络中，官方主要关注存储矿工，因此本文主要介绍如何部署存储矿工。


# 开始挖矿

在开始挖矿之前，你需要确保自己已经搭建了一个可以运行的节点，如果你还没有成功搭建节点，
请移步 [IPFS 系列03-搭建 FILECOIN 挖矿节点](/20190227/getstart-with-filecoin.html)。

首先你需要运行 Filecoin 守护进程：

```bash
go-filecoin daemon 
```

然后打开一个新的终端，创建一个矿工，在此之前你得先保证自己钱包账户中有足够的余额(至少 100 FIL)，
创建矿工需要抵押相应的 TOKEN，根据官方的文档，十个扇区(Sector, 每个扇区256MB) 需要抵押100 FIL，然后还需要设置 Gas 价格和最大 Gas 消耗值

```bash
go-filecoin miner create 10 100 --price=0 --limit=1000 --peerid `go-filecoin id | jq -r '.ID'`
```

这里有几个参数需要解释一下：

> * 第一个参数 `(10)` 是提供存储的扇区数量
* 第二参数 `(100)` 是抵押 FIL TOKEN 数量
* --price 设置 Gas Price, 这里官方推荐设置为 0
* --limit 设置 Gas Limit, 跟以太坊里面的意思是一样的，Gas 耗费完之后会强制停止执行，避免死循环。
* --peerid 节点 ID

大概 1 分钟左右会有执行反馈，但是如果你的钱包账户余额不够的话，这里会一直阻塞(卡住)。

如果执行成功了会返回你的矿工 {ID}，并且你钱包的余额会扣除 100 FIL， 下面截图是本人执行的返回结果：

<img class="img-view" data-src="http://blog.img.r9it.com/image-3672840367bff20f54093cb77f9f492c.png" src="/images/1px.png" />

> 注：这里有一个坑，就是你每次执行上面创建矿工的脚本的时候 __不管是否执行成功，系统都会扣掉你的余额__ ，哪怕你执行的过程中用 [Ctrl + C]
杀死进程，你会发现你的余额仍然会被扣减了。我在 Github 上针对这个问题给开发团队提了一个 Bug，但是目前还没有得到回复。
[https://github.com/filecoin-project/go-filecoin/issues/2154](https://github.com/filecoin-project/go-filecoin/issues/2154){:target="_blank"}

整个 Bug 重现的过程的截图我贴在了下面：

<img class="img-view" data-src="http://blog.img.r9it.com/image-448ecd0ea315978334238c420a791d54.png" src="/images/1px.png" />

有兴趣的同学可以在自己的节点上帮我验证一下，看看这个 Bug 是否能重现，如果重现了能给个反馈，本人将非常感谢，
当然如果你碰到同样的问题，你也可以在我提的 issue 下继续追问。

接下来你就可以启动挖矿了：

```bash
go-filecoin mining start
```

如果返回 `Started mining` 则说明启动挖矿成功。

你也可以在 [矿工浏览页面](http://user.kittyhawk.wtf:8000/actors){:target="_blank"} 查看你的矿工信息，如果页面返回的矿工列表数据较多，
你可以使用你的矿工地址搜索定位到你创建的矿工：

<img class="img-view" data-src="http://blog.img.r9it.com/image-fdbe3fe46a79fec5b3686ac61f467412.png" src="/images/1px.png" />


# 浏览区块

跟以太坊一样，你可以通过两种方式去浏览区块： [区块浏览器](http://nightly.kittyhawk.wtf:8000/){:target="_blank"} 和命令行工具。

区块链浏览器使用非常简单，我们就不多介绍了，下面我们演示一下如何使用命令行去浏览区块，比如我们想要查看第一个区块的内容：

1\. 获取头区块 ID(可能有多个)

```bash
go-filecoin chain head
```
这里返回的是 JSON 格式

2\. 通过区块 ID 获取区块内容：

```bash
go-filecoin show block {BlockId}
```

<img class="img-view" data-src="http://blog.img.r9it.com/image-76300dea58e2bf9ef1d2d6f2687d02d8.png" src="/images/1px.png" />

> 注： 部分命令都支持使用 --enc=json 选项来输出可读性高的 JSON 数据格式。


# 创建要价订单(ask order)

在 Filecoin 存储市场中，存储矿工提交要价订单(ask order)，以提供有关其可用存储空间的一些详细信息。客户提交竞价订单(bid order)来说明
他们需要存储的文件信息。创建 `ask order` 需要提供以下参数：

> 1. 你的矿工地址（就是我们刚刚创建矿工所返回的地址）
2. 你的钱包地址（启动守护程序时自动创建了）
3. 你的存储空间的要价（单位：FIL/byte/block）
4. 当前 `ask order` 的有效区块数，也就是说你提交订单之后，在多少区块内是有效的。
5. 发布当前订单你愿意支付的 Gas 的价格
6. 发布当前订单你愿意消费 Gas 数量的最大值（注意： Gas 值设置的过低的话，订单可能发布失败）

如果不记得矿工地址了没有关系，它已经记录在节点的配置文档 `~/.filecoin/config.json` 中：

<img class="img-view" data-src="http://blog.img.r9it.com/image-19d54009348dfe1a4a2d9866b7cc2d01.png" src="/images/1px.png" />

发布订单的步骤：

1\. 获取矿工地址，并将其导出到变量中（你也可以直接从配置文档中复制矿工地址）：

```
export MINER_ADDR=`go-filecoin config mining.minerAddress | tr -d \"` 
```

2\. 获取矿工所有者的钱包地址，并将其导出到变量中(同样你也可以直接从配置文档中复制)：

```bash
export MINER_OWNER_ADDR=`go-filecoin miner owner $MINER_ADDR`
```

3\. 发布订单 

```bash
go-filecoin miner set-price --from=$MINER_OWNER_ADDR --miner=$MINER_ADDR --price=0 --limit=1000 0.000000001 2880
```
__参数说明：__ 0.00000001 为矿工自定义的存储价格，单位为（FIL/byte/block）每字节多少个FIL，
对 2880 个区块有效。订单的有效时长是通过区块个数计算的，假如你的订单想要发布一天，目前每个区块的间隔时间是30s，
所以一天的时间也就是：

```bash
24×60×60/30=2880
```
上述命令需要等待大概 30s(包含你的订单的区块被打包) 才会有响应，如果发布成功将返回 `ask order` 的 CID 和包含你订单的区块 Hash: 

<img class="img-view" data-src="http://blog.img.r9it.com/image-3672840367bff20f54093cb77f9f492c.png" src="/images/1px.png" />

4\. 查询订单

一旦订单发布成功之后，你立即就可以查看到你的订单，通过 `client list-asks` 查询并确认你的订单已经被添加到订单簿。

```bash 
go-filecoin client list-asks --enc=json | jq  
```

上述命令将列出所有订单，订单的数据结构如下：

```javascript
{
  "Miner": "fcqdzp28x8vnph7aedzw3pwlpwrnxjh77zayx75c5",
  "Price": "0.000000001",
  "Expiry": 33103,
  "ID": 0,
  "Error": null
}

```

<img class="img-view" data-src="http://blog.img.r9it.com/image-522a5c00ac4f392910930e5d1a2c1ef5.png" src="/images/1px.png" />

我们可以通过下面的命令来查询总共有多少订单：

```bash
go-filecoin client list-asks | wc -l
```

查询订单簿中是否包含自己刚刚发布的订单：

```bash
go-filecoin client list-asks --enc=json | grep "fcqdzp28x8vnph7aedzw3pwlpwrnxjh77zayx75c5" | jq
```

其中 `fcqdzp28x8vnph7aedzw3pwlpwrnxjh77zayx75c5` 是你的矿工地址。下图是本人执行的返回结果：

<img class="img-view" data-src="http://blog.img.r9it.com/image-8cb893cf85a0fbce34d3e755d68ae7bf.png" src="/images/1px.png" />

> 注：目前官方说明影响 `ask order` 排名的唯一因素只有价格，也就是说你的报价低就可以优先成交。
其他的关于网络、网络位置、信用值等因子后期会陆续加入。

# 接单并获得报酬

客户向拥有足够存储空间且价格低于其支付意愿的矿工提出存储交易，原则上，客户发布的是竞价订单，因此矿工们通过投标争取订单，所以客户只
跟要价最低(至少测试网络是这样)的矿工成交。

关于截至2018年12月的当前系统运行情况的几点说明：

* 目前，矿工接受客户用足够资金向他们提出的所有交易请求。付款验证是自动完成的，因此你无需采取任何行动来接受交易。
* 交易付款和付款渠道已实施。因此，矿工们需要在交易的整个生命周期内定期在指定的支付渠道中存入资金。

# 停止挖矿

如果你想在任何时候停止挖掘，你可以随时停止：

```bash
go-filecoin mining stop
```

或者你可以删除整个节点的所有数据：

```bash
rm -rf ~/.filecoin
```

__但是建议你这么做之前先至少要备份一下钱包的数据和配置文件(.filecoin/config.json)__ ，
区块数据删除了可以再同步，但是其他数据没有办法恢复。

# 参考文献

* [Mining-Filecoin](https://github.com/filecoin-project/go-filecoin/wiki/Mining-Filecoin){:target="_blank"}
* [FILECOIN解析(二) 如何加入测试网络挖矿](http://pkblog.cc/2019/02/blockchain-filecoin_02){:target="_blank"}


